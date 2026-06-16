import React, { useState } from 'react';
import { Module } from '../../types';
import * as XLSX from 'xlsx';

export default function ModulesView({ 
  modules, setView, setEditingModule, setModuleForm, 
  moduleSearch, setModuleSearch, handleRestoreModule, setModuleGameFiles, handleDeleteModule 
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const itemsPerPage = 6;

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(moduleSearch.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = !m.isDeleted;
    if (statusFilter === 'deleted') matchesStatus = m.isDeleted;
    
    let matchesLevel = true;
    if (levelFilter !== 'all') matchesLevel = m.level === levelFilter;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const displayedModules = filteredModules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const confirmClearAll = async () => {
    if (window.confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA modul beserta file games dan uploads? Tindakan ini tidak dapat dibatalkan!")) {
      try {
        const res = await fetch("/api/admin/clear_all", { method: "POST" });
        if (res.ok) {
          alert("Semua modul dan file berhasil dikosongkan!");
          window.location.reload();
        } else {
          alert("Gagal mengosongkan modul.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Manajemen Modul</h2>
        <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)', padding: '6px 16px', fontSize: '13px' }} onClick={confirmClearAll}>
          <i className="ti ti-trash"></i> Kosongkan Semua Modul
        </button>
      </div>
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="section-card-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}><i className="ti ti-list"></i> Daftar Modul</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              className="form-input" 
              style={{ height: '36px', minHeight: '36px', margin: 0, width: 'auto', minWidth: '150px', backgroundColor: 'var(--surface)', cursor: 'pointer' }} 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="deleted">Dihapus</option>
            </select>
            <select 
              className="form-input" 
              style={{ height: '36px', minHeight: '36px', margin: 0, width: 'auto', minWidth: '160px', backgroundColor: 'var(--surface)', cursor: 'pointer' }} 
              value={levelFilter} 
              onChange={e => { setLevelFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Jenjang</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="Umum">Umum</option>
            </select>
            <div style={{ position: 'relative', width: '200px' }}>
              <i className="ti ti-search" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}></i>
              <input type="text" className="form-input" style={{ paddingLeft: '36px', height: '36px', margin: 0 }} placeholder="Cari judul modul..." value={moduleSearch} onChange={e => { setModuleSearch(e.target.value); setCurrentPage(1); }} />
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => {
                setEditingModule(null);
                setModuleForm({ title: '', desc: '', level: 'SD', duration: '', objectives: '', theory: '', keyTerms: [] });
                setView('modules_add_edit');
              }}
            >
              <i className="ti ti-plus"></i> Tambah Modul Baru
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>Detail Modul</th>
                <th>Spesifikasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedModules.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <i className="ti ti-box" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
                    Tidak ada modul yang sesuai
                  </td>
                </tr>
              ) : (
                displayedModules.map(mod => (
                <tr key={mod.id} style={{ ...(mod.isDeleted ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}) }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{modules.findIndex(m => m.id === mod.id) + 1}</div>
                    {mod.isDeleted && <span className="badge" style={{ background: 'var(--border)', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>Dihapus</span>}
                  </td>
                  <td style={{ textDecoration: mod.isDeleted ? 'line-through' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--primary-dark)' }}>{mod.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mod.desc}</div>
                    {(!mod.material || !mod.material.theory || mod.material.theory.trim() === '') && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFF3E0', color: '#E65100', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>
                        <i className="ti ti-alert-triangle"></i> Penjelasan Materi Kosong
                      </div>
                    )}
                  </td>
                  <td style={{ textDecoration: mod.isDeleted ? 'line-through' : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text)' }}><i className="ti ti-school" style={{ color: 'var(--primary)', width: '16px' }}></i> <strong>Jenjang:</strong> {mod.level}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text)' }}><i className="ti ti-clock" style={{ color: 'var(--warning)', width: '16px' }}></i> <strong>Durasi:</strong> {mod.duration || '-'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text)' }}><i className="ti ti-device-gamepad" style={{ color: 'var(--success)', width: '16px' }}></i> <strong>Game:</strong> {mod.gameCount || 0} File</div>
                    </div>
                  </td>
                  <td>
                    {mod.isDeleted ? (
                      <span style={{ display: 'inline-block', background: 'var(--surface-2)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nonaktif</span>
                    ) : (
                      <span style={{ display: 'inline-block', background: '#E3F2FD', color: 'var(--primary)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aktif</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => {
                        setEditingModule(mod);
                        setModuleForm({ 
                          title: mod.title, 
                          desc: mod.desc, 
                          level: mod.level, 
                          duration: mod.duration || '', 
                          objectives: mod.material?.objectives?.join('\n') || '',
                          theory: mod.material?.theory || '',
                          keyTerms: mod.material?.keyTerms || []
                        });
                        setModuleGameFiles((mod.games || []).map((g: any) => ({ file: null, title: g.title, desc: g.desc, id: g.id, path: g.path })));
                        setView('modules_add_edit');
                      }}
                    ><i className="ti ti-edit"></i> Edit</button>
                    {mod.isDeleted ? (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => handleRestoreModule(mod.id)}>
                        <i className="ti ti-rotate-clockwise"></i> Restore
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteModule(mod.id)}>
                        <i className="ti ti-trash"></i> Hapus
                      </button>
                    )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredModules.length)} dari {filteredModules.length} modul
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="btn btn-ghost btn-sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{ padding: '4px 8px' }}
                >
                  <i className="ti ti-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="btn btn-ghost btn-sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{ padding: '4px 8px' }}
                >
                  <i className="ti ti-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
