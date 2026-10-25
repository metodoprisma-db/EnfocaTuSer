const CACHE_NAME = "enfoca-tu-ser-static-v3";
const CACHE_PREFIX = "enfoca-tu-ser-";
const PUBLIC_ASSETS = [
  "/manifest.webmanifest",
  "/logo-enfoca-tu-ser.png",
  "/isotipo-enfoca-tu-ser.png",
  "/icon-250.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-butterfly.png",
  "/clarissa-scarlett-mentoras.png",
  "/ETS-niveles-conciencia-oruga.png",
  "/ETS-niveles-conciencia-crisalida.png",
  "/ETS-niveles-conciencia-mariposa.png",
];
const PUBLIC_ASSET_PATHS = new Set(PUBLIC_ASSETS);

function isSafeStaticRequest(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return PUBLIC_ASSET_PATHS.has(url.pathname) || url.pathname.startsWith("/_next/static/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PUBLIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (!isSafeStaticRequest(event.request)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    }),
  );
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    self.registration.showNotification("Enfoca Tu Ser", {
      body: "Hay un nuevo momento disponible cuando quieras volver.",
      icon: "/icon-512.png",
      badge: "/icon-192.png",
      tag: "enfoca-tu-ser-availability",
      data: { url: "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || "/"));
});
