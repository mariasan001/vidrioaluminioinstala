const CACHE = "avi-panel-v5";
const FILES = ["/panel/app.js", "/panel/gsap.min.js", "/panel/manifest.json", "/panel/favicon.png", "/panel/icon-192.png", "/panel/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || !url.pathname.startsWith("/panel/")) {
    return;
  }

  if (url.pathname.includes(".php")) {
    return;
  }

  const cacheable = url.pathname.endsWith(".js") || url.pathname.endsWith(".png") || url.pathname.endsWith(".json");

  if (!cacheable) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }

        return response;
      })
      .catch(() => caches.match(request))
  );
});
