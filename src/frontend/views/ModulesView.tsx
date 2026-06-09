import React, { useState, useEffect } from 'react';
import { Module } from '../../types';

const THUMB_IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
  2: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  3: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
  4: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
  5: 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?auto=format&fit=crop&w=600&q=80',
};

const renderLevelBadge = (level: string) => {
  let style: React.CSSProperties = { fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap', letterSpacing: '0.3px', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' };
  let icon = 'ti-school';
  if (level.toUpperCase().includes('SD')) {
    style = { ...style, background: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c' };
  } else if (level.toUpperCase().includes('SMP')) {
    style = { ...style, background: '#0284c7', color: '#ffffff', border: '1px solid #0369a1' };
  } else if (level.toUpperCase().includes('SMA')) {
    style = { ...style, background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb' };
  } else {
    style = { ...style, background: 'var(--primary-light)', color: 'var(--primary)' };
  }
  return <span style={style}><i className={`ti ${icon}`}></i> {level}</span>;
}

// --- MODULES VIEW ---
export function ModulesView({ modules, onOpenModule, lastModuleId }: { modules: Module[], onOpenModule: (id: number) => void, lastModuleId: number | null }) {
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
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);
  const currentModules = filteredModules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  return (
    <div className="page active">
      <div className="main-wrapper">
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

        {lastModuleId && modules.find(m => m.id === lastModuleId) && (
          <div className="section-card continue-session-card" style={{ 
            marginBottom: '28px', 
            background: 'var(--primary)', 
            color: 'white',
            border: 'none', 
            padding: '20px 24px', 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(13,71,161,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 min-content' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                <i className="ti ti-player-play-filled"></i>
              </div>
              <div style={{ minWidth: '150px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Lanjutkan Sesi Terakhir</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{modules.find(m => m.id === lastModuleId)?.title}</div>
              </div>
            </div>
            <button className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, padding: '10px 20px', whiteSpace: 'nowrap', border: 'none' }} onClick={() => onOpenModule(lastModuleId)}>
              Lanjutkan Sekarang <i className="ti ti-arrow-right"></i>
            </button>
          </div>
        )}

        <div className="search-box" style={{ marginBottom: '24px', position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '18px' }}></i>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Cari modul berdasarkan judul atau deskripsi..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ paddingLeft: '40px' }}
          />
        </div>
        
        <div className="modules-grid">
          {currentModules.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon">🔍</div>
              <p>Modul tidak ditemukan untuk pencarian "{searchQuery}".</p>
            </div>
          ) : (
            currentModules.map(mod => (
              <div key={mod.id} className={`module-card ${mod.status}`} onClick={() => { if (mod.status !== 'locked') onOpenModule(mod.id); }} style={{ cursor: mod.status === 'locked' ? 'not-allowed' : 'pointer', opacity: mod.status === 'locked' ? 0.7 : 1 }}>
                <div className="module-thumb">
                  {THUMB_IMAGES[mod.id] ? (
                    <img src={THUMB_IMAGES[mod.id]} alt={mod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{width:'100%',height:'100%',background:'#0D1B2E',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}><i className="ti ti-photo" style={{fontSize:'32px'}}></i></div>
                  )}
                </div>
                <div className="module-card-inner">
                  <div className="module-card-top">
                    <div className="module-number">{modules.findIndex(m => m.id === mod.id) + 1}</div>
                    {mod.status === 'locked' && <span className="module-lock-icon"><i className="ti ti-lock"></i></span>}
                    {mod.status === 'completed' && <span className="badge badge-success"><i className="ti ti-check"></i> Selesai</span>}
                    {mod.status === 'unlocked' && <span className="badge badge-primary"><i className="ti ti-lock-open"></i> Tersedia</span>}
                  </div>
                  <div className="module-card-body">
                    <div className="module-card-title">{mod.title}</div>
                    <div className="module-card-desc">{mod.desc}</div>
                  </div>
                  <div className="module-card-footer">
                    <div className="module-meta">
                      <i className="ti ti-device-gamepad-2"></i> {mod.gameCount} game &nbsp;·&nbsp; <i className="ti ti-clock"></i> {mod.duration}
                    </div>
                    {renderLevelBadge(mod.level)}
                  </div>
                </div>
              </div>
            )))}
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
