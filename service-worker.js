const CACHE_NAME = "dabba-cache-v7";
const APP_SHELL = [
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./splash-iphonese-8.png",
  "./splash-iphone11-xr.png",
  "./splash-iphonex-xs-11pro.png",
  "./splash-iphone12-13.png",
  "./splash-iphone14-15pro.png",
  "./splash-iphone13-14promax-alt.png",
  "./splash-iphone14-15promax.png",
  "./banner-progress.png",
  "./banner-chef.png",
  "./banner-basket.png",
  "./cat-curry.png",
  "./cat-noodles.png",
  "./cat-sandwich.png",
  "./cat-egg.png",
  "./cat-drink.png",
  "./cat-sweet.png",
  "./cat-other.png",
  "./mascot.glb",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isAppShell = url.origin === self.location.origin;
  if (!isAppShell) return; // let CDN/API requests pass through untouched, never cached

  const isHtmlOrNav = event.request.mode === "navigate" || url.pathname.endsWith("index.html") || url.pathname === "/" || url.pathname.endsWith("/");

  if (isHtmlOrNav) {
    // Network-first for the app itself: always fetch the latest index.html when online,
    // so updates actually reach the installed app instead of being stuck on an old cached
    // copy forever. Only fall back to cache when genuinely offline.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets (icons, splash screens) that rarely change.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
