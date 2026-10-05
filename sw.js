const CACHE_NAME = 'isese-ponbele-app-v20-site-clarity';
const CORE = [
  '/',
  '/index.html',
  '/orisas.html',
  '/orisa-documentary.html',
  '/catalogue.html',
  '/herbs.html',
  '/amulets.html',
  '/dictionary.html',
  '/contact.html',
  '/store.html',
  '/script.js',
  '/site-main.js',
  '/styles.css',
  '/site-professional-cleanup.css',
  '/ogun-preview-refine.css',
  '/site-clarity.css',
  '/hero-clean-v6.css',
  '/orisa-data.js',
  '/orisa-render.js',
  '/orisa-longform-1.js',
  '/orisa-longform-2.js',
  '/orisa-longform-3.js',
  '/orisa-deep-1.js',
  '/orisa-deep-2.js',
  '/orisa-deep-3.js',
  '/orisa-traditional.css',
  '/orisa-clean.css',
  '/assets/isese-ponbele-logo.png'
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
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const alwaysFresh = req.mode === 'navigate' ||
    /\.(?:css|js|png|webp|avif|svg)$/i.test(url.pathname) ||
    url.pathname === '/manifest.webmanifest';

  if (alwaysFresh) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) ||
          (req.mode === 'navigate' ? caches.match('/index.html') : Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }))
  );
});