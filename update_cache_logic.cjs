const fs = require('fs');
let content = fs.readFileSync('src/frontend/views/DetailView.tsx', 'utf8');

const oldCheck = `          const cachedRequests = await cache.keys();
          let foundIndexReq = cachedRequests.find(req => req.url.startsWith(getBaseUrl() + gamePrefix.substring(1)) && req.url.toLowerCase().endsWith('index.html'));
          if (!foundIndexReq) {
            foundIndexReq = cachedRequests.find(req => req.url.includes(gamePrefix) && req.url.toLowerCase().endsWith('index.html'));
          }
          
          if (foundIndexReq) {
            if (isMounted) setLocalGameSrc(foundIndexReq.url);
            return;
          }`;

const newCheck = `          // Validate using a manifest file to ensure full extraction was successful
          const manifestResponse = await cache.match(gamePrefix + 'manifest.json');
          if (manifestResponse) {
            try {
              const manifest = await manifestResponse.json();
              if (manifest.status === 'ready' && manifest.entryPoint) {
                if (isMounted) setLocalGameSrc(gamePrefix + manifest.entryPoint);
                return;
              }
            } catch(e) {
              // Manifest corrupted, proceed to re-download
            }
          }`;

content = content.replace(oldCheck, newCheck);

const oldZipExtract = `          for (const [filename, zipEntry] of Object.entries(zip.files)) {
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
          }`;

const newZipExtract = `          const extractedFilesCount = [];
          for (const [filename, zipEntry] of Object.entries(zip.files)) {
            if (!zipEntry.dir && !filename.includes('__MACOSX')) {
              extractedFilesCount.push(filename);
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
          
          // Create and store manifest AFTER all files are successfully cached
          const encodedEntryPoint = indexPath.split('/').map(encodeURIComponent).join('/');
          const manifestData = {
            simulationId: activeGameId,
            status: 'ready',
            entryPoint: encodedEntryPoint,
            filesCount: extractedFilesCount.length,
            timestamp: Date.now()
          };
          const manifestBlob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
          await cache.put(new Request(gamePrefix + 'manifest.json'), new Response(manifestBlob));

          if (isMounted) {
            setDownloadingGame(false);
            setLocalGameSrc(gamePrefix + encodedEntryPoint);
          }`;

content = content.replace(oldZipExtract, newZipExtract);
fs.writeFileSync('src/frontend/views/DetailView.tsx', content);
