import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mergeAccountData } from "../src/lib/supabase/merge.ts";
import { createJournalPage } from "../src/lib/journal-pagination.ts";
import { SerialSyncQueue } from "../src/lib/sync-queue.ts";
import {
  accountStorageKey,
  claimGuestRecord,
  completeGuestRecord,
  guestStorageKey,
  readGuestState,
  readScopedRecord,
  writeGuestRecord,
  writeMigratedRecord,
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

test("consume datos heredados solo después de copiarlos al espacio nuevo", () => {
  const storage = memoryStorage();
  storage.setItem("legacy:v2", JSON.stringify({ journal: ["nota"] }));
  storage.setItem("legacy:v1", JSON.stringify({ journal: ["nota vieja"] }));

  assert.equal(
    writeMigratedRecord(
      storage,
      guestStorageKey(),
      { data: { journal: ["nota"] }, claimedBy: null },
      ["legacy:v2", "legacy:v1"],
    ),
    true,
  );
  assert.equal(storage.getItem("legacy:v2"), null);
  assert.equal(storage.getItem("legacy:v1"), null);
  assert.deepEqual(readScopedRecord(storage, guestStorageKey()), {
    data: { journal: ["nota"] },
    claimedBy: null,
  });
});

test("conserva los datos heredados si la copia al espacio nuevo falla", () => {
  const values = new Map([["legacy:v2", JSON.stringify({ journal: ["nota"] })]]);
  const storage: StorageLike = {
    getItem: (key) => values.get(key) ?? null,
    setItem: () => {
      throw new Error("sin espacio");
    },
    removeItem: (key) => void values.delete(key),
  };

  assert.equal(
    writeMigratedRecord(storage, guestStorageKey(), { data: {} }, [
      "legacy:v2",
    ]),
    false,
  );
  assert.notEqual(storage.getItem("legacy:v2"), null);
});

test("una reclamación interrumpida no permite que dos cuentas recuperen el mismo contenido", () => {
  const values = new Map<string, string>();
  let failGuestWrite = true;
  const storage: StorageLike = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === guestStorageKey() && failGuestWrite) {
        failGuestWrite = false;
        throw new Error("almacenamiento interrumpido");
      }
      values.set(key, value);
    },
    removeItem: (key) => void values.delete(key),
  };
  values.set(
    guestStorageKey(),
    JSON.stringify({ data: { journal: ["privado"] }, claimedBy: null }),
  );

  assert.equal(claimGuestRecord(storage, "account-a"), null);
  assert.equal(claimGuestRecord(storage, "account-b")?.claimedBy, "account-b");
  assert.equal(claimGuestRecord(storage, "account-a"), null);
});

test("una reclamación confirmada se puede reanudar tras una interrupción", () => {
  const storage = memoryStorage();
  writeScopedRecord(storage, guestStorageKey(), {
    data: { journal: ["contenido recuperable"] },
    claimedBy: null,
  });

  assert.equal(claimGuestRecord(storage, "account-a")?.claimedBy, "account-a");
  assert.deepEqual(claimGuestRecord(storage, "account-a"), {
    data: { journal: ["contenido recuperable"] },
    claimedBy: "account-a",
  });
});

test("la hidratación preserva una reclamación fallida hasta sincronizarla con su cuenta", () => {
  const storage = memoryStorage();
  const privateData = { journal: ["contenido privado"] };
  assert.equal(writeGuestRecord(storage, privateData), true);

  assert.deepEqual(claimGuestRecord(storage, "account-a"), {
    data: privateData,
    claimedBy: "account-a",
  });

  // La sincronización falla y una recarga hidrata primero el estado invitado vacío.
  assert.equal(writeGuestRecord(storage, { journal: [] }), true);
  assert.deepEqual(claimGuestRecord(storage, "account-a"), {
    data: privateData,
    claimedBy: "account-a",
  });
  assert.deepEqual(claimGuestRecord(storage, "account-b")?.data, {
    journal: [],
  });

  // El reintento confirma los datos en la cuenta correcta antes de limpiar la copia.
  writeScopedRecord(storage, accountStorageKey("account-a"), privateData);
  assert.equal(completeGuestRecord(storage, "account-a"), true);
  assert.deepEqual(
    readScopedRecord(storage, accountStorageKey("account-a")),
    privateData,
  );
  assert.equal(readScopedRecord(storage, accountStorageKey("account-b")), null);
  assert.deepEqual(claimGuestRecord(storage, "account-b")?.data, {
    journal: [],
  });
});

