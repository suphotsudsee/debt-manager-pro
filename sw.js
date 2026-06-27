const CACHE_NAME = 'debt-manager-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            return cached || fetch(e.request).then(resp => {
                // Cache same-origin GET requests
                if (e.request.method === 'GET' && new URL(e.request.url).origin === self.location.origin) {
                    const respClone = resp.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
                }
                return resp;
            }).catch(() => cached);
        })
    );
});