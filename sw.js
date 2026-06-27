const CACHE_NAME = 'debt-manager-v2';
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

// Network-first: โหลดใหม่ก่อน, ถ้า offline ใช้ cache
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).then(resp => {
            if (e.request.method === 'GET' && new URL(e.request.url).origin === self.location.origin) {
                const respClone = resp.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
            }
            return resp;
        }).catch(() => caches.match(e.request))
    );
});