/* HJY site service worker - network-first for app code, cache-first for photos */
const VERSION = "hjy-site-v6";
const STATIC_CACHE = VERSION + "-static";
const PHOTO_CACHE = VERSION + "-photo";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) =>
        c.addAll(["./", "./index.html", "./css/main.css", "./js/main.js", "./logo.webp", "./sham-cash.webp", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"]).catch(() => {})
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== location.origin) return;

  // Navigation -> network-first, fallback to cached page (offline / slow)
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put("./index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  const path = url.pathname;

  // App code (html/js/css) -> network-first so fixes always reach the browser.
  const isAppCode = /\.(html|js|css)$/i.test(path);
  if (isAppCode) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  const isPhoto = /^\/(photo|customer_photo|photo-stouk|gallery)\//.test(path);
  const isStatic = /\.(webp|png|jpg|jpeg|gif|svg|ico|avif)$/i.test(path);
  if (isPhoto || isStatic) {
    e.respondWith(
      caches.open(isPhoto ? PHOTO_CACHE : STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || network;
      })
    );
  }
});
