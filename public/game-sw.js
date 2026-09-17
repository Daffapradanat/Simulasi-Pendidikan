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
    'js': 'application/javascript; charset=utf-8',
    'mjs': 'application/javascript; charset=utf-8',
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
  
  const isSimulationRequest = 
    url.pathname.startsWith('/local-game-play/') ||
    url.pathname.startsWith('/digital/simulasisains/local-game-play/') ||
    url.pathname.startsWith('/games/') ||
    url.pathname.startsWith('/digital/simulasisains/games/');

  if (isSimulationRequest) {
    event.respondWith(
      caches.open('local-games-cache').then(async (cache) => {
        // 1. Direct match in offline cache
        let response = await cache.match(event.request, { ignoreSearch: true });
        
        // 2. Build candidate URLs for offline cache resolution
        if (!response) {
          const origin = url.origin;
          const cleanPath = url.pathname.replace(/^\/digital\/simulasisains/, '');
          const pathsToCheck = [url.pathname, cleanPath];
          
          if (cleanPath.startsWith('/local-game-play/')) {
            pathsToCheck.push(cleanPath.replace('/local-game-play/', '/games/'));
          }
          if (cleanPath.startsWith('/games/')) {
            pathsToCheck.push(cleanPath.replace('/games/', '/local-game-play/'));
          }

          const candidateUrls = [];
          for (const p of pathsToCheck) {
            const base = origin + p;
            candidateUrls.push(base);

            if (p.endsWith('.gz')) {
              candidateUrls.push(origin + p.slice(0, -3));
            } else if (p.endsWith('.br')) {
              candidateUrls.push(origin + p.slice(0, -3));
            } else if (p.endsWith('.unityweb')) {
              candidateUrls.push(origin + p.slice(0, -9));
              candidateUrls.push(origin + p.slice(0, -9) + '.gz');
            }

            candidateUrls.push(base + '.gz');
            candidateUrls.push(base + '.br');
            candidateUrls.push(base + '.unityweb');

            if (/\.(wasm|data|js|json|css|mem|symbols)$/i.test(p)) {
              candidateUrls.push(origin + p.replace(/\.(wasm|data|js|json|css|mem|symbols)$/i, '.$1.gz'));
              candidateUrls.push(origin + p.replace(/\.(wasm|data|js|json|css|mem|symbols)$/i, '.$1.br'));
              candidateUrls.push(origin + p.replace(/\.(wasm|data|js|json|css|mem|symbols)$/i, '.$1.unityweb'));
            }

            if (p.endsWith('.js')) {
              candidateUrls.push(origin + p.replace(/\.js$/, '.framework.js.gz'));
              candidateUrls.push(origin + p.replace(/\.js$/, '.framework.js.br'));
              candidateUrls.push(origin + p.replace(/\.js$/, '.framework.js'));
            }
          }
          
          for (const cand of candidateUrls) {
            response = await cache.match(cand, { ignoreSearch: true });
            if (response) break;
          }
        }

        if (response) {
          const reqPath = url.pathname.toLowerCase();
          const matchedUrl = (response.url || '').toLowerCase();
          const resHeaders = new Headers(response.headers);
          
          // Ensure proper Content-Encoding
          if (reqPath.endsWith('.gz') || matchedUrl.endsWith('.gz')) {
            resHeaders.set('Content-Encoding', 'gzip');
          } else if (reqPath.endsWith('.br') || matchedUrl.endsWith('.br')) {
            resHeaders.set('Content-Encoding', 'br');
          }
          
          // Ensure valid Content-Type
          const mime = getMimeType(url.pathname.endsWith('.gz') || url.pathname.endsWith('.br') ? url.pathname : (response.url || url.pathname));
          resHeaders.set('Content-Type', mime);
          
          resHeaders.set('Accept-Ranges', 'bytes');
          resHeaders.set('Access-Control-Allow-Origin', '*');
          resHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
          resHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
          resHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
          
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: resHeaders
          });
        }
        
        // 3. Fetch from network
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok) {
            try {
              cache.put(event.request, networkResponse.clone());
            } catch (err) {}
            return networkResponse;
          }
        } catch (netErr) {}

        // 4. Server route translation fallback
        try {
          const fallbackPath = url.pathname
            .replace(/^\/digital\/simulasisains/, '')
            .replace(/^\/local-game-play\//, '/games/');
          const serverFallbackUrl = url.origin + fallbackPath + url.search;
          const networkResponse2 = await fetch(serverFallbackUrl);
          if (networkResponse2 && networkResponse2.ok) {
            try {
              cache.put(event.request, networkResponse2.clone());
            } catch (err) {}
            return networkResponse2;
          }
        } catch (netErr2) {}

        return new Response('File simulasi belum tersedia di cache lokal maupun server.', { 
          status: 404,
          statusText: 'Not Found',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
    );
  }
});
