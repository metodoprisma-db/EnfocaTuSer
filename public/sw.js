const CACHE_NAME = "enfoca-tu-ser-shell-v1";
const APP_SHELL = [
  "/",
  "/camino",
  "/diario",
  "/soltar",
  "/brujula",
  "/logo-enfoca-tu-ser.png",
  "/isotipo-enfoca-tu-ser.png",
  "/icon-250.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-butterfly.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.mode === "navigate") {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))),
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
