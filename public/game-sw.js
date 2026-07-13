self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const getMimeType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'wav': 'audio/wav',
    'mp3': 'audio/mpeg',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'wasm': 'application/wasm'
  };
  return types[ext] || 'application/octet-stream';
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/local-game-play/')) {
    event.respondWith(
      caches.open('local-games-cache').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // Ensure correct content type just in case
            const ct = response.headers.get('Content-Type');
            if (!ct || ct === 'application/octet-stream') {
               const mime = getMimeType(url.pathname);
               const newHeaders = new Headers(response.headers);
               newHeaders.set('Content-Type', mime);
               return new Response(response.body, {
                 status: response.status,
                 statusText: response.statusText,
                 headers: newHeaders
               });
            }
            return response;
          }
          return new Response('Not found in local cache', { status: 404 });
        });
      })
    );
  }
});
