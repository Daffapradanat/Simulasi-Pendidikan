import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { getBaseUrl } from '../../lib/basePath';
import { Game } from '../../types';

export function useSimulationLoader() {
  const [downloadingGame, setDownloadingGame] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [localGameSrc, setLocalGameSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getMimeType = (filename: string) => {
    let cleanName = filename.toLowerCase();
    if (cleanName.endsWith('.gz')) cleanName = cleanName.slice(0, -3);
    if (cleanName.endsWith('.br')) cleanName = cleanName.slice(0, -3);
    const ext = cleanName.split('.').pop() || '';
    const types: Record<string, string> = {
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

  const loadSimulation = useCallback(async (game: Game) => {
    setError(null);
    if (!game) {
      setLocalGameSrc(null);
      return;
    }
    
    if (game.path?.endsWith('.zip')) {
      const cacheName = 'local-games-cache';
      const gamePrefix = `${getBaseUrl()}local-game-play/game_${game.id}/`;
      
      try {
        const cache = await caches.open(cacheName);
        
        // Cek dulu apakah index.html sudah ada di cache (dengan ignoreSearch)
        // Kita loop semua keys di cache untuk mencari mana yang .endsWith('index.html') di dalam gamePrefix
        const cachedRequests = await cache.keys();
        let foundIndexReq = cachedRequests.find(req => req.url.startsWith(gamePrefix) && req.url.toLowerCase().endsWith('index.html'));
        
        if (foundIndexReq) {
          console.log('[SimulationLoader] Package found in cache:', foundIndexReq.url);
          setLocalGameSrc(foundIndexReq.url);
          return;
        }

        console.log('[SimulationLoader] Package found in cache: false. Downloading ZIP...');
        setDownloadingGame(true);
        setDownloadProgress('Mengunduh simulasi...');
        
        let fetchUrl = game.path || '';
        if (fetchUrl.startsWith('/')) {
          fetchUrl = `${getBaseUrl()}${fetchUrl.substring(1)}`;
        }
        
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Zip file not found on server');
        
        const blob = await response.blob();
        
        console.log('[SimulationLoader] Extracting package...');
        setDownloadProgress('Mengekstrak simulasi...');
        
        const zip = await JSZip.loadAsync(blob);
        let indexPath = '';
        let foundIndex = false;
        
        const filenames = Object.keys(zip.files);
        const possibleIndexFiles = filenames.filter(f => f.toLowerCase().endsWith('index.html') && !f.includes('__MACOSX'));
        
        if (possibleIndexFiles.length > 0) {
          possibleIndexFiles.sort((a, b) => a.length - b.length);
          indexPath = possibleIndexFiles[0];
          foundIndex = true;
        } else {
          throw new Error('index.html not found in the ZIP package');
        }
        
        const promises = [];
        console.log('[SimulationLoader] Caching assets...');
        for (const [filename, zipEntry] of Object.entries(zip.files)) {
          if (!zipEntry.dir && !filename.includes('__MACOSX')) {
            // Encode the filename component-wise to ensure spaces are handled correctly
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
        console.log('[SimulationLoader] Simulation ready.');
        setDownloadingGame(false);
        const finalUrl = gamePrefix + indexPath.split('/').map(encodeURIComponent).join('/');
        setLocalGameSrc(finalUrl);

      } catch (err: any) {
        console.error('[SimulationLoader] FAILED:', err);
        setError(err.message || 'Gagal memuat simulasi');
        setDownloadingGame(false);
        setLocalGameSrc(null);
      }
    } else if (game.path) {
      const fullSrc = game.path.startsWith('/') ? `${getBaseUrl()}${game.path.substring(1)}` : game.path;
      setLocalGameSrc(fullSrc);
    } else {
      setLocalGameSrc(null);
    }
  }, []);

  return {
    downloadingGame,
    downloadProgress,
    localGameSrc,
    error,
    loadSimulation
  };
}
