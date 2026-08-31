import { getBaseUrl } from '../../lib/basePath';
import { QuestionsView } from './QuestionsView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Module, User } from '../../types';
import JSZip from 'jszip';
import { fetchAuth } from '../../lib/fetchAuth';

// --- DETAIL VIEW ---
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

  // State Accordion / Minimize untuk setiap langkah (Default terbuka)
  const [isStep1Open, setIsStep1Open] = useState(true);
  const [isStep2Open, setIsStep2Open] = useState(true);
  const [isStep3Open, setIsStep3Open] = useState(true);

  const getMimeType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
      'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css', 'json': 'application/json',
      'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'svg': 'image/svg+xml',
      'gif': 'image/gif', 'wav': 'audio/wav', 'mp3': 'audio/mpeg', 'ogg': 'audio/ogg',
      'mp4': 'video/mp4', 'wasm': 'application/wasm'
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
               setDownloadProgress('Mengunduh simulasi...');
               
               let fetchUrl = game.path || '';
               if (fetchUrl.startsWith('/')) {
                 fetchUrl = `${getBaseUrl()}${fetchUrl.substring(1)}`;
               }
               fetch(fetchUrl)
                 .then(res => res.blob())
                 .then(blob => JSZip.loadAsync(blob))
                 .then(async (zip) => {
                   setDownloadProgress('Mengekstrak simulasi...');
                   let indexPath = 'index.html';
                   
                   for (const filename of Object.keys(zip.files)) {
                     if (filename.endsWith('index.html') && !filename.includes('__MACOSX')) {
                       indexPath = filename;
                       break;
                     }
                   }
                   
                   const cache = await caches.open(cacheName);
                   
                   const promises = [];
                   for (const [filename, zipEntry] of Object.entries(zip.files)) {
                     if (!zipEntry.dir && !filename.includes('__MACOSX')) {
                       promises.push(
                         zipEntry.async('blob').then(fileBlob => {
                           const fullPath = gamePrefix + filename;
                           const headers = new Headers();
                           headers.set('Content-Type', getMimeType(filename));
                           const res = new Response(fileBlob, { headers });
                           return cache.put(new Request(fullPath), res);
                         })
                       );
                     }
                   }
                   
                   await Promise.all(promises);
                   
                   setDownloadingGame(false);
                   setLocalGameSrc(gamePrefix + indexPath);
                 })
                 .catch(err => {
                   console.error(err);
                   setDownloadProgress('Gagal memuat simulasi');
                   setTimeout(() => setDownloadingGame(false), 2000);
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
      document.getElementById('webgl-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeGameId]);

  return (
    <div className="page active">
      <div className="main-wrapper">
        {/* Header Modul & Breadcrumb */}
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
            <div className="breadcrumb" style={{ margin: 0 }}>
              <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }} onClick={onBack}>
                <i className="ti ti-arrow-left"></i> Daftar Modul
              </span>
              <span className="sep">›</span>
              <span className="current">{module.title}</span>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '6px 12px', fontSize: '13px' }}>
              <i className="ti ti-chevron-left"></i> Kembali ke Daftar Modul
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h1 className="page-title" style={{ margin: 0, fontSize: '26px' }}>{module.title}</h1>
            {module.status === 'completed' ? (
              <span className="badge badge-success"><i className="ti ti-circle-check"></i> Selesai</span>
            ) : (
              <span className="badge badge-primary"><i className="ti ti-play"></i> Sedang Berjalan</span>
            )}
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <i className="ti ti-clock"></i> {module.duration || '45 Menit'}
            </span>
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <i className="ti ti-school"></i> {module.level || 'Fase E / Kelas 10'}
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>{module.desc}</p>
        </div>
        
        {/* ── SPLIT LAYOUT: MATERI & SIMULASI DI KIRI, SOAL DI KANAN ── */}
        <div className="module-split-layout">
          {/* ========================================================= */}
          {/* KOLOM KIRI: LANGKAH 1 (MATERI) & LANGKAH 2 (SIMULASI GAME) */}
          {/* ========================================================= */}
          <div className="module-left-col">
            {/* ── LANGKAH 1: MATERI SIMULASI (COLLAPSIBLE / DROPDOWN) ── */}
            <div className="collapsible-card">
              <div 
                className={`collapsible-header ${isStep1Open ? 'is-open' : ''}`}
                onClick={() => setIsStep1Open(!isStep1Open)}
              >
                <div className="collapsible-title-wrap">
                  <span className="step-chip" style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>
                    Langkah 1
                  </span>
                  <div className="collapsible-title">
                    <i className="ti ti-book-2" style={{ color: 'var(--primary)' }}></i> Materi & Konsep Sains
                  </div>
                </div>

                <div className="collapsible-toggle-btn">
                  <span>{isStep1Open ? 'Minimize' : 'Buka Materi'}</span>
                  <i className={`ti ${isStep1Open ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isStep1Open && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="collapsible-body">
                      {/* Deskripsi Materi */}
                      <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '14.5px', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                          {module.desc}
                        </p>
                      </div>

                      {/* Tujuan Pembelajaran */}
                      {(module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.objectives && module.material.objectives.length > 0) && (
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="ti ti-target" style={{ color: 'var(--primary)' }}></i> Tujuan Pembelajaran
                          </h4>
                          <ul style={{ display: 'grid', gap: '8px', background: 'var(--surface-2)', padding: '14px 18px', borderRadius: '10px', listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {module.material.objectives.map((obj, i) => (
                              <li key={i} style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.5 }}>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Istilah Kunci */}
                      {(module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.keyTerms && module.material.keyTerms.length > 0) && (
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="ti ti-vocabulary" style={{ color: 'var(--primary)' }}></i> Istilah Kunci
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                            {module.material.keyTerms.map((term, i) => (
                              <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)', padding: '12px 14px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '14px', color: 'var(--primary-dark)', fontWeight: 700, marginBottom: '4px' }}>{term.term}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{term.def}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Penjelasan Teori Materi Lengkap */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="ti ti-file-text" style={{ color: 'var(--primary)' }}></i> Uraian Materi
                        </h4>
                        {module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.theory ? (
                          <div 
                            className="material-theory" 
                            style={{ 
                              background: 'var(--white)', 
                              border: '1px solid var(--border)', 
                              padding: '20px', 
                              borderRadius: '10px', 
                              lineHeight: 1.6,
                              fontSize: '14px'
                            }} 
                            dangerouslySetInnerHTML={{ __html: module.material.theory }} 
                          />
                        ) : (
                          <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                            <i className="ti ti-note" style={{ fontSize: '24px', display: 'block', marginBottom: '6px', color: 'var(--text-light)' }}></i>
                            Penjelasan materi modul belum ditambahkan.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* ── LANGKAH 2: SIMULASI INTERAKTIF (COLLAPSIBLE / DROPDOWN) ── */}
            <div className="collapsible-card">
              <div 
                className={`collapsible-header ${isStep2Open ? 'is-open' : ''}`}
                onClick={() => setIsStep2Open(!isStep2Open)}
              >
                <div className="collapsible-title-wrap">
                  <span className="step-chip" style={{ background: '#059669', color: '#fff', border: 'none' }}>
                    Langkah 2
                  </span>
                  <div className="collapsible-title">
                    <i className="ti ti-device-gamepad-2" style={{ color: '#059669' }}></i> Simulasi Interaktif ({module.games.length} Game)
                  </div>
                </div>

                <div className="collapsible-toggle-btn">
                  <span>{isStep2Open ? 'Minimize' : 'Buka Simulasi'}</span>
                  <i className={`ti ${isStep2Open ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isStep2Open && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="collapsible-body">
                      {/* Frame Game Aktif Jika Sedang Dimainkan */}
                      {activeGameId !== null && (
                        <div id="webgl-section" style={{ marginBottom: '20px' }}>
                          <div className="webgl-header" style={{ marginBottom: '10px' }}>
                            <div className="webgl-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="webgl-now-playing" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sedang Dimainkan:</span>
                                <strong className="webgl-game-name" style={{ fontSize: '14px', color: 'var(--text)' }}>{activeGame?.title}</strong>
                                <span className="badge badge-success" style={{ marginLeft: '4px' }}><i className="ti ti-player-play"></i> Aktif</span>
                              </div>
                              <button className="btn btn-danger btn-sm" onClick={onCloseGame} style={{ padding: '4px 10px', fontSize: '12px' }}>
                                <i className="ti ti-x"></i> Tutup Simulasi
                              </button>
                            </div>
                          </div>

                          <div className="webgl-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            {activeGame?.path ? (
                              (downloadingGame && !localGameSrc) ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
                                  <div className="loading-spinner" style={{ marginBottom: '12px' }}></div>
                                  <p style={{ fontSize: '13px' }}>{downloadProgress}</p>
                                </div>
                              ) : localGameSrc ? (
                                <iframe 
                                  src={localGameSrc} 
                                  style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }} 
                                  title={activeGame.title}
                                  onLoad={(e) => {
                                    try {
                                      const win = (e.target as HTMLIFrameElement).contentWindow as any;
                                      if (win && win.console) {
                                        const noop = () => {};
                                        win.console.log = noop;
                                        win.console.info = noop;
                                        win.console.debug = noop;
                                        win.console.warn = noop;
                                      }
                                    } catch (err) {}
                                  }}
                                />
                              ) : null
                            ) : (
                              <div className="webgl-placeholder" style={{ color: '#aaa', textAlign: 'center', padding: '24px' }}>
                                <div className="play-icon" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', margin: '0 auto 12px', width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}><i className="ti ti-device-gamepad-2"></i></div>
                                <p style={{ fontWeight: 600, color: '#fff', margin: '0 0 4px 0' }}>Simulasi belum tersedia</p>
                                <small style={{ color: '#888' }}>File simulasi interaktif sedang disiapkan.</small>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {activeGameId === null && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '13px', color: '#166534' }}>
                          <i className="ti ti-info-circle" style={{ fontSize: '18px', flexShrink: 0 }}></i>
                          <span>Mainkan simulasi berikut untuk memahami konsep sains secara langsung dan interaktif.</span>
                        </div>
                      )}
                      
                      {/* Daftar Game Simulasi */}
                      <div className="games-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {module.games.length === 0 ? (
                          <div className="empty-state" style={{ padding: '24px' }}>
                            <div className="empty-icon"><i className="ti ti-device-gamepad-2"></i></div>
                            <p>Belum ada game simulasi untuk modul ini.</p>
                          </div>
                        ) : (
                          module.games.map((game, idx) => {
                            const isPlayed = playedGames.has(game.id) || isModuleCompleted;
                            return (
                              <div key={game.id} className={`game-card ${activeGameId === game.id ? 'active-game' : isPlayed ? 'played' : ''}`} style={{ padding: '14px 16px' }}>
                                <div className="game-step-num">{idx + 1}</div>
                                <div className="game-info">
                                  <div className="game-title" style={{ fontSize: '14.5px' }}>{game.title}</div>
                                  <div className="game-desc" style={{ fontSize: '12.5px' }}>{game.desc}</div>
                                </div>
                                <div className="game-card-actions">
                                  <button className="btn btn-primary btn-sm" onClick={() => onLaunchGame(game.id, game.title)} style={{ padding: '6px 14px', fontSize: '13px' }}>
                                    <i className="ti ti-play"></i> Mainkan
                                  </button>
                                  {isPlayed && (
                                    <span className="played-badge" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                                      <i className="ti ti-check"></i> Selesai
                                    </span>
                                  )}
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
            <div className="collapsible-card" style={{ border: '1.5px solid var(--border)' }}>
              <div 
                className={`collapsible-header ${isStep3Open ? 'is-open' : ''}`}
                onClick={() => setIsStep3Open(!isStep3Open)}
              >
                <div className="collapsible-title-wrap">
                  <span className="step-chip" style={{ background: '#f59e0b', color: '#fff', border: 'none' }}>
                    Langkah 3
                  </span>
                  <div className="collapsible-title">
                    <i className="ti ti-list-check" style={{ color: '#d97706' }}></i> Evaluasi & Pembenaran Soal
                  </div>
                </div>

                <div className="collapsible-toggle-btn">
                  <span>{isStep3Open ? 'Minimize' : 'Buka Evaluasi'}</span>
                  <i className={`ti ${isStep3Open ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isStep3Open && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="collapsible-body" style={{ padding: '20px' }}>
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

        {/* Footer Navigasi */}
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-arrow-left"></i> Kembali ke Daftar Modul
          </button>
        </div>
      </div>
    </div>
  );
}
