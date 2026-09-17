import { getBaseUrl } from '../../lib/basePath';
import { QuestionsView } from './QuestionsView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Module, User, Game } from '../../types';
import JSZip from 'jszip';

import { fetchAuth } from '../../lib/fetchAuth';

export function DetailView({ 
  module, 
  onBack, 
  activeGameId, 
  playedGames, 
  onLaunchGame, 
  onCloseGame, 
  onCompleteModule,
  user
}: {
  module: Module;
  onBack: () => void;
  activeGameId: number | null;
  playedGames: Set<number>;
  onLaunchGame: (id: number, title: string) => void;
  onCloseGame: () => void;
  onCompleteModule: (reflection?: string) => void;
  user?: User | null;
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [module.id]);

  
  const [downloadingGame, setDownloadingGame] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [localGameSrc, setLocalGameSrc] = useState<string | null>(null);

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

  useEffect(() => {
    const activeGame = module.games?.find(g => g.id === activeGameId);
    if (!activeGameId || !activeGame) {
      setLocalGameSrc(null);
      return;
    }
    
    let isMounted = true;
    
    if (activeGame.path?.startsWith('http://') || activeGame.path?.startsWith('https://')) {
      setLocalGameSrc(activeGame.path);
      return;
    }

    if (activeGame.path?.endsWith('.zip') || activeGame.extractedPath || activeGame.path) {
      const cacheName = 'local-games-cache';
      const base = getBaseUrl();
      const gamePrefix = `${base}local-game-play/game_${activeGameId}/`;
      const serverGameUrl = `${base}games/game_${activeGameId}/`;
      
      const loadSimulation = async () => {
        try {
          // 1. Check if already extracted and ready in Service Worker cache (Offline-first)
          if ('caches' in window) {
            try {
              const cache = await caches.open(cacheName);
              const manifestResponse = await cache.match(gamePrefix + 'manifest.json') || await cache.match(`/local-game-play/game_${activeGameId}/manifest.json`);
              if (manifestResponse) {
                const manifest = await manifestResponse.json();
                if (manifest.status === 'ready' && manifest.entryPoint) {
                  if (isMounted) setLocalGameSrc(gamePrefix + manifest.entryPoint);
                  return;
                }
              }
            } catch(e) {}
          }

          // 2. Check if direct server simulation folder is available (Instant load, high-performance streaming)
          try {
            const headCheck = await fetch(serverGameUrl, { method: 'HEAD' });
            if (headCheck.ok) {
              if (isMounted) {
                setDownloadingGame(false);
                setLocalGameSrc(serverGameUrl);
              }
              return;
            }
          } catch(e) {}

          // 3. Download ZIP package for client-side extraction & offline preparation
          if (isMounted) {
            setDownloadingGame(true);
            setDownloadProgress('Mengunduh paket simulasi...');
          }
          
          let rawPath = activeGame.path || `games/game_${activeGameId}.zip`;
          rawPath = rawPath.replace(/^\/?(digital\/simulasisains\/)?/, '');
          const fetchUrl = `${base}${rawPath}`;
          
          const zipResponse = await fetch(fetchUrl);
          if (!zipResponse.ok) {
            // Check if direct server simulation folder exists
            try {
              const headCheck = await fetch(serverGameUrl, { method: 'HEAD' });
              if (headCheck.ok) {
                if (isMounted) {
                  setDownloadingGame(false);
                  setLocalGameSrc(serverGameUrl);
                }
                return;
              }
            } catch(e) {}

            if (isMounted) {
              setDownloadingGame(false);
              setLocalGameSrc(null);
            }
            return;
          }
          
          const blob = await zipResponse.blob();
          
          // Validate ZIP magic bytes (PK\x03\x04 = 0x50 0x4b 0x03 0x04)
          const firstBytes = await blob.slice(0, 4).arrayBuffer().then(buf => new Uint8Array(buf)).catch(() => new Uint8Array(0));
          const isZip = firstBytes.length >= 2 && firstBytes[0] === 0x50 && firstBytes[1] === 0x4b;
          
          if (!isZip) {
            console.warn("Server returned non-zip response, streaming directly from server player.");
            if (isMounted) {
              setDownloadingGame(false);
              setLocalGameSrc(serverGameUrl);
            }
            return;
          }
          
          if (isMounted) setDownloadProgress('Mengekstrak aset simulasi...');
          
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
            // If no index.html in root, try direct server playback
            if (isMounted) {
              setDownloadingGame(false);
              setLocalGameSrc(serverGameUrl);
            }
            return;
          }

          if ('caches' in window) {
            const cache = await caches.open(cacheName);
            const promises = [];
            const extractedFilesCount: string[] = [];
            for (const [filename, zipEntry] of Object.entries(zip.files)) {
              if (!zipEntry.dir && !filename.includes('__MACOSX')) {
                extractedFilesCount.push(filename);
                const encodedFilename = filename.split('/').map(encodeURIComponent).join('/');
                const fullPath = gamePrefix + encodedFilename;
                const standardPath = `/local-game-play/game_${activeGameId}/${encodedFilename}`;
                const serverPath = `${base}games/game_${activeGameId}/${encodedFilename}`;
                const standardServerPath = `/games/game_${activeGameId}/${encodedFilename}`;
                
                promises.push(
                  zipEntry.async('blob').then(async fileBlob => {
                    const headers = new Headers();
                    headers.set('Content-Type', getMimeType(filename));
                    
                    const cleanName = filename.toLowerCase();
                    let isGzip = cleanName.endsWith('.gz');
                    let isBr = cleanName.endsWith('.br');

                    if (!isGzip && !isBr && (cleanName.endsWith('.unityweb') || cleanName.endsWith('.data') || cleanName.endsWith('.wasm'))) {
                      try {
                        const headBuf = await fileBlob.slice(0, 2).arrayBuffer();
                        const bytes = new Uint8Array(headBuf);
                        if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
                          isGzip = true;
                        }
                      } catch(e) {}
                    }

                    if (isGzip) headers.set('Content-Encoding', 'gzip');
                    if (isBr) headers.set('Content-Encoding', 'br');
                    headers.set('Accept-Ranges', 'bytes');
                    headers.set('Access-Control-Allow-Origin', '*');
                    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
                    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
                    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
                    
                    const res = new Response(fileBlob, { headers });
                    const putPromises = [
                      cache.put(new Request(fullPath), res.clone()),
                      cache.put(new Request(standardPath), res.clone()),
                      cache.put(new Request(serverPath), res.clone()),
                      cache.put(new Request(standardServerPath), res.clone())
                    ];

                    // Cache aliases: if filename ends with .gz / .br / .unityweb, also cache without extension
                    if (cleanName.endsWith('.gz') || cleanName.endsWith('.br')) {
                      const aliasName = filename.slice(0, -3);
                      const aliasEncoded = aliasName.split('/').map(encodeURIComponent).join('/');
                      putPromises.push(cache.put(new Request(gamePrefix + aliasEncoded), res.clone()));
                      putPromises.push(cache.put(new Request(`/local-game-play/game_${activeGameId}/${aliasEncoded}`), res.clone()));
                    } else if (cleanName.endsWith('.unityweb')) {
                      const aliasName = filename.slice(0, -9);
                      const aliasEncoded = aliasName.split('/').map(encodeURIComponent).join('/');
                      putPromises.push(cache.put(new Request(gamePrefix + aliasEncoded), res.clone()));
                      putPromises.push(cache.put(new Request(`/local-game-play/game_${activeGameId}/${aliasEncoded}`), res.clone()));
                      putPromises.push(cache.put(new Request(gamePrefix + aliasEncoded + '.gz'), res.clone()));
                      putPromises.push(cache.put(new Request(`/local-game-play/game_${activeGameId}/${aliasEncoded}.gz`), res.clone()));
                    } else if (/\.(wasm|data|js|json|css|mem|symbols)$/i.test(filename)) {
                      putPromises.push(cache.put(new Request(fullPath + '.gz'), res.clone()));
                      putPromises.push(cache.put(new Request(standardPath + '.gz'), res.clone()));
                    }

                    return Promise.all(putPromises);
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
            await cache.put(new Request(`/local-game-play/game_${activeGameId}/manifest.json`), new Response(manifestBlob.slice()));

            if (isMounted) {
              setDownloadingGame(false);
              setLocalGameSrc(gamePrefix + encodedEntryPoint);
            }
          } else {
            if (isMounted) {
              setDownloadingGame(false);
              setLocalGameSrc(serverGameUrl);
            }
          }
        } catch (err) {
          console.warn("Zip extraction encountered issue, falling back to server simulation stream:", err);
          if (isMounted) {
            setDownloadingGame(false);
            setLocalGameSrc(serverGameUrl);
          }
        }
      };
      
      loadSimulation();
    } else {
      setLocalGameSrc(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [activeGameId, module.games]);

  const activeGame = module.games?.find(g => g.id === activeGameId);
  const totalGames = module.games?.length || 0;
  const isModuleCompleted = module.status === 'completed';
  const allPlayed = totalGames === 0 || isModuleCompleted || (module.games || []).every(g => playedGames.has(g.id));
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isMateriOpen, setIsMateriOpen] = useState(true);
  const [isGamesOpen, setIsGamesOpen] = useState(true);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true);
  const [materiTab, setMateriTab] = useState<'theory' | 'glossary'>('theory');

  
  
  useEffect(() => {
    fetchAuth(`/api/modules/${module.id}/questions`)
      .then(r => r.ok ? r.json() : { questions: [] })
      .then(d => setQuestions(d.questions || []))
      .catch(() => setQuestions([]));
  }, [module.id]);
  
  useEffect(() => {
    if (activeGameId !== null) {
      document.getElementById('webgl-simulation-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeGameId]);

  return (
    <div className="page active" style={{ paddingBottom: '60px', paddingTop: '24px' }}>
      <div className="main-wrapper">
        {/* Navigation & Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <nav aria-label="Breadcrumb" className="breadcrumb" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
              <button 
                id="btn-breadcrumb-back"
                onClick={onBack}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  padding: 0, 
                  cursor: 'pointer', 
                  color: 'var(--primary)', 
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13.5px'
                }}
              >
                <i className="ti ti-layout-grid" style={{ fontSize: '16px' }}></i>
                <span>Daftar Modul</span>
              </button>

              <span className="sep" style={{ color: '#94a3b8', margin: '0 4px', fontSize: '15px' }}>›</span>

              <span className="current" style={{ color: '#475569', fontWeight: 600 }}>
                {module.title}
              </span>
            </nav>

            <button 
              id="btn-back-to-modules"
              className="btn btn-outline" 
              onClick={onBack}
              style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="ti ti-arrow-left"></i> Kembali ke Modul
            </button>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                {module.title}
              </h1>
              {isModuleCompleted ? (
                <span className="badge badge-success" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>
                  <i className="ti ti-circle-check"></i> Selesai
                </span>
              ) : (
                <span className="badge badge-primary" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>
                  <i className="ti ti-play"></i> Sedang Berjalan
                </span>
              )}
            </div>
            
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              {module.desc}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', fontSize: '12.5px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="ti ti-school" style={{ color: 'var(--primary)' }}></i> {module.level || 'Semua Jenjang'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="ti ti-category" style={{ color: 'var(--primary)' }}></i> {module.subject || 'Sains Terpadu'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="ti ti-device-gamepad-2" style={{ color: 'var(--primary)' }}></i> {module.games?.length || 0} Simulasi Game
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="module-detail-grid">
          
          {/* ========================================================= */}
          {/* KOLOM KIRI: MATERI & GLOSARIUM & SIMULASI INTERAKTIF     */}
          {/* ========================================================= */}
          <div className="module-left-col">

          {/* MATERI & GLOSARIUM */}
            <div className="modern-step-card">
              <div 
                className={`step-card-header ${isMateriOpen ? 'is-open' : ''}`}
                onClick={() => setIsMateriOpen(!isMateriOpen)}
              >
                <div className="step-header-left">
                  <div className="step-number-badge blue">01</div>
                  <div className="step-header-info">
                    <h3 className="step-title">
                      <i className="ti ti-book-2" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                      Materi & Glosarium
                    </h3>
                    <p className="step-subtitle">Pelajari konsep dasar, tujuan, dan istilah kunci</p>
                  </div>
                </div>

                <div className="step-toggle-btn">
                  <span>{isMateriOpen ? 'Tutup' : 'Buka'}</span>
                  <i className={`ti ${isMateriOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isMateriOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="step-card-body">
                      {/* Tab Switcher */}
                      <div className="materi-tab-nav">
                        <button 
                          className={`materi-tab-btn ${materiTab === 'theory' ? 'active' : ''}`}
                          onClick={() => setMateriTab('theory')}
                        >
                          <i className="ti ti-file-text"></i> Penjelasan Materi
                        </button>
                        <button 
                          className={`materi-tab-btn ${materiTab === 'glossary' ? 'active' : ''}`}
                          onClick={() => setMateriTab('glossary')}
                        >
                          <i className="ti ti-vocabulary"></i> Tujuan & Istilah Kunci
                        </button>
                      </div>

                      {materiTab === 'theory' && (
                        <div>
                          {module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.theory ? (
                            <div 
                              className="theory-prose"
                              dangerouslySetInnerHTML={{ __html: module.material.theory }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: '28px 16px', color: '#64748b' }}>
                              <i className="ti ti-notes" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', color: '#cbd5e1' }}></i>
                              <p style={{ margin: 0, fontSize: '14px' }}>Belum ada modul teori khusus yang ditambahkan.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {materiTab === 'glossary' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {/* Objectives */}
                          {module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.objectives && module.material.objectives.length > 0 && (
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="ti ti-target" style={{ color: 'var(--primary)' }}></i> Tujuan Pembelajaran
                              </h4>
                              <div>
                                {module.material.objectives.map((obj: string, idx: number) => (
                                  <div key={idx} className="objective-list-item">
                                    <div className="objective-icon">
                                      <i className="ti ti-check"></i>
                                    </div>
                                    <span style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>{obj}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Terms */}
                          {module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.keyTerms && module.material.keyTerms.length > 0 && (
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="ti ti-vocabulary" style={{ color: 'var(--primary)' }}></i> Istilah Kunci
                              </h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                                {module.material.keyTerms.map((item: any, idx: number) => (
                                  <div key={idx} className="keyterm-card">
                                    <div className="keyterm-title">{item.term}</div>
                                    <div className="keyterm-def">{item.def}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(!module.material || (!module.material.objectives?.length && !module.material.keyTerms?.length)) && (
                            <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b' }}>
                              <p style={{ margin: 0, fontSize: '13.5px' }}>Tidak ada data tujuan pembelajaran atau istilah khusus.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SIMULASI INTERAKTIF */}
            <div className="modern-step-card">
              <div 
                className={`step-card-header ${isGamesOpen ? 'is-open' : ''}`}
                onClick={() => setIsGamesOpen(!isGamesOpen)}
              >
                <div className="step-header-left">
                  <div className="step-number-badge emerald">02</div>
                  <div className="step-header-info">
                    <h3 className="step-title">
                      <i className="ti ti-device-gamepad-2" style={{ color: '#15803d', fontSize: '18px' }}></i>
                      Simulasi Interaktif
                    </h3>
                    <p className="step-subtitle">Eksplorasi virtual lab dan selesaikan semua simulasi</p>
                  </div>
                </div>

                <div className="step-toggle-btn">
                  <span>{isGamesOpen ? 'Tutup' : 'Buka'}</span>
                  <i className={`ti ${isGamesOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isGamesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="step-card-body">
                      {/* Active Game Player */}
                      
                      {activeGameId !== null && (
                        <div id="webgl-simulation-player" className="modern-webgl-frame" style={{ border: 'none', overflow: 'hidden', borderRadius: '12px', marginBottom: '16px' }}>
                          {/* Player Header Bar with Title and Open in New Tab */}
                          <div style={{ 
                            background: '#0f172a', 
                            padding: '10px 16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #1e293b'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
                              <i className="ti ti-device-gamepad-2" style={{ color: '#38bdf8', fontSize: '18px' }}></i>
                              <span style={{ fontSize: '13.5px', fontWeight: 700, letterSpacing: '0.2px' }}>
                                {module.title}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const targetUrl = localGameSrc || (activeGame?.path?.startsWith('http') ? activeGame.path : `${getBaseUrl()}games/game_${activeGameId}/`);
                                if (targetUrl) {
                                  window.open(targetUrl, '_blank');
                                }
                              }}
                              className="btn btn-sm"
                              style={{
                                background: '#1e293b',
                                color: '#38bdf8',
                                border: '1px solid #334155',
                                padding: '5px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                              title="Buka simulasi di tab baru"
                            >
                              <i className="ti ti-external-link" style={{ fontSize: '14px' }}></i>
                              Buka di Tab Baru
                            </button>
                          </div>

                          <div style={{ width: '100%', aspectRatio: '16/9', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activeGame?.path ? (
                              downloadingGame && !localGameSrc ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                                  <div className="loading-spinner"></div>
                                  <p style={{ fontSize: '13px', margin: 0 }}>{downloadProgress}</p>
                                </div>
                              ) : localGameSrc ? (
                                <iframe 
                                  src={localGameSrc}
                                  style={{ width: '100%', height: '100%', border: 'none' }}
                                  title={module.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                ></iframe>
                              ) : (
                                <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '32px 20px', maxWidth: '460px' }}>
                                  <i className="ti ti-device-gamepad-2" style={{ fontSize: '36px', marginBottom: '10px', display: 'block', color: '#94a3b8' }}></i>
                                  <p style={{ margin: '0 0 6px 0', fontWeight: 600, fontSize: '15px', color: '#f8fafc' }}>Paket Simulasi Belum Tersedia</p>
                                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                                    File WebGL atau ZIP untuk simulasi &ldquo;{module.title}&rdquo; belum diunggah ke server. Guru atau Admin dapat mengunggah file ZIP game melalui menu Kelola Modul.
                                  </p>
                                </div>
                              )
                            ) : (
                              <div style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                                <i className="ti ti-device-gamepad-2" style={{ fontSize: '36px', marginBottom: '8px', display: 'block', color: '#475569' }}></i>
                                <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#f8fafc' }}>Game Belum Tersedia</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}


                      {/* List of Game Simulations */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(!module.games || module.games.length === 0) ? (
                          <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b' }}>
                            <i className="ti ti-device-gamepad-2" style={{ fontSize: '28px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}></i>
                            <p style={{ margin: 0, fontSize: '13.5px' }}>Simulasi untuk modul ini belum tersedia.</p>
                          </div>
                        ) : (
                          module.games.map((game, idx) => {
                            const isPlayed = playedGames.has(game.id) || isModuleCompleted;
                            const isActive = activeGameId === game.id;
                            const displayTitle = (module.games && module.games.length > 1) 
                              ? `${module.title} (Bagian ${idx + 1})` 
                              : module.title;

                            return (
                              <div 
                                key={game.id}
                                className={`modern-game-card ${isActive ? 'active-game' : isPlayed ? 'played' : ''}`}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="game-icon-avatar" style={{ 
                                    background: isPlayed ? '#15803d' : isActive ? '#2563eb' : 'var(--primary)'
                                  }}>
                                    <i className={isPlayed ? 'ti ti-check' : 'ti ti-device-gamepad-2'}></i>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Simulasi {idx + 1}
                                      </span>
                                      {isPlayed && (
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                                          ✓ Selesai
                                        </span>
                                      )}
                                    </div>
                                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                      {displayTitle}
                                    </h4>
                                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                                      {game.desc || module.desc}
                                    </p>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button 
                                    className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`}
                                    onClick={() => onLaunchGame(game.id, displayTitle)}
                                    style={{ 
                                      padding: '8px 16px', 
                                      fontSize: '13px', 
                                      fontWeight: 700, 
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <i className="ti ti-player-play"></i> 
                                    {isActive ? 'Sedang Terbuka' : 'Mainkan'}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>
        </div>

          {/* ========================================================= */}
          {/* KOLOM KANAN: EVALUASI & PEMBENARAN SOAL                   */}
          {/* ========================================================= */}
          <div className="module-right-col">
            <div className="modern-step-card">
              <div 
                className={`step-card-header ${isQuestionsOpen ? 'is-open' : ''}`}
                onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
              >
                <div className="step-header-left">
                  <div className="step-number-badge amber">03</div>
                  <div className="step-header-info">
                    <h3 className="step-title">
                      <i className="ti ti-list-check" style={{ color: '#d97706', fontSize: '18px' }}></i>
                      Evaluasi &amp; Pembenaran Soal
                    </h3>
                    <p className="step-subtitle">Uji pemahaman dan periksa analisis kunci jawaban</p>
                  </div>
                </div>

                <div className="step-toggle-btn">
                  <span>{isQuestionsOpen ? 'Tutup' : 'Buka'}</span>
                  <i className={`ti ${isQuestionsOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isQuestionsOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="step-card-body" style={{ padding: '20px' }}>
                      <QuestionsView 
                        questions={questions}
                        module={module}
                        user={user}
                        allPlayed={allPlayed}
                        onComplete={onCompleteModule}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
