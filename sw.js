const CACHE = "cartas-hub-v30";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./manifest.json", "./icon.svg",
  "./registry.js",
  "./core/main.js", "./core/router.js", "./core/hub.js", "./core/storage.js", "./core/utils.js",
  "./games/sobe-desce/game.js",
  "./games/adivinhar-data/game.js", "./games/adivinhar-data/styles.css"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request))));
