const CACHE_NAME = 'isese-ponbele-app-v5-exact-brand';
const CORE = [
  '/',
  '/index.html',
  '/catalogue.html',
  '/herbs.html',
  '/amulets.html',
  '/dictionary.html',
  '/contact.html',
  '/store.html',
  '/brand-exact-data.js',
  '/script.js',
  '/site-main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const alwaysFresh = new Set([
    '/script.js',
    '/site-main.js',
    '/brand-exact-data.js',
    '/styles.css',
    '/favicon.svg',
    '/manifest.webmanifest',
    '/assets/isese-ponbele-logo.webp'
  ]);

  if (request.mode === 'navigate' || alwaysFresh.has(url.pathname)) {
    event.respondWith(
      fetch(request, {cache: 'no-store'})
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (request.mode === 'navigate' ? caches.match('/index.html') : Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response && response.status === 200) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
