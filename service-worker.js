const CACHE_NAME = "v52-terminal-v3";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./foreign.html",
  "./rules.html",
  "./documents.html",
  "./styles.css",
  "./theme.js",
  "./app.js",
  "./foreign.js",
  "./rules.js",
  "./documents.js",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

/* ---------- Install ---------- */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ---------- Activate ---------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))
      )
    )
  );
  self.clients.claim();
});

/* ---------- Fetch ---------- */
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  /* Network-first for policy JSON */
  if (url.pathname.startsWith("/data/")) {
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return resp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  /* Cache-first for everything else */
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(resp => {
        if (req.method === "GET" && url.origin === location.origin) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return resp;
      });
    })
  );
});
