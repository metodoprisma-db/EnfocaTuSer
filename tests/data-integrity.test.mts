import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mergeAccountData } from "../src/lib/supabase/merge.ts";
import { SerialSyncQueue } from "../src/lib/sync-queue.ts";
import {
  accountStorageKey,
  claimGuestRecord,
  guestStorageKey,
  readScopedRecord,
  writeScopedRecord,
  type StorageLike,
} from "../src/lib/storage-scope.ts";

function memoryStorage(): StorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

test("mantiene cuentas separadas en un navegador compartido", () => {
  const storage = memoryStorage();
  writeScopedRecord(storage, accountStorageKey("account-a"), { owner: "a" });
  writeScopedRecord(storage, accountStorageKey("account-b"), { owner: "b" });

  assert.deepEqual(readScopedRecord(storage, accountStorageKey("account-a")), {
    owner: "a",
  });
  assert.deepEqual(readScopedRecord(storage, accountStorageKey("account-b")), {
    owner: "b",
  });
});

test("los datos invitados solo pueden ser reclamados por una cuenta", () => {
  const storage = memoryStorage();
  writeScopedRecord(storage, guestStorageKey(), {
    data: { journal: ["contenido privado"] },
    claimedBy: null,
  });

  assert.equal(claimGuestRecord(storage, "account-a")?.claimedBy, "account-a");
  assert.equal(claimGuestRecord(storage, "account-b"), null);
});

test("serializa escrituras consecutivas y no aplica respuestas antiguas", async () => {
  const started: number[] = [];
  const resolvers: Array<() => void> = [];
  const applied: number[] = [];
  let currentRevision = 1;

  const queue = new SerialSyncQueue<number, number>({
    execute: async (job) => {
      started.push(job.revision);
      await new Promise<void>((resolve) => resolvers.push(resolve));
      return job.value;
    },
    isCurrent: (job) => job.revision === currentRevision,
    onSuccess: (value) => applied.push(value),
    onError: () => undefined,
  });

  queue.request({ identity: "account-a", revision: 1, value: 1 });
  await Promise.resolve();
  currentRevision = 2;
  queue.request({ identity: "account-a", revision: 2, value: 2 });
  resolvers.shift()?.();
  await Promise.resolve();
  await Promise.resolve();
  resolvers.shift()?.();
  await queue.whenIdle();

  assert.deepEqual(started, [1, 2]);
  assert.deepEqual(applied, [2]);
});

test("conserva una escritura fallida y la reintenta al volver la conexión", async () => {
  let online = false;
  let attempts = 0;
  const applied: string[] = [];
  const queue = new SerialSyncQueue<string, string>({
    execute: async (job) => {
      attempts += 1;
      if (!online) throw new Error("offline");
      return job.value;
    },
    isCurrent: () => true,
    onSuccess: (value) => applied.push(value),
    onError: () => undefined,
  });

  queue.request({ identity: "account-a", revision: 1, value: "nota" });
  await queue.whenIdle();
  assert.equal(queue.hasPending(), true);

  online = true;
  queue.retry();
  await queue.whenIdle();

  assert.equal(attempts, 2);
  assert.deepEqual(applied, ["nota"]);
});

test("ignora la respuesta de una cuenta anterior tras cambiar de identidad", async () => {
  let activeIdentity = "account-a";
  let releaseA: (() => void) | undefined;
  const applied: string[] = [];
  const queue = new SerialSyncQueue<string, string>({
    execute: async (job) => {
      if (job.identity === "account-a") {
        await new Promise<void>((resolve) => {
          releaseA = resolve;
        });
      }
      return job.value;
    },
    isCurrent: (job) => job.identity === activeIdentity,
    onSuccess: (value) => applied.push(value),
    onError: () => undefined,
  });

  queue.request({ identity: "account-a", revision: 1, value: "a" });
  await Promise.resolve();
  activeIdentity = "account-b";
  queue.request({ identity: "account-b", revision: 1, value: "b" });
  releaseA?.();
  await queue.whenIdle();

  assert.deepEqual(applied, ["b"]);
});

test("un fallo de la cuenta anterior no bloquea la cuenta nueva", async () => {
  let activeIdentity = "account-a";
  let releaseA: (() => void) | undefined;
  const applied: string[] = [];
  const queue = new SerialSyncQueue<string, string>({
    execute: async (job) => {
      if (job.identity === "account-a") {
        await new Promise<void>((resolve) => {
          releaseA = resolve;
        });
        throw new Error("fallo de A");
      }
      return job.value;
    },
    isCurrent: (job) => job.identity === activeIdentity,
    onSuccess: (value) => applied.push(value),
    onError: () => undefined,
  });

  queue.request({ identity: "account-a", revision: 1, value: "a" });
  await Promise.resolve();
  activeIdentity = "account-b";
  queue.request({ identity: "account-b", revision: 1, value: "b" });
  releaseA?.();
  await queue.whenIdle();

  assert.deepEqual(applied, ["b"]);
  assert.equal(queue.hasPending(), false);
});

test("los tombstones vencen a filas remotas y la evaluación más nueva gana", () => {
  const merged = mergeAccountData(
    {
      progress: [],
      practiceSessions: [],
      journalEntries: [],
      assessments: [
        { id: "local", stage: "initial", createdAt: "2026-10-21T12:00:00Z" },
      ],
      pendingJournalDeletes: ["deleted-entry"],
      pendingProgressDeletes: [],
    },
    {
      progress: [],
      practiceSessions: [],
      journalEntries: [
        { id: "deleted-entry", createdAt: "2026-10-20T12:00:00Z" },
      ],
      assessments: [
        { id: "remote", stage: "initial", createdAt: "2026-10-20T12:00:00Z" },
      ],
    },
  );

  assert.deepEqual(merged.journalEntries, []);
  assert.equal(merged.assessments[0]?.id, "local");
});

test("el esquema conserva RLS forzada y validaciones de pertenencia", () => {
  const schema = readFileSync(
    new URL("../supabase/schema.sql", import.meta.url),
    "utf8",
  );
  const tables = [
    "profiles",
    "user_progress",
    "practice_sessions",
    "journal_entries",
    "user_assessments",
    "app_announcements",
  ];

  for (const table of tables) {
    assert.match(
      schema,
      new RegExp(`alter table public\\.${table} enable row level security`),
    );
    assert.match(
      schema,
      new RegExp(`alter table public\\.${table} force row level security`),
    );
  }
  assert.match(schema, /auth\.jwt\(\) ->> 'email'/);
  assert.match(schema, /practice\.user_id = \(select auth\.uid\(\)\)/);
  assert.doesNotMatch(schema, /service_role/);
});
