const CACHE_NAME = "v52-terminal-v2"; // bump version to clear old cache

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./rules.html",
  "./rules.js",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
  // ⚠️ intentionally NOT caching /data/*
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ✅ ALWAYS fetch fresh data JSON (Foreign Affairs, future data files)
  if (url.origin === location.origin && url.pathname.startsWith("/data/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Normal cache-first behavior for app shell
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          // Cache same-origin GET requests
          if (
            response &&
            response.status === 200 &&
            event.request.method === "GET" &&
            url.origin === location.origin
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, copy)
            );
          }
          return response;
        })
      );
    })
  );
});
