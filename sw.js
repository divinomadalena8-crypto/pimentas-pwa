const CACHE_NAME = 'pimentas-app-v1';
// Adicione aqui os arquivos que seu app precisa para carregar
const cacheFiles = [
  '/',
  '/index.html',
  '/style.css', // Exemplo: seu arquivo CSS
  '/main.js',   // Exemplo: seu arquivo JS
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Instala o Service Worker e salva os arquivos no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto. Adicionando arquivos...');
        return cache.addAll(cacheFiles);
      })
  );
});

// 2. Intercepta os pedidos (AQUI ESTÁ A MUDANÇA!)
self.addEventListener('fetch', (event) => {
  
  // *** A CORREÇÃO ESTÁ AQUI ***
  // Se for um pedido POST ou um pedido para a API, 
  // não tente usar o cache. Apenas busque na rede.
  if (event.request.method === 'POST' || event.request.url.includes('/predict')) {
    // Apenas deixa a requisição passar, como se o service worker
    // não existisse para este pedido.
    return fetch(event.request);
  }

  // Para todos os outros pedidos (GET para HTML, CSS, JS), 
  // use a estratégia "Cache-First"
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se tiver no cache, retorna do cache.
        if (response) {
          return response;
        }
        // Se não, busca na rede (normal).
        return fetch(event.request);
      })
  );
});
