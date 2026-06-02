// RMVBG Service Worker — caches AI model for instant reloads
const CACHE = 'rmvbg-v2';

self.addEventListener('install', (e) => {
  console.log('[RMVBG SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[RMVBG SW] Activated');
  // Clean old caches
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Cache CDN model files so they're instant on revisit
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Cache jsDelivr CDN (AI model + library)
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached =>
          cached ||
          fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          })
        )
      )
    );
  }
  // Cache the main page shell
  if (url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached =>
          cached ||
          fetch(e.request).then(res => {
            cache.put(e.request, res.clone());
            return res;
          })
        )
      )
    );
  }
});
