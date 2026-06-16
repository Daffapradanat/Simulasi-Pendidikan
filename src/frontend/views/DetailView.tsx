import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Module, User } from '../../types';
import { MODULE_THUMBS } from '../../data';

// --- DETAIL VIEW ---
export function DetailView({ 
  module, 
  onBack, 
  activeGameId, 
  playedGames, 
  onLaunchGame, 
  onCloseGame, 
  onCompleteModule 
}: {
  module: Module;
  onBack: () => void;
  activeGameId: number | null;
  playedGames: Set<number>;
  onLaunchGame: (id: number, title: string) => void;
  onCloseGame: () => void;
  onCompleteModule: () => void;
}) {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [module.id]);
  const activeGame = module.games.find(g => g.id === activeGameId);
  const totalGames = module.games.length;
  const isModuleCompleted = module.status === 'completed';
  const allPlayed = totalGames === 0 || isModuleCompleted || module.games.every(g => playedGames.has(g.id));
  
  useEffect(() => {
    if (activeGameId !== null) {
      document.getElementById('webgl-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeGameId]);

  return (
    <div className="page active">
      <div className="main-wrapper">
        <div className="page-header">
          <div className="breadcrumb">
            <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={onBack}>Daftar Modul</span>
            <span className="sep">›</span>
            <span className="current">{module.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="page-title">{module.title}</div>
            {module.status === 'completed' ? (
               <span className="badge badge-success"><i className="ti ti-circle-check"></i> Selesai</span>
            ) : (
               <span className="badge badge-primary"><i className="ti ti-play"></i> Sedang Berjalan</span>
            )}
          </div>
          <div className="page-subtitle">{module.desc}</div>
        </div>
        
        <div className="detail-layout">
          <div className="detail-main">
            <div className="section-card material-card" style={{ marginBottom: '24px' }}>
              <div className="section-card-title">
                <i className="ti ti-book-2"></i> Materi Simulasi
                <span className="step-chip">Langkah 1</span>
              </div>
              
              <div className="material-intro" style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '15px', color: 'var(--text)', lineHeight: 1.6 }}>
                  {module.desc}
                </p>
              </div>

              {(module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.objectives && module.material.objectives.length > 0) && (
                <div className="material-block" style={{ marginBottom: '28px' }}>
                  <div className="material-subtitle"><i className="ti ti-target" style={{ color: 'var(--primary)' }}></i> Tujuan Pembelajaran</div>
                  <ul className="material-objectives" style={{ display: 'grid', gap: '10px', background: 'var(--surface-2)', padding: '16px 20px', borderRadius: '8px' }}>
                    {module.material.objectives.map((obj, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', lineHeight: 1.5 }}>
                        <i className="ti ti-check" style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0, fontWeight: 800 }}></i>
                        <span style={{ color: 'var(--text)' }}>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="material-block" style={{ marginBottom: '28px' }}>
                <div className="material-subtitle"><i className="ti ti-file-text" style={{ color: 'var(--primary)' }}></i> Penjelasan Materi</div>
                {module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.theory ? (
                  <div className="material-theory" style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} dangerouslySetInnerHTML={{ __html: module.material.theory }} />
                ) : (
                  <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <i className="ti ti-note" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}></i>
                    Belum ada penjelasan materi yang ditambahkan.
                  </div>
                )}
              </div>
              
              {(module.material && typeof module.material === 'object' && !Array.isArray(module.material) && module.material.keyTerms && module.material.keyTerms.length > 0) && (
                <div className="material-block" style={{ marginBottom: 0 }}>
                  <div className="material-subtitle"><i className="ti ti-vocabulary" style={{ color: 'var(--primary)' }}></i> Istilah Kunci</div>
                  <div className="material-terms" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                    {module.material.keyTerms.map((term, i) => (
                      <div key={i} className="term-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="term-name" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 700 }}>{term.term}</span>
                        <span className="term-def" style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>{term.def}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="section-card">
              <div className="section-card-title">
                <i className="ti ti-device-gamepad-2"></i> Simulasi Interaktif
                <span className="step-chip">Langkah 2</span>
              </div>
              
              {activeGameId !== null && (
                <div id="webgl-section" style={{ marginBottom: '24px' }}>
                  <div className="webgl-header">
                    <div className="webgl-title-row">
                      <span className="webgl-now-playing">Sedang dimainkan:</span>
                      <strong className="webgl-game-name">{activeGame?.title}</strong>
                      <span className="badge badge-success" style={{ marginLeft: '4px' }}><i className="ti ti-wifi"></i> Aktif</span>
                    </div>
                  </div>
                  <div className="webgl-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', aspectRatio: '16/9', background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {activeGame?.path ? (
                      <iframe 
                        src={activeGame.path} 
                        style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }} 
                        title={activeGame.title} 
                      />
                    ) : (
                      <div className="webgl-placeholder" style={{ color: '#aaa', textAlign: 'center' }}>
                        <div className="play-icon" style={{ background: '#e9ecef', color: '#adb5bd', margin: '0 auto 16px', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="ti ti-device-gamepad-2"></i></div>
                        <p style={{ fontWeight: 600, color: '#495057' }}>Game belum diupload</p>
                        <small>Pastikan game telah diupload dan ada file index.html di root zip.</small>
                      </div>
                    )}
                  </div>
                  <div className="webgl-controls">
                    <button className="btn btn-danger btn-sm" onClick={onCloseGame}>
                      <i className="ti ti-x"></i> Tutup Game
                    </button>
                    <div className="webgl-hint">Tutup game lalu mainkan semua game untuk melanjutkan.</div>
                  </div>
                </div>
              )}
              
              <div className="alert alert-warning" style={{ marginBottom: '14px', display: activeGameId !== null ? 'none' : 'flex' }}>
                <i className="ti ti-alert-triangle"></i>
                Mainkan <strong>semua game</strong> di bawah ini sebelum menandai modul selesai.
              </div>
              
              <div className="games-list">
                {module.games.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎮</div>
                    <p>Game akan segera tersedia.</p>
                  </div>
                ) : (
                  module.games.map((game, idx) => {
                    const isPlayed = playedGames.has(game.id) || isModuleCompleted;
                    return (
                      <div key={game.id} className={`game-card ${activeGameId === game.id ? 'active-game' : isPlayed ? 'played' : ''}`}>
                        <div className="game-step-num">{idx + 1}</div>
                        <div className="game-info">
                          <div className="game-title">{game.title}</div>
                          <div className="game-desc">{game.desc}</div>
                        </div>
                        <div className="game-card-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => onLaunchGame(game.id, game.title)}>
                            <i className="ti ti-player-play-filled"></i> Mainkan
                          </button>
                          {isPlayed && (
                            <span className="played-badge">
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
            
            <div className="section-card complete-card">
              <div className="section-card-title">
                <i className="ti ti-circle-check"></i> Tandai Modul Selesai
                <span className="step-chip">Langkah 3</span>
              </div>
              <p className="complete-hint">Mainkan semua game simulasi di atas, lalu klik tombol di bawah untuk menyelesaikan modul dan membuka modul berikutnya.</p>
              <button 
                className={`btn btn-primary btn-complete ${!allPlayed ? 'disabled' : ''}`}
                disabled={!allPlayed}
                title={!allPlayed ? `Mainkan ${totalGames - playedGames.size} game lagi untuk melanjutkan` : ''}
                onClick={onCompleteModule}
              >
                <i className="ti ti-circle-check"></i>
                Tandai Selesai &amp; Buka Modul Berikutnya
              </button>
            </div>
          </div>
          
          <div className="detail-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-card-title"><i className="ti ti-info-circle"></i> Informasi Modul</div>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-key">Nomor Modul</span>
                  <span className="info-val">{module.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Jenjang</span>
                  <span className="info-val">{module.level}</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Estimasi Waktu</span>
                  <span className="info-val">{module.duration}</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Jumlah Game</span>
                  <span className="info-val">{module.gameCount} Game Simulasi</span>
                </div>
              </div>
            </div>
            
            <div className="sidebar-card">
              <div className="sidebar-card-title"><i className="ti ti-list-check"></i> Alur Belajar</div>
              <div className="step-guide">
                <div className="step-guide-item">
                  <div className="step-guide-num">1</div>
                  <div className="step-guide-text">Baca dan pahami materi pembelajaran</div>
                </div>
                <div className="step-guide-connector"></div>
                <div className="step-guide-item">
                  <div className="step-guide-num">2</div>
                  <div className="step-guide-text">Mainkan <strong>semua</strong> game simulasi</div>
                </div>
                <div className="step-guide-connector"></div>
                <div className="step-guide-item">
                  <div className="step-guide-num">3</div>
                  <div className="step-guide-text">Klik <strong>Tandai Selesai</strong> untuk lanjut</div>
                </div>
              </div>
            </div>
            
            <button className="btn btn-ghost btn-full" onClick={onBack}>
              <i className="ti ti-arrow-left"></i> Kembali ke Daftar Modul
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
