import { getBaseUrl } from '../../lib/basePath';
import { QuestionsView } from './QuestionsView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Module, User } from '../../types';
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

  const activeGame = module.games?.find(g => g.id === activeGameId);
  const totalGames = module.games?.length || 0;
  const isModuleCompleted = module.status === 'completed';
  const allPlayed = totalGames === 0 || isModuleCompleted || (module.games || []).every(g => playedGames.has(g.id));
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isMateriOpen, setIsMateriOpen] = useState(true);
  const [isGamesOpen, setIsGamesOpen] = useState(true);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true);
  const [materiTab, setMateriTab] = useState<'theory' | 'glossary'>('theory');

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
    if (activeGameId) {
      const game = module.games?.find((g: any) => g.id === activeGameId);
      if (!game) {
        setLocalGameSrc(null);
        return;
      }

      if (game.path?.endsWith('.zip')) {
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
                 .then(res => {
                   if (!res.ok) throw new Error('Zip file not found on server');
                   return res.blob();
                 })
                 .then(blob => JSZip.loadAsync(blob))
                 .then(async (zip) => {
                   setDownloadProgress('Mengekstrak simulasi...');
                   let indexPath = 'index.html';
                   
                   let foundIndex = false;
                   for (const filename of Object.keys(zip.files)) {
                     if (filename.endsWith('index.html') && !filename.includes('__MACOSX')) {
                       indexPath = filename;
                       foundIndex = true;
                       break;
                     }
                   }
                   
                   const openCache = await caches.open(cacheName);
                   
                   const promises = [];
                   for (const [filename, zipEntry] of Object.entries(zip.files)) {
                     if (!zipEntry.dir && !filename.includes('__MACOSX')) {
                       const fullPath = gamePrefix + filename;
                       promises.push(
                         zipEntry.async('blob').then(fileBlob => {
                           const headers = new Headers();
                           headers.set('Content-Type', getMimeType(filename));
                           const res = new Response(fileBlob, { headers });
                           return openCache.put(new Request(fullPath), res);
                         })
                       );
                     }
                   }
                   
                   await Promise.all(promises);
                   
                   setDownloadingGame(false);
                   setLocalGameSrc(gamePrefix + indexPath);
                 })
                 .catch(err => {
                   console.warn('Local zip extraction fallback to server static:', err);
                   const fallbackUrl = `${getBaseUrl()}games/game_${game.id}/index.html`;
                   setLocalGameSrc(fallbackUrl);
                   setDownloadingGame(false);
                 });
            }
          });
        });
      } else if (game.path) {
        const fullSrc = game.path.startsWith('/') ? `${getBaseUrl()}${game.path.substring(1)}` : game.path;
        setLocalGameSrc(fullSrc);
      } else {
        setLocalGameSrc(null);
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
      document.getElementById('webgl-simulation-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeGameId]);

  return (
    <div className="page active" style={{ paddingBottom: '60px' }}>
      <div className="main-wrapper">
        {/* Navigation & Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div className="breadcrumb" style={{ margin: 0 }}>
              <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }} onClick={onBack}>
                <i className="ti ti-arrow-left" style={{ marginRight: '4px' }}></i> Daftar Modul
              </span>
              <span className="sep">›</span>
              <span className="current" style={{ color: '#64748b' }}>{module.title}</span>
            </div>

            <button 
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
                <i className="ti ti-clock" style={{ color: 'var(--primary)' }}></i> {module.duration || '30 Menit'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="ti ti-device-gamepad-2" style={{ color: 'var(--primary)' }}></i> {module.games?.length || 0} Simulasi Interaktif
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
                                  title={activeGame.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : null
                            ) : (
                              <div style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                                <i className="ti ti-device-gamepad-2" style={{ fontSize: '36px', marginBottom: '8px', display: 'block', color: '#475569' }}></i>
                                <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#f8fafc' }}>Game Belum Tersedia</p>
                                <span style={{ fontSize: '12px' }}>File simulasi game belum diunggah oleh guru/admin.</span>
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
                      Evaluasi & Pembenaran Soal
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
