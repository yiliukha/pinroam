const CACHE = 'pinroam-v3';
const SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', e => {
  // Cache only local shell assets — CDN/API assets cache lazily on first fetch.
  // addAll with CDN URLs would fail if any CDN is slow and break the whole SW install.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Never intercept API / map tile / external auth requests
  if (
    url.includes('wikidata.org') ||
    url.includes('google.com') ||
    url.includes('openstreetmap.org') ||
    url.includes('googleapis.com') ||
    url.includes('maps.google')
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  // Cache-first for everything else; always fall back to network then a safe error
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok && e.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
