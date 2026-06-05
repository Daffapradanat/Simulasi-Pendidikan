import React from 'react';
import { Module } from '../../types';
import * as XLSX from 'xlsx';

export default function ModulesView({ 
  modules, setView, setEditingModule, setModuleForm, 
  moduleSearch, setModuleSearch, handleRestoreModule, setModuleGameFiles, handleDeleteModule 
}: any) {
  const filteredModules = modules.filter(m => 
          m.title.toLowerCase().includes(moduleSearch.toLowerCase()) || 
          m.level.toLowerCase().includes(moduleSearch.toLowerCase())
        );
        return (
          <div className="admin-content">
            <h2 className="page-title">Manajemen Modul</h2>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="section-card-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}><i className="ti ti-list"></i> Daftar Modul</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '250px' }}>
                    <i className="ti ti-search" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}></i>
                    <input type="text" className="form-input" style={{ paddingLeft: '36px', height: '36px', margin: 0 }} placeholder="Cari modul..." value={moduleSearch} onChange={e => setModuleSearch(e.target.value)} />
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
                      <th style={{ width: '60px' }}>ID</th>
                      <th>Detail Modul</th>
                      <th>Spesifikasi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModules.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          <i className="ti ti-box" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
                          Kosong
                        </td>
                      </tr>
                    ) : (
                      filteredModules.map(mod => (
                      <tr key={mod.id} style={{ ...(mod.isDeleted ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}) }}>
                        <td>
                          <div style={{ fontWeight: 600 }}>#{mod.id}</div>
                          {mod.isDeleted && <span className="badge" style={{ background: 'var(--border)', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>Dihapus</span>}
                        </td>
                        <td style={{ textDecoration: mod.isDeleted ? 'line-through' : 'none' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--primary-dark)' }}>{mod.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mod.desc}</div>
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
                              setModuleGameFiles((mod.games || []).map(g => ({ file: new File([], "existing.zip"), title: g.title, desc: g.desc })));
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
              </div>
            </div>
          </div>
        );
}
