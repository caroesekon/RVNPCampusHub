self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/socket.io/')) return;
  event.respondWith(fetch(event.request));
});