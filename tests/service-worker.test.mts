import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

type WorkerListener = (event: Record<string, unknown>) => void;

async function createWorkerHarness() {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const listeners = new Map<string, WorkerListener>();
  const deletedCaches: string[] = [];
  const precachedUrls: string[] = [];
  const cachedResponses = new Map<string, unknown>();
  const fetchCalls: string[] = [];

  const cache = {
    addAll: async (urls: string[]) => {
      precachedUrls.push(...urls);
    },
    match: async (request: { url?: string } | string) =>
      cachedResponses.get(typeof request === "string" ? request : request.url ?? ""),
    put: async (request: { url?: string } | string, response: unknown) => {
      cachedResponses.set(typeof request === "string" ? request : request.url ?? "", response);
    },
  };

  const context = vm.createContext({
    URL,
    caches: {
      open: async () => cache,
      keys: async () => ["enfoca-tu-ser-shell-v1", "otra-aplicacion-v1"],
      delete: async (key: string) => {
        deletedCaches.push(key);
        return true;
      },
    },
    fetch: async (request: { url?: string } | string) => {
      const url = typeof request === "string" ? request : request.url ?? "";
      fetchCalls.push(url);
      return {
        ok: true,
        clone() {
          return this;
        },
      };
    },
    self: {
      location: { origin: "https://app.example" },
      clients: {
        claim: async () => undefined,
        openWindow: async () => undefined,
      },
      registration: { showNotification: async () => undefined },
      skipWaiting: () => undefined,
      addEventListener: (type: string, listener: WorkerListener) => {
        listeners.set(type, listener);
      },
    },
  });

  vm.runInContext(source, context, { filename: "public/sw.js" });

  return {
    listeners,
    deletedCaches,
    precachedUrls,
    cachedResponses,
    fetchCalls,
  };
}

function lifecycleEvent() {
  let pending: Promise<unknown> = Promise.resolve();
  return {
    event: {
      waitUntil(value: Promise<unknown>) {
        pending = value;
      },
    },
    done: () => pending,
  };
}

function fetchEvent(request: Record<string, unknown>) {
  let response: Promise<unknown> | null = null;
  const background: Promise<unknown>[] = [];
  return {
    event: {
      request,
      respondWith(value: Promise<unknown>) {
        response = value;
      },
      waitUntil(value: Promise<unknown>) {
        background.push(value);
      },
    },
    response: () => response,
    background,
  };
}

test("solo precachea recursos públicos y elimina la caché HTML anterior", async () => {
  const harness = await createWorkerHarness();
  const install = lifecycleEvent();
  harness.listeners.get("install")?.(install.event);
  await install.done();

  assert.equal(harness.precachedUrls.includes("/"), false);
  assert.equal(harness.precachedUrls.includes("/camino"), false);
  assert.equal(harness.precachedUrls.every((url) => /\.(?:png|webmanifest)$/.test(url)), true);

  const activate = lifecycleEvent();
  harness.listeners.get("activate")?.(activate.event);
  await activate.done();
  assert.deepEqual(harness.deletedCaches, ["enfoca-tu-ser-shell-v1"]);
});

test("no intercepta navegación, API ni Supabase", async () => {
  const harness = await createWorkerHarness();
  const requests = [
    { method: "GET", url: "https://app.example/camino", mode: "navigate", destination: "document" },
    { method: "GET", url: "https://app.example/api/progress", mode: "cors", destination: "" },
    { method: "GET", url: "https://ripstuiawirlbxneunti.supabase.co/rest/v1/profiles", mode: "cors", destination: "" },
  ];

  for (const request of requests) {
    const dispatched = fetchEvent(request);
    harness.listeners.get("fetch")?.(dispatched.event);
    assert.equal(dispatched.response(), null);
  }
  assert.deepEqual(harness.fetchCalls, []);
});

test("intercepta únicamente archivos estáticos seguros sin fallback HTML", async () => {
  const harness = await createWorkerHarness();
  const request = {
    method: "GET",
    url: "https://app.example/_next/static/chunks/app-123.js",
    mode: "cors",
    destination: "script",
  };
  const dispatched = fetchEvent(request);
  harness.listeners.get("fetch")?.(dispatched.event);

  assert.notEqual(dispatched.response(), null);
  await dispatched.response();
  await Promise.all(dispatched.background);
  assert.deepEqual(harness.fetchCalls, [request.url]);
  assert.equal(harness.cachedResponses.has(request.url), true);
  assert.equal(harness.cachedResponses.has("https://app.example/"), false);
});
