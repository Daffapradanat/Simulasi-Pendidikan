import { getBaseUrl } from '../../lib/basePath';
import React, { useState, useEffect } from 'react';
import { Module, Subject, User } from '../../types';
import { MODULE_THUMBS } from '../../data';

const getFallbackThumb = (id: number) => {
  const themes = [
    { bg: '#0f172a', g1: '#3b82f6', g2: '#1d4ed8' },
    { bg: '#312e81', g1: '#8b5cf6', g2: '#6d28d9' },
    { bg: '#064e3b', g1: '#10b981', g2: '#059669' },
    { bg: '#831843', g1: '#f43f5e', g2: '#be123c' },
    { bg: '#451a03', g1: '#f59e0b', g2: '#d97706' }
  ];
  const t = themes[id % themes.length];
  
  return `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="${t.bg}"/>
    <rect x="0" y="0" width="280" height="140" fill="url(#g${id})" opacity="0.6"/>
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${t.g1}"/>
        <stop offset="100%" stop-color="${t.g2}"/>
      </linearGradient>
      <pattern id="pat${id}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.1)"/>
      </pattern>
    </defs>
    <rect width="280" height="140" fill="url(#pat${id})"/>
    <circle cx="140" cy="70" r="30" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <circle cx="140" cy="70" r="15" fill="rgba(255,255,255,0.2)"/>
  </svg>`;
};

const renderLevelBadge = (level: string) => {
  let style: React.CSSProperties = { fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap', letterSpacing: '0.3px', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' };
  let icon = 'ti-school';
  if (!level) return null;
  
  // Hash the level string to a hue
  let hash = 0;
  for (let i = 0; i < level.length; i++) {
    hash = level.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  
  style = { ...style, background: `hsl(${hue}, 70%, 90%)`, color: `hsl(${hue}, 80%, 30%)`, border: `1px solid hsl(${hue}, 70%, 80%)` };
  
  return <span style={style}><i className={`ti ${icon}`}></i> {level}</span>;
}

// --- MODULES VIEW ---
export function ModulesView({ modules, subjects, user, onOpenModule, lastModuleId, onRequireLogin, onBack }: { modules: Module[], subjects?: Subject[], user?: User | null, onOpenModule: (id: number) => void, lastModuleId: number | null, onRequireLogin?: () => void, onBack?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem('simpend_module_page');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    sessionStorage.setItem('simpend_module_page', currentPage.toString());
  }, [currentPage]);

  // Reset to page 1 on search
  useEffect(() => {
    if (searchQuery) setCurrentPage(1);
  }, [searchQuery]);

  const completed = modules.filter(m => m.status === 'completed').length;
  const available = modules.filter(m => m.status === 'unlocked').length;
  const locked = modules.filter(m => m.status === 'locked').length;
  const pct = modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0;
  
  const filteredModules = modules.filter(m => 
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.desc || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);
  const currentModules = filteredModules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  return (
    <div className="page active">
      <div className="main-wrapper">
        {onBack && (
          <div style={{ marginBottom: '24px' }}>
            <button className="btn btn-ghost" onClick={onBack} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-arrow-left"></i> Kembali ke Pilihan Mata Pelajaran
            </button>
          </div>
        )}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-books" aria-hidden="true"></i></div>
            <div className="stat-value">{modules.length}</div>
            <div className="stat-label">Total Modul</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-circle-check" aria-hidden="true"></i></div>
            <div className="stat-value">{completed}</div>
            <div className="stat-label">Selesai</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-lock-open" aria-hidden="true"></i></div>
            <div className="stat-value">{available}</div>
            <div className="stat-label">Tersedia</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="ti ti-lock" aria-hidden="true"></i></div>
            <div className="stat-value">{locked}</div>
            <div className="stat-label">Terkunci</div>
          </div>
        </div>
        
        <div className="section-card" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>Progres Keseluruhan</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{completed} / {modules.length} Modul</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill success" style={{ width: `${pct}%` }}></div>
          </div>
        </div>
        
        <div className="page-header">
          <div className="page-title">Daftar Modul Simulasi</div>
          <div className="page-subtitle">Selesaikan setiap modul secara berurutan untuk membuka modul berikutnya.</div>
        </div>

        <div className="search-box" style={{ marginBottom: "24px", position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", fontSize: "18px" }}></i>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Cari modul berdasarkan judul atau deskripsi..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ paddingLeft: "40px" }}
          />
        </div>
        
        <div>
          {currentModules.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: "1 / -1", padding: "48px 24px", textAlign: "center", background: "var(--card-bg, #ffffff)", borderRadius: "12px", border: "1px dashed var(--border, #e2e8f0)", marginTop: "20px" }}>
              <div className="empty-icon" style={{ fontSize: "36px", marginBottom: "12px", color: "var(--text-muted)" }}>
                <i className={searchQuery ? "ti ti-search" : "ti ti-books"}></i>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
                {searchQuery ? "Modul Tidak Ditemukan" : "Belum Ada Modul Pembelajaran"}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "460px", margin: "0 auto", lineHeight: "1.6" }}>
                {searchQuery 
                  ? `Tidak ada modul yang cocok dengan kata kunci "${searchQuery}".` 
                  : (user?.role === "admin" || user?.role === "guru" 
                      ? "Belum ada modul simulasi sains di sistem. Anda dapat membuat dan mengunggah modul baru melalui menu Dashboard."
                      : "Belum ada modul pembelajaran yang tersedia saat ini. Silakan hubungi guru atau admin pengampu.")
                }
              </p>
            </div>
          ) : (
            (subjects && subjects.length > 0) ? (
              subjects.map(subject => {
                const subjectModules = currentModules.filter(m => Number(m.subject_id) === Number(subject.id));
                if (subjectModules.length === 0) return null;
                return (
                  <div key={subject.id} style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)" }}>
                        <i className={`ti ${subject.icon || "ti-book"}`} style={{ color: "#ffffff" }}></i>
                      </div>
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 800, color: "var(--text)", margin: 0 }}>{subject.name}</h2>
                    </div>
                    <div className="modules-grid">
                      {subjectModules.map(mod => {
                        const isLastActive = mod.id === lastModuleId && mod.status !== 'completed';
                        return (
                          <div 
                            key={mod.id} 
                            className={`module-card ${mod.status}`} 
                            onClick={() => { 
                              if (mod.is_restricted && user?.isGuest) {
                                onRequireLogin && onRequireLogin();
                                return;
                              }
                              onOpenModule(mod.id); 
                            }} 
                            style={{ 
                              cursor: "pointer",
                              border: isLastActive ? "2px solid #f97316" : undefined,
                              boxShadow: isLastActive ? "0 4px 16px rgba(249, 115, 22, 0.18)" : undefined
                            }}
                          >
                            {mod.banner_url ? (
                              <div className="module-thumb" style={{ padding: 0, overflow: "hidden" }}>
                                <img src={(mod.banner_url || "").startsWith("/") ? `${getBaseUrl()}${(mod.banner_url).substring(1)}` : mod.banner_url} alt={mod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            ) : (
                              <div className="module-thumb" dangerouslySetInnerHTML={{ __html: MODULE_THUMBS[mod.id] || getFallbackThumb(mod.id) }} />
                            )}
                            <div className="module-card-inner">
                              <div className="module-card-top">
                                {mod.is_restricted && <span className="badge" style={{ background: "#f59e0b", color: "white", position: "absolute", top: "12px", right: "12px", zIndex: 10, border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" }}><i className="ti ti-lock"></i> Terbatas</span>}
                                {isLastActive ? (
                                  <span className="badge" style={{ background: "#f97316", color: "#ffffff", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <i className="ti ti-play"></i> Sedang Berjalan
                                  </span>
                                ) : mod.status === "completed" ? (
                                  <span className="badge badge-success"><i className="ti ti-check"></i> Selesai</span>
                                ) : mod.status === "locked" ? (
                                  <span className="badge" style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <i className="ti ti-lock"></i> Kuis Terkunci
                                  </span>
                                ) : (
                                  <span className="badge badge-primary"><i className="ti ti-lock-open"></i> Tersedia</span>
                                )}
                              </div>
                              <div className="module-card-body">
                                <div className="module-card-title">{mod.title}</div>
                                <div className="module-card-desc">
                                  <div style={{ marginBottom: (mod.material && typeof mod.material === "object" && mod.material.theory) ? "8px" : "0" }}>
                                    <strong>Deskripsi:</strong> {mod.desc}
                                  </div>
                                  {(mod.material && typeof mod.material === "object" && mod.material.theory) && (
                                    <div>
                                      <strong>Materi:</strong>{" "}
                                      <div style={{ display: "inline" }} dangerouslySetInnerHTML={{ __html: mod.material.theory.replace(/<[^>]+>/g, "").substring(0, 80) + "..." }}></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="module-card-footer">
                                <div className="module-meta">
                                  <i className="ti ti-device-gamepad-2"></i> {mod.gameCount || 0} simulasi &nbsp;·&nbsp; <i className="ti ti-clock"></i> {mod.duration}
                                </div>
                                {renderLevelBadge(mod.level)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="modules-grid">
                {currentModules.map(mod => {
                  const isLastActive = mod.id === lastModuleId && mod.status !== 'completed';
                  return (
                    <div 
                      key={mod.id} 
                      className={`module-card ${mod.status}`} 
                      onClick={() => { 
                        if (mod.is_restricted && user?.isGuest) {
                          onRequireLogin && onRequireLogin();
                          return;
                        }
                        onOpenModule(mod.id); 
                      }} 
                      style={{ 
                        cursor: "pointer",
                        border: isLastActive ? "2px solid #f97316" : undefined,
                        boxShadow: isLastActive ? "0 4px 16px rgba(249, 115, 22, 0.18)" : undefined
                      }}
                    >
                      <div className="module-card-inner">
                        <div className="module-card-top">
                          {mod.is_restricted && <span className="badge" style={{ background: "#f59e0b", color: "white", position: "absolute", top: "12px", right: "12px", zIndex: 10, border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" }}><i className="ti ti-lock"></i> Terbatas</span>}
                          {isLastActive ? (
                            <span className="badge" style={{ background: "#f97316", color: "#ffffff", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <i className="ti ti-play"></i> Sedang Berjalan
                            </span>
                          ) : mod.status === "completed" ? (
                            <span className="badge badge-success"><i className="ti ti-check"></i> Selesai</span>
                          ) : mod.status === "locked" ? (
                            <span className="badge" style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <i className="ti ti-lock"></i> Kuis Terkunci
                            </span>
                          ) : (
                            <span className="badge badge-primary"><i className="ti ti-lock-open"></i> Tersedia</span>
                          )}
                        </div>
                        <div className="module-card-title">{mod.title}</div>
                        <div className="module-card-footer" style={{ marginTop: "12px" }}>
                          <div className="module-meta">
                            <i className="ti ti-device-gamepad-2"></i> {mod.gameCount || 0} simulasi
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
            <button 
              className="btn btn-outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ padding: '8px 12px' }}
            >
              <i className="ti ti-chevron-left"></i>
            </button>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', padding: '0 8px' }}>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button 
              className="btn btn-outline" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '8px 12px' }}
            >
              <i className="ti ti-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
