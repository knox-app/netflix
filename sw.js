const CACHE_NAME = 'hotstar-offline-shell-v2';
const DOWNLOAD_PAGE_URL = new URL('./download.html', self.location.href).href;

// 1. Immediately cache download.html on first install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(DOWNLOAD_PAGE_URL))
  );
  self.skipWaiting(); // Activate immediately without waiting for reload
});

// 2. Clean old caches & take control of open pages right away
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Serve download.html locally (even with ?play=... query params) + update in background when online
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.endsWith('/download.html') || url.pathname === '/download.html') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse =
          (await cache.match(event.request, { ignoreSearch: true })) ||
          (await cache.match(DOWNLOAD_PAGE_URL));

        const networkFetch = fetch(event.request)
          .then((res) => {
            if (res && res.ok) {
              cache.put(DOWNLOAD_PAGE_URL, res.clone());
            }
            return res;
          })
          .catch(() => null);

        // Return cached page immediately if available; otherwise wait for network
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // Optional: also cache Google Fonts CSS/font files so styling stays identical offline
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const res = await fetch(event.request);
          if (res && res.ok) cache.put(event.request, res.clone());
          return res;
        } catch (e) {
          return new Response('', { status: 200 });
        }
      })
    );
  }
});
