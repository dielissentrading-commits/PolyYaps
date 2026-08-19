const CACHE = 'polyyaps-v1';
const BASE = new URL('./', self.location.href).href;
const CORE = [BASE, new URL('./manifest.webmanifest', self.location.href).href, new URL('./icon.svg', self.location.href).href];

async function precacheAppShell() {
  const cache = await caches.open(CACHE);
  await cache.addAll(CORE);
  try {
    const response = await fetch(BASE, { cache: 'no-store' });
    if (!response.ok) return;
    const html = await response.clone().text();
    await cache.put(BASE, response);
    const paths = Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g))
      .map((match) => match[1])
      .filter((path) => !path.startsWith('http') && !path.startsWith('data:'))
      .map((path) => new URL(path, BASE).href)
      .filter((url) => url.startsWith(BASE));
    await Promise.all(paths.map(async (url) => {
      try { await cache.add(url); } catch { /* optional asset */ }
    }));
  } catch {
    // CORE remains available even when optional asset discovery fails.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(BASE, copy));
          return response;
        })
        .catch(() => caches.match(BASE)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    })),
  );
});
