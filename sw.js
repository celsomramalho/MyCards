const CACHE = "mycards-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./core/base.css",
  "./core/hub.css",
  "./core/shell.js",
  "./games/sobe-desce/index.html",
  "./games/sobe-desce/app.js",
  "./games/sobe-desce/styles.css",
  "./games/adivinhar-data/index.html",
  "./games/adivinhar-data/app.js",
  "./games/adivinhar-data/styles.css",
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request))));
