/* HJY site service worker - cache-first for static assets & photos */
const VERSION = "hjy-site-v1";
const STATIC_CACHE = VERSION + "-static";
const PHOTO_CACHE = VERSION + "-photo";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) =>
        c.addAll(["./", "./index.html", "./css/main.css", "./js/main.js", "./logo.webp", "./sham-cash.webp"]).catch(() => {})
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
  const isPhoto = /^\/(photo|customer_photo|photo-stouk)\//.test(path);
  const isStatic = /\.(css|js|webp|png|jpg|jpeg|gif|svg|ico)$/i.test(path);
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
