import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function TeachersView({
  teachers, teacherSearch, setTeacherSearch, setShowTeacherModal,
  setEditingTeacher, setTeacherForm, handleRestoreTeacher, handleDeleteTeacher, exportTeacherExcel
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const itemsPerPage = 8;

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
                          t.subject.toLowerCase().includes(teacherSearch.toLowerCase());
    
    if (statusFilter === 'active') return matchesSearch && !t.isDeleted;
    if (statusFilter === 'deleted') return matchesSearch && t.isDeleted;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const displayedTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-content">
      <h2 className="page-title">Manajemen Guru</h2>
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="section-card-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}><i className="ti ti-user-check"></i> Daftar Guru</div>
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
            <div style={{ position: 'relative', width: '220px' }}>
              <i className="ti ti-search" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}></i>
              <input type="text" className="form-input" style={{ paddingLeft: '36px', height: '36px', margin: 0 }} placeholder="Cari guru/mapel..." value={teacherSearch} onChange={e => { setTeacherSearch(e.target.value); setCurrentPage(1); }} />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={exportTeacherExcel}>
              <i className="ti ti-download"></i> Export Excel
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setEditingTeacher(null);
              setTeacherForm({ name: '', subject: '', nip: '', email: '' });
              setShowTeacherModal(true);
            }}>
              <i className="ti ti-plus"></i> Tambah Guru
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID / NIP</th>
                <th>Nama Guru & Email</th>
                <th>Mata Pelajaran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <i className="ti ti-user-check" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
                    Tidak ada guru yang sesuai
                  </td>
                </tr>
              ) : (
                displayedTeachers.map(t => (
                <tr key={t.id} style={{ ...(t.isDeleted ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}) }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.nip || '-'}</div>
                    {t.isDeleted && <span className="badge" style={{ background: 'var(--border)', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>Dihapus</span>}
                  </td>
                  <td style={{ textDecoration: t.isDeleted ? 'line-through' : 'none' }}>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.email || '-'}</div>
                  </td>
                  <td style={{ textDecoration: t.isDeleted ? 'line-through' : 'none' }}>
                    <span className="badge badge-primary">{t.subject}</span>
                  </td>
                  <td>
                    {t.isDeleted ? (
                      <span style={{ display: 'inline-block', background: 'var(--surface-2)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Nonaktif</span>
                    ) : (
                      <span style={{ display: 'inline-block', background: '#E3F2FD', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Aktif</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      setEditingTeacher(t);
                      setTeacherForm({ name: t.name, subject: t.subject, nip: t.nip || '', email: t.email || '' });
                      setShowTeacherModal(true);
                    }}>
                      <i className="ti ti-edit"></i> Edit
                    </button>
                    {t.isDeleted ? (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => handleRestoreTeacher(t.id)}>
                        <i className="ti ti-rotate-clockwise"></i> Restore
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteTeacher(t.id)}>
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
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} dari {filteredTeachers.length} guru
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
