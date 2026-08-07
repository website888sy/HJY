const CACHE_NAME = 'hjy-admin-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/admin.css',
  './js/admin.js',
  '../logo.webp',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(urlsToCache.map(url => cache.add(url)));
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});