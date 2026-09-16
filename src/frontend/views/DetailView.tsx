import { getBaseUrl } from '../../lib/basePath';
import { QuestionsView } from './QuestionsView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Module, User } from '../../types';

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
                      {/* Player moved */}

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
