self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const getMimeType = (filename) => {
  let cleanName = filename.toLowerCase();
  if (cleanName.endsWith('.gz')) cleanName = cleanName.slice(0, -3);
  if (cleanName.endsWith('.br')) cleanName = cleanName.slice(0, -3);

  const ext = cleanName.split('.').pop() || '';
  const types = {
    'html': 'text/html; charset=utf-8',
    'htm': 'text/html; charset=utf-8',
    'js': 'text/javascript; charset=utf-8',
    'mjs': 'text/javascript; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'wav': 'audio/wav',
    'mp3': 'audio/mpeg',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'wasm': 'application/wasm',
    'data': 'application/octet-stream',
    'unityweb': 'application/octet-stream',
    'mem': 'application/octet-stream',
    'symbols': 'application/json'
  };
  return types[ext] || 'application/octet-stream';
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/local-game-play/')) {
    event.respondWith(
      caches.open('local-games-cache').then(async (cache) => {
        // 1. Direct match
        let response = await cache.match(event.request);

        // 2. Fallback matching for gzip / brotli / unityweb variants
        if (!response) {
          const rawUrl = event.request.url;
          const candidates = [
            rawUrl + '.gz',
            rawUrl + '.br',
            rawUrl + '.unityweb',
            rawUrl.replace(/\.(wasm|data|js|json)$/, '.$1.gz'),
            rawUrl.replace(/\.(wasm|data|js|json)$/, '.$1.br'),
            rawUrl.replace(/\.(wasm|data|js|json)$/, '.$1.unityweb')
          ];
          for (const cand of candidates) {
            response = await cache.match(cand);
            if (response) break;
          }
        }

        if (response) {
          const reqPath = url.pathname.toLowerCase();
          const resHeaders = new Headers(response.headers);

          // Ensure proper Content-Encoding if matched a .gz or .br file
          if (reqPath.endsWith('.gz') || (response.url && response.url.toLowerCase().endsWith('.gz'))) {
            resHeaders.set('Content-Encoding', 'gzip');
          } else if (reqPath.endsWith('.br') || (response.url && response.url.toLowerCase().endsWith('.br'))) {
            resHeaders.set('Content-Encoding', 'br');
          }

          // Ensure valid Content-Type
          const mime = getMimeType(url.pathname);
          resHeaders.set('Content-Type', mime);
          resHeaders.set('Accept-Ranges', 'bytes');
          resHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
          resHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');

          return new Response(response.body, {
            status: response.status || 200,
            statusText: response.statusText || 'OK',
            headers: resHeaders
          });
        }

        return new Response('Not found in local game cache', { 
          status: 404,
          statusText: 'Not Found',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
  }
});
