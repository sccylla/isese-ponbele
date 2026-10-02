const CACHE_NAME = 'isese-ponbele-app-v10-full-logo';
const CORE = [
  '/',
  '/index.html',
  '/catalogue.html',
  '/herbs.html',
  '/amulets.html',
  '/dictionary.html',
  '/contact.html',
  '/store.html',
  '/script.js',
  '/site-main.js',
  '/styles.css',
  '/brand-logo-update.css',
  '/assets/isese-ponbele-logo.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;const fresh=new Set(['/script.js','/site-main.js','/styles.css','/brand-logo-update.css','/manifest.webmanifest','/assets/isese-ponbele-logo.png']);if(r.mode==='navigate'||fresh.has(u.pathname)){event.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy))}return res}).catch(async()=>await caches.match(r)||(r.mode==='navigate'?caches.match('/index.html'):Response.error())));return}event.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(r,copy))}return res})))});
