// Service worker: funciona offline. Red primero para navegación e index.html (para recibir actualizaciones de inmediato).
// Versión: v24 (actualización automática y claims instantáneo)
const CACHE = 'tuki-speak-v24';
const KEEP = [CACHE, 'tuki-tts-v1']; // tuki-tts-v1: audio de voces en la nube guardado por la app
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting' || (e.data && e.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => !KEEP.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const act = e.action;
  if (act === 'close') return;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      for (const client of cs) {
        if ('focus' in client) {
          client.focus();
          if (act === 'practice') client.postMessage({ type: 'GOTO_PRACTICE' });
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(act === 'practice' ? './#practice' : './');
    })
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // no tocar Gemini, OpenAI, Azure ni otros dominios

  // RED PRIMERO para navegación, raíz (/), index.html y sw.js para que las actualizaciones se detecten inmediatamente
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html') || url.pathname.endsWith('sw.js')) {
    e.respondWith(
      fetch(req)
        .then(r => {
          if (r.ok) {
            const cp = r.clone();
            caches.open(CACHE).then(c => c.put(req, cp));
          }
          return r;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html') || caches.match('/index.html')))
    );
    return;
  }

  // Caché primero para assets con hash (/assets/...)
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      if (res.ok && res.status === 200) {
        const cp = res.clone();
        caches.open(CACHE).then(c => c.put(req, cp));
      }
      return res;
    }))
  );
});