test("conserva por separado una reclamación pendiente y una nueva invitada", () => {
  const storage = memoryStorage();
  const firstGuest = { journal: ["reflexión de A"] };
  const nextGuest = { journal: ["reflexión nueva"] };

  assert.equal(writeGuestRecord(storage, firstGuest), true);
  assert.deepEqual(claimGuestRecord(storage, "account-a"), {
    data: firstGuest,
    claimedBy: "account-a",
  });

  // La sincronización de A queda pendiente, A cierra sesión y llega otra invitada.
  assert.equal(writeGuestRecord(storage, nextGuest), true);
  assert.deepEqual(readGuestState(storage), {
    version: 1,
    active: nextGuest,
    claims: [{ data: firstGuest, claimedBy: "account-a" }],
  });

  // Tras recargar, cada contenido continúa asociado a quien corresponde.
  assert.deepEqual(claimGuestRecord(storage, "account-a"), {
    data: firstGuest,
    claimedBy: "account-a",
  });
  assert.deepEqual(claimGuestRecord(storage, "account-b"), {
    data: nextGuest,
    claimedBy: "account-b",
  });
  assert.equal(claimGuestRecord(storage, "account-c"), null);
});

test("no informa guardado cuando falla la escritura de una nueva invitada", () => {
  const values = new Map<string, string>();
  let rejectWrites = false;
  const storage: StorageLike = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (rejectWrites) throw new Error("sin espacio");
      values.set(key, value);
    },
    removeItem: (key) => void values.delete(key),
  };

  assert.equal(writeGuestRecord(storage, { journal: ["de A"] }), true);
  assert.equal(claimGuestRecord(storage, "account-a")?.claimedBy, "account-a");
  rejectWrites = true;

  assert.equal(writeGuestRecord(storage, { journal: ["nueva"] }), false);
  assert.deepEqual(claimGuestRecord(storage, "account-a")?.data, {
    journal: ["de A"],
  });
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

test("un error de sincronización obsoleto no vuelve a aplicar datos anteriores", async () => {
  let currentRevision = 1;
  let localValue = 1;
  let releaseFirst: (() => void) | undefined;
  const synced: number[] = [];
  const queue = new SerialSyncQueue<number, number>({
    execute: async (job) => {
      if (job.revision === 1) {
        await new Promise<void>((resolve) => {
          releaseFirst = resolve;
        });
        throw new Error("respuesta obsoleta");
      }
      return job.value;
    },
    isCurrent: (job) => job.revision === currentRevision,
    onSuccess: (value) => synced.push(value),
    onError: (_error, job) => {
      localValue = job.value;
    },
  });

  queue.request({ identity: "account-a", revision: 1, value: 1 });
  await Promise.resolve();
  currentRevision = 2;
  localValue = 2;
  queue.request({ identity: "account-a", revision: 2, value: 2 });
  releaseFirst?.();
  await queue.whenIdle();

  assert.equal(localValue, 2);
  assert.deepEqual(synced, [2]);
  assert.equal(queue.hasPending(), false);
});

test("la paginación usa el cursor de la página remota y detecta una página adicional", () => {
  const remoteRows = Array.from({ length: 21 }, (_, index) => ({
    id: `remote-${String(index).padStart(2, "0")}`,
    createdAt: new Date(Date.UTC(2026, 9, 21, 12, 0, -index)).toISOString(),
  }));
  const page = createJournalPage(remoteRows, 20);

  assert.equal(page.entries.length, 20);
  assert.equal(page.hasMore, true);
  assert.deepEqual(page.cursor, {
    id: remoteRows[19].id,
    createdAt: remoteRows[19].createdAt,
  });
  assert.equal(createJournalPage(remoteRows.slice(0, 20), 20).hasMore, false);
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
