const CACHE = 'pimentas-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/splash.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  // Não cacheia POST (ex.: /detect)
  if (request.method !== 'GET') return;

  // Stale-while-revalidate para imagens e JSON
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request).then(networkRes => {
      // Apenas GET 200
      if (networkRes && networkRes.status === 200) {
        cache.put(request, networkRes.clone());
      }
      return networkRes;
    }).catch(() => cached); // offline → serve cache se tiver
    return cached || fetchPromise;
  })());
});
