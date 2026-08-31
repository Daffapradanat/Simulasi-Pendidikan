import { getBaseUrl } from '../../lib/basePath';
import { QuestionsView } from './QuestionsView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Module, User } from '../../types';
import JSZip from 'jszip';
import * as fflate from 'fflate';
import { fetchAuth } from '../../lib/fetchAuth';

export function DetailView({ 
  module, 
  user,
  onBack, 
  activeGameId, 
  playedGames, 
  onLaunchGame, 
  onCloseGame, 
  onCompleteModule 
}: {
  module: Module;
  user?: User | null;
  onBack: () => void;
  activeGameId: number | null;
  playedGames: Set<number>;
  onLaunchGame: (id: number, title: string) => void;
  onCloseGame: () => void;
  onCompleteModule: (reflection?: string) => void;
}) {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [module.id]);

  const activeGame = module.games.find(g => g.id === activeGameId);
  const totalGames = module.games.length;
  const isModuleCompleted = module.status === 'completed';
  const allPlayed = totalGames === 0 || isModuleCompleted || module.games.every(g => playedGames.has(g.id));
  const [questions, setQuestions] = useState<any[]>([]);

  // Accordion state (default open)
  const [isStep1Open, setIsStep1Open] = useState(true);
  const [isStep2Open, setIsStep2Open] = useState(true);
  const [isStep3Open, setIsStep3Open] = useState(true);

  // Sub-tab state inside Step 1 (Materi vs Glosarium)
  const [materiTab, setMateriTab] = useState<'theory' | 'glossary'>('theory');

  const getMimeType = (filename: string) => {
    let clean = filename.toLowerCase();
    if (clean.endsWith('.gz')) clean = clean.slice(0, -3);
    if (clean.endsWith('.br')) clean = clean.slice(0, -3);

    const ext = clean.split('.').pop() || '';
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

  const [downloadingGame, setDownloadingGame] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [localGameSrc, setLocalGameSrc] = useState<string | null>(null);

  useEffect(() => {
    if (activeGameId) {
      const game = module.games?.find((g: any) => g.id === activeGameId);
      if (game?.path?.endsWith('.zip')) {
        const cacheName = 'local-games-cache';
        const gamePrefix = `${getBaseUrl()}local-game-play/game_${game.id}/`;
        
        caches.open(cacheName).then(cache => {
          cache.match(gamePrefix + 'index.html').then(res => {
            if (res) {
               setLocalGameSrc(gamePrefix + 'index.html');
            } else {
               setDownloadingGame(true);
               setDownloadProgress('Mengunduh paket simulasi...');
               
               let fetchUrl = game.path || '';
               if (fetchUrl.startsWith('/')) {
                 fetchUrl = `${getBaseUrl()}${fetchUrl.substring(1)}`;
               }
               fetch(fetchUrl)
                 .then(res => {
                   if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                   return res.blob();
                 })
                 .then(blob => JSZip.loadAsync(blob))
                 .then(async (zip) => {
                   setDownloadProgress('Mengekstrak file simulasi (Gzip / WebGL)...');
                   let indexPath = 'index.html';
                   
                   for (const filename of Object.keys(zip.files)) {
                     if (filename.endsWith('index.html') && !filename.includes('__MACOSX')) {
                       indexPath = filename;
                       break;
                     }
                   }
                   
                   const targetCache = await caches.open(cacheName);
                   
                   const promises = [];
                   for (const [filename, zipEntry] of Object.entries(zip.files)) {
                     if (!zipEntry.dir && !filename.includes('__MACOSX') && !filename.startsWith('.')) {
                       promises.push(
                         (async () => {
                           try {
                             const fileBytes = await zipEntry.async('uint8array');
                             const fullPath = gamePrefix + filename;
                             const mime = getMimeType(filename);
                             const isGz = filename.toLowerCase().endsWith('.gz');
                             const isBr = filename.toLowerCase().endsWith('.br');

                             // Simpan file asli ke cache
                             const rawHeaders = new Headers();
                             rawHeaders.set('Content-Type', mime);
                             if (isGz) rawHeaders.set('Content-Encoding', 'gzip');
                             if (isBr) rawHeaders.set('Content-Encoding', 'br');
                             
                             await targetCache.put(new Request(fullPath), new Response(fileBytes, { headers: rawHeaders }));

                             // Jika file terkompresi Gzip (.gz), decompress dan simpan juga versi uncompressed-nya
                             // agar WebGL / Unity loader yang meminta 'file.wasm' atau 'file.data' tidak mengalami 404
                             if (isGz) {
                               try {
                                 const decompressed = fflate.gunzipSync(fileBytes);
                                 const uncompressedPath = fullPath.replace(/\.gz$/i, '');
                                 const decompHeaders = new Headers();
                                 decompHeaders.set('Content-Type', getMimeType(uncompressedPath));
                                 await targetCache.put(new Request(uncompressedPath), new Response(decompressed, { headers: decompHeaders }));
                               } catch (decErr) {
                                 // Abaikan jika bukan format gzip standar
                               }
                             }
                           } catch (err) {
                             console.warn('Gagal memproses file zip:', filename, err);
                           }
                         })()
                       );
                     }
                   }
                   
                   await Promise.all(promises);
                   
                   setDownloadingGame(false);
                   setLocalGameSrc(gamePrefix + indexPath);
                 })
                 .catch(err => {
                   console.error('Gagal memuat game:', err);
                   setDownloadProgress('Gagal memuat simulasi');
                   setTimeout(() => setDownloadingGame(false), 2500);
                 });
            }
          });
        });
      } else {
        setLocalGameSrc(game?.path || null);
      }
    } else {
      setLocalGameSrc(null);
    }
  }, [activeGameId, module.games]);
  
  useEffect(() => {
    fetchAuth(`/api/modules/${module.id}/questions`)
      .then(r => r.ok ? r.json() : { questions: [] })
      .then(d => setQuestions(d.questions || []))
      .catch(() => setQuestions([]));
  }, [module.id]);
  
  useEffect(() => {
    if (activeGameId !== null) {
      setIsStep2Open(true);
      document.getElementById('webgl-player-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeGameId]);

  const toggleFullscreen = () => {
    const elem = document.getElementById('webgl-player-container');
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="page active">
      <div className="main-wrapper" style={{ maxWidth: '1440px' }}>
        
        {/* ── BREADCRUMB NAVIGATION ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button 
            className="btn btn-ghost" 
            onClick={onBack}
            style={{ 
              padding: '6px 14px', 
              fontSize: '13.5px', 
              fontWeight: 600, 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '10px'
            }}
          >
            <i className="ti ti-arrow-left" style={{ fontSize: '16px', color: 'var(--primary)' }}></i> 
            Kembali ke Daftar Modul
          </button>

          <div style={{ fontSize: '13px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Laboratorium Sains</span>
            <span>›</span>
            <span>{module.subject || 'Sains'}</span>
            <span>›</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{module.title}</span>
          </div>
        </div>

        {/* ── HERO BANNER MODUL ── */}
        <div className="module-hero-banner">
          <div className="module-hero-badges">
            <span className="hero-badge-pill" style={{ background: 'rgba(56, 189, 248, 0.25)', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
              <i className="ti ti-atom"></i> {module.subject || 'Fisika & Sains'}
            </span>
            <span className="hero-badge-pill">
              <i className="ti ti-school"></i> {module.level || 'Fase E / Kelas 10'}
            </span>
            <span className="hero-badge-pill">
              <i className="ti ti-clock"></i> {module.duration || '45 Menit'}
            </span>
            {module.status === 'completed' ? (
              <span className="hero-badge-pill" style={{ background: 'rgba(16, 185, 129, 0.25)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
                <i className="ti ti-circle-check"></i> Modul Tuntas
              </span>
            ) : (
              <span className="hero-badge-pill" style={{ background: 'rgba(245, 158, 11, 0.25)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>
                <i className="ti ti-progress"></i> Dalam Proses
              </span>
            )}
          </div>

          <h1 className="module-hero-title">{module.title}</h1>
          <p className="module-hero-desc">{module.desc}</p>

          {/* Timeline Tracker */}
          <div className="module-timeline-track">
            <div className={`timeline-step-indicator ${isStep1Open ? 'active' : ''}`}>
              <div className="timeline-step-num">1</div>
              <span>Materi & Teori Sains</span>
            </div>
            <i className="ti ti-chevron-right" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}></i>
            
            <div className={`timeline-step-indicator ${activeGameId !== null || playedGames.size > 0 ? 'active' : ''} ${allPlayed ? 'completed' : ''}`}>
              <div className="timeline-step-num">
                {allPlayed && module.games.length > 0 ? <i className="ti ti-check" style={{ fontSize: '12px' }}></i> : '2'}
              </div>
              <span>Simulasi Interaktif ({module.games.length} Game)</span>
            </div>
            <i className="ti ti-chevron-right" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}></i>

            <div className={`timeline-step-indicator ${isStep3Open ? 'active' : ''}`}>
              <div className="timeline-step-num">3</div>
              <span>Evaluasi & Refleksi</span>
            </div>
          </div>
        </div>

        {/* ── SPLIT LAYOUT: KIRI (MATERI & GAME), KANAN (EVALUASI SOAL) ── */}
        <div className="module-split-layout">
          
          {/* ========================================================= */}
          {/* KOLOM KIRI: LANGKAH 1 (MATERI) & LANGKAH 2 (SIMULASI GAME) */}
          {/* ========================================================= */}
          <div className="module-left-col">
            
            {/* ── LANGKAH 1: MATERI & TEORI SAINS ── */}
            <div className="modern-step-card">
              <div 
                className={`step-card-header ${isStep1Open ? 'is-open' : ''}`}
                onClick={() => setIsStep1Open(!isStep1Open)}
              >
                <div className="step-header-left">
                  <div className="step-number-badge blue">01</div>
                  <div className="step-header-info">
                    <h3 className="step-title">
                      <i className="ti ti-book-2" style={{ color: '#2563eb', fontSize: '18px' }}></i>
                      Materi & Konsep Pembelajaran
                    </h3>
                    <p className="step-subtitle">Pelajari konsep ilmiah sebelum menguji simulasi virtual</p>
                  </div>
                </div>

                <div className="step-toggle-btn">
                  <span>{isStep1Open ? 'Tutup' : 'Buka'}</span>
                  <i className={`ti ${isStep1Open ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isStep1Open && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="step-card-body">
                      {/* Sub-tab switcher */}
                      <div className="materi-tab-nav">
                        <button 
                          className={`materi-tab-btn ${materiTab === 'theory' ? 'active' : ''}`}
                          onClick={() => setMateriTab('theory')}
                        >
                          <i className="ti ti-file-text"></i> Uraian & Ringkasan Teori
                        </button>
                        <button 
                          className={`materi-tab-btn ${materiTab === 'glossary' ? 'active' : ''}`}
                          onClick={() => setMateriTab('glossary')}
                        >
                          <i className="ti ti-target"></i> Tujuan & Istilah Kunci
                        </button>
                      </div>

                      {materiTab === 'theory' ? (
                        <div className="theory-prose">
                          {/* Ringkasan Modul */}
                          <div className="theory-callout">
                            <i className="ti ti-bulb" style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}></i>
                            <div>
                              <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Fokus Pembelajaran:</strong>
                              <span>{module.desc}</span>
                            </div>
                          </div>

                          {/* Detail Uraian Teori */}
                          {module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.theory ? (
                            <div 
                              style={{ marginTop: '16px' }}
                              dangerouslySetInnerHTML={{ __html: module.material.theory }} 
                            />
                          ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                              Uraian konsep teori modul ini dirancang selaras dengan aktivitas simulasi interaktif di Langkah 2.
                            </p>
                          )}

                          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setIsStep2Open(true);
                                document.getElementById('step-2-simulation')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span>Lanjut ke Laboratorium Simulasi</span>
                              <i className="ti ti-arrow-down"></i>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* Tujuan Pembelajaran */}
                          {(module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.objectives && module.material.objectives.length > 0) && (
                            <div style={{ marginBottom: '24px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="ti ti-target" style={{ color: '#10b981' }}></i> Capaian & Tujuan Pembelajaran
                              </h4>
                              <div>
                                {module.material.objectives.map((obj, i) => (
                                  <div key={i} className="objective-list-item">
                                    <div className="objective-icon">
                                      <i className="ti ti-check"></i>
                                    </div>
                                    <span style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>{obj}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Istilah Kunci / Glosarium */}
                          {(module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.keyTerms && module.material.keyTerms.length > 0) && (
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="ti ti-vocabulary" style={{ color: '#2563eb' }}></i> Glosarium Istilah Kunci
                              </h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                                {module.material.keyTerms.map((term, i) => (
                                  <div key={i} className="keyterm-card">
                                    <div className="keyterm-title">{term.term}</div>
                                    <div className="keyterm-def">{term.def}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* ── LANGKAH 2: LABORATORIUM SIMULASI INTERAKTIF ── */}
            <div className="modern-step-card" id="step-2-simulation">
              <div 
                className={`step-card-header ${isStep2Open ? 'is-open' : ''}`}
                onClick={() => setIsStep2Open(!isStep2Open)}
              >
                <div className="step-header-left">
                  <div className="step-number-badge emerald">02</div>
                  <div className="step-header-info">
                    <h3 className="step-title">
                      <i className="ti ti-device-gamepad-2" style={{ color: '#059669', fontSize: '18px' }}></i>
                      Laboratorium Simulasi Virtual
                    </h3>
                    <p className="step-subtitle">Uji coba variabel eksperimen dalam model interaktif ({module.games.length} Simulasi)</p>
                  </div>
                </div>

                <div className="step-toggle-btn">
                  <span>{isStep2Open ? 'Tutup' : 'Buka'}</span>
                  <i className={`ti ${isStep2Open ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isStep2Open && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="step-card-body">
                      
                      {/* Active Game Player View */}
                      {activeGameId !== null && (
                        <div id="webgl-player-container" className="modern-webgl-frame">
                          <div className="webgl-frame-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className="ti ti-device-gamepad-2" style={{ color: '#60a5fa', fontSize: '18px' }}></i>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{activeGame?.title}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                className="btn btn-sm"
                                onClick={toggleFullscreen}
                                title="Layar Penuh"
                                style={{ 
                                  background: 'rgba(255, 255, 255, 0.1)', 
                                  color: '#e2e8f0', 
                                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                                  padding: '4px 10px', 
                                  fontSize: '12px', 
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <i className="ti ti-maximize"></i> Fullscreen
                              </button>

                              <button 
                                className="btn btn-sm" 
                                onClick={onCloseGame}
                                style={{ 
                                  background: 'rgba(239, 68, 68, 0.2)', 
                                  color: '#f87171', 
                                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                                  padding: '4px 10px', 
                                  fontSize: '12px', 
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <i className="ti ti-x"></i> Tutup Simulasi
                              </button>
                            </div>
                          </div>

                          <div style={{ width: '100%', aspectRatio: '16/9', background: '#000000', position: 'relative' }}>
                            {activeGame?.path ? (
                              (downloadingGame && !localGameSrc) ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ffffff', gap: '12px' }}>
                                  <div className="loading-spinner"></div>
                                  <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.85)' }}>{downloadProgress}</p>
                                </div>
                              ) : localGameSrc ? (
                                <iframe 
                                  src={localGameSrc} 
                                  style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }} 
                                  title={activeGame.title}
                                  allow="fullscreen; cross-origin-isolated"
                                  onLoad={(e) => {
                                    try {
                                      const win = (e.target as HTMLIFrameElement).contentWindow as any;
                                      if (win && win.console) {
                                        const noop = () => {};
                                        win.console.log = noop;
                                        win.console.info = noop;
                                        win.console.debug = noop;
                                      }
                                    } catch (err) {}
                                  }}
                                />
                              ) : null
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', padding: '24px', textAlign: 'center' }}>
                                <i className="ti ti-device-gamepad-2" style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.6 }}></i>
                                <p style={{ fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0' }}>File Simulasi Sedang Disiapkan</p>
                                <small>Modul ini akan segera dilengkapi dengan simulasi interaktif.</small>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Game Card Selection List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {module.games.length === 0 ? (
                          <div style={{ padding: '28px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                            <i className="ti ti-device-gamepad-2" style={{ fontSize: '32px', marginBottom: '8px', display: 'block', color: '#cbd5e1' }}></i>
                            <p style={{ margin: 0, fontSize: '13.5px' }}>Belum ada simulasi interaktif yang dikaitkan pada modul ini.</p>
                          </div>
                        ) : (
                          module.games.map((game, idx) => {
                            const isPlayed = playedGames.has(game.id) || isModuleCompleted;
                            const isActive = activeGameId === game.id;

                            return (
                              <div 
                                key={game.id} 
                                className={`modern-game-card ${isActive ? 'active-game' : ''} ${isPlayed ? 'played' : ''}`}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                  <div className="game-icon-avatar" style={{
                                    background: isPlayed ? 'var(--success)' : 'var(--primary)'
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
                                      {game.title}
                                    </h4>
                                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                                      {game.desc}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <button 
                                    className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`}
                                    onClick={() => onLaunchGame(game.id, game.title)}
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
          {/* KOLOM KANAN: LANGKAH 3 (EVALUASI SOAL & REFLEKSI SISWA)  */}
          {/* ========================================================= */}
          <div className="module-right-col">
            <div className="modern-step-card">
              <div 
                className={`step-card-header ${isStep3Open ? 'is-open' : ''}`}
                onClick={() => setIsStep3Open(!isStep3Open)}
              >
                <div className="step-header-left">
                  <div className="step-number-badge amber">03</div>
                  <div className="step-header-info">
                    <h3 className="step-title">
                      <i className="ti ti-list-check" style={{ color: '#d97706', fontSize: '18px' }}></i>
                      Evaluasi & Pembenaran Soal
                    </h3>
                    <p className="step-subtitle">Uji pemahaman dan periksa analisis kunci jawaban</p>
                  </div>
                </div>

                <div className="step-toggle-btn">
                  <span>{isStep3Open ? 'Tutup' : 'Buka'}</span>
                  <i className={`ti ${isStep3Open ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isStep3Open && (
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
