import React, { useState, useEffect } from 'react';
import { Module } from '../../types';
import { MODULE_THUMBS } from '../../data';

// --- MODULES VIEW ---
export function ModulesView({ modules, onOpenModule }: { modules: Module[], onOpenModule: (id: number) => void }) {
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
              <div key={mod.id} className={`module-card ${mod.status}`} onClick={() => onOpenModule(mod.id)}>
              <div className="module-thumb" dangerouslySetInnerHTML={{ __html: MODULE_THUMBS[mod.id] || '' }} />
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
                  <span className="module-level">{mod.level}</span>
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
