// sw.js
const CACHE = 'pimentas-v3';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/splash.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

// network-first para o restante; cache-first para estáticos pré-cacheados
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // só lida com mesma origem (seu GitHub Pages); deixa API externa (Render) direto na rede
  if (url.origin !== self.location.origin) return;

  // cache-first para os pré-cacheados
  if (PRECACHE.some(p => url.pathname.endsWith(p.replace('./','/')) || url.pathname === p)) {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
    return;
  }

  // network-first para demais rotas locais
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
