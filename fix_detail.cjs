const fs = require('fs');
let content = fs.readFileSync('src/frontend/views/DetailView.tsx', 'utf8');

// 1. Fix JSZip extraction logic
const oldZipLogic = `
          const zip = await JSZip.loadAsync(blob);
          const promises = [];
          
          for (const [filename, zipEntry] of Object.entries(zip.files)) {
            if (!zipEntry.dir) {
              promises.push(
                zipEntry.async('blob').then(fileBlob => {
                  const headers = new Headers();
                  headers.set('Content-Type', getMimeType(filename));
                  
                  const cleanName = filename.toLowerCase();
                  if (cleanName.endsWith('.gz')) headers.set('Content-Encoding', 'gzip');
                  if (cleanName.endsWith('.br')) headers.set('Content-Encoding', 'br');
                  
                  const res = new Response(fileBlob, { headers });
                  return cache.put(new Request(gamePrefix + filename), res);
                })
              );
            }
          }
          
          await Promise.all(promises);
          if (isMounted) {
            setDownloadingGame(false);
            setLocalGameSrc(gamePrefix + 'index.html');
          }
`;

const newZipLogic = `
          const zip = await JSZip.loadAsync(blob);
          
          let indexPath = '';
          const filenames = Object.keys(zip.files);
          const possibleIndexFiles = filenames.filter(f => f.toLowerCase().endsWith('index.html') && !f.includes('__MACOSX'));
          
          if (possibleIndexFiles.length > 0) {
            possibleIndexFiles.sort((a, b) => {
              const depthA = a.split('/').length;
              const depthB = b.split('/').length;
              if (depthA !== depthB) return depthA - depthB;
              return a.length - b.length;
            });
            indexPath = possibleIndexFiles[0];
          } else {
            throw new Error('index.html not found in the ZIP package');
          }

          const promises = [];
          for (const [filename, zipEntry] of Object.entries(zip.files)) {
            if (!zipEntry.dir && !filename.includes('__MACOSX')) {
              const encodedFilename = filename.split('/').map(encodeURIComponent).join('/');
              const fullPath = gamePrefix + encodedFilename;
              
              promises.push(
                zipEntry.async('blob').then(fileBlob => {
                  const headers = new Headers();
                  headers.set('Content-Type', getMimeType(filename));
                  
                  const cleanName = filename.toLowerCase();
                  if (cleanName.endsWith('.gz')) headers.set('Content-Encoding', 'gzip');
                  if (cleanName.endsWith('.br')) headers.set('Content-Encoding', 'br');
                  
                  const res = new Response(fileBlob, { headers });
                  return cache.put(new Request(fullPath), res);
                })
              );
            }
          }
          
          await Promise.all(promises);
          if (isMounted) {
            setDownloadingGame(false);
            const finalUrl = gamePrefix + indexPath.split('/').map(encodeURIComponent).join('/');
            setLocalGameSrc(finalUrl);
          }
`;

content = content.replace(oldZipLogic, newZipLogic);

// Replace the first cache check (checking for manifest/index.html)
const oldCacheCheck = `          let response = await cache.match(gamePrefix + 'index.html', { ignoreSearch: true });
          
          if (response) {
            if (isMounted) setLocalGameSrc(gamePrefix + 'index.html');
            return;
          }`;

const newCacheCheck = `          const cachedRequests = await cache.keys();
          let foundIndexReq = cachedRequests.find(req => req.url.startsWith(getBaseUrl() + gamePrefix.substring(1)) && req.url.toLowerCase().endsWith('index.html'));
          if (!foundIndexReq) {
            foundIndexReq = cachedRequests.find(req => req.url.includes(gamePrefix) && req.url.toLowerCase().endsWith('index.html'));
          }
          
          if (foundIndexReq) {
            if (isMounted) setLocalGameSrc(foundIndexReq.url);
            return;
          }`;

content = content.replace(oldCacheCheck, newCacheCheck);

// 2. Remove player frame header
const oldPlayerFrame = `                      {activeGameId !== null && (
                        <div id="webgl-simulation-player" className="modern-webgl-frame">
                          <div className="webgl-frame-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Memutar:</span>
                              <strong style={{ fontSize: '13.5px', color: '#f8fafc' }}>{activeGame?.title}</strong>
                              <span style={{ fontSize: '11px', background: '#15803d', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                Aktif
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                className="btn btn-sm"
                                onClick={() => {
                                  const current = localGameSrc;
                                  setLocalGameSrc(null);
                                  setTimeout(() => setLocalGameSrc(current), 50);
                                }}
                                style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '4px 8px', fontSize: '12px', borderRadius: '6px' }}
                                title="Muat Ulang Simulasi"
                              >
                                <i className="ti ti-reload"></i>
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={onCloseGame}
                                style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <i className="ti ti-x"></i> Tutup
                              </button>
                            </div>
                          </div>
                          <div style={{ width: '100%', aspectRatio: '16/9', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activeGame?.path ? (`;

const newPlayerFrame = `                      {activeGameId !== null && (
                        <div id="webgl-simulation-player" className="modern-webgl-frame" style={{ border: 'none', overflow: 'hidden', borderRadius: '12px' }}>
                          <div style={{ width: '100%', aspectRatio: '16/9', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activeGame?.path ? (`;

content = content.replace(oldPlayerFrame, newPlayerFrame);

fs.writeFileSync('src/frontend/views/DetailView.tsx', content);
