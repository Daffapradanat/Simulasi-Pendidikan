import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function StudentsView({
  students, studentSearch, setStudentSearch, setShowStudentModal,
  setEditingStudent, setStudentForm,
  handleRestoreStudent, handleDeleteStudent, exportToExcel
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const itemsPerPage = 8;

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          (s.nisn && s.nisn.includes(studentSearch));
    
    if (statusFilter === 'active') return matchesSearch && !s.isDeleted;
    if (statusFilter === 'deleted') return matchesSearch && s.isDeleted;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const displayedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-content">
      <h2 className="page-title">Manajemen Siswa</h2>
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="section-card-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}><i className="ti ti-users"></i> Daftar Siswa</div>
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
              <input type="text" className="form-input" style={{ paddingLeft: '36px', height: '36px', margin: 0 }} placeholder="Cari siswa/NISN..." value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setCurrentPage(1); }} />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={exportToExcel}>
              <i className="ti ti-download"></i> Export Excel
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setEditingStudent(null);
              setStudentForm({ name: '', email: '', nisn: '', asalSekolah: '' });
              setShowStudentModal(true);
            }}>
              <i className="ti ti-plus"></i> Tambah Siswa
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID / NISN</th>
                <th>Nama Siswa</th>
                <th>Asal Sekolah</th>
                <th>Email</th>
                <th>Progres Belajar (%)</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <i className="ti ti-users" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
                    Tidak ada siswa yang sesuai
                  </td>
                </tr>
              ) : (
                displayedStudents.map(s => (
                <tr key={s.id} style={{ ...(s.isDeleted ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}) }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.nisn || '-'}</div>
                    {s.isDeleted && <span className="badge" style={{ background: 'var(--border)', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>Dihapus</span>}
                  </td>
                  <td style={{ textDecoration: s.isDeleted ? 'line-through' : 'none' }}>{s.name}</td>
                  <td style={{ textDecoration: s.isDeleted ? 'line-through' : 'none' }}>{s.asalSekolah || '-'}</td>
                  <td style={{ textDecoration: s.isDeleted ? 'line-through' : 'none' }}>{s.email}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div className="progress-bar" style={{ width: '80px', margin: 0, height: '8px' }}>
                         <div className="progress-fill success" style={{ width: `${s.progress}%` }}></div>
                       </div>
                       <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{s.progress}%</span>
                    </div>
                  </td>
                  <td>
                    {s.isDeleted ? (
                      <span style={{ display: 'inline-block', background: 'var(--surface-2)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Nonaktif</span>
                    ) : s.progress === 100 ? (
                      <span style={{ display: 'inline-block', background: 'var(--success-light)', color: 'var(--success)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Lulus</span>
                    ) : s.progress > 0 ? (
                      <span style={{ display: 'inline-block', background: '#E3F2FD', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Aktif</span>
                    ) : (
                      <span style={{ display: 'inline-block', background: '#F3F4F6', color: '#6B7280', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Belum Mulai</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      setEditingStudent(s);
                      setStudentForm({ name: s.name, email: s.email, nisn: s.nisn || '', asalSekolah: s.asalSekolah || '' });
                      setShowStudentModal(true);
                    }}>
                      <i className="ti ti-edit"></i> Edit
                    </button>
                    {s.isDeleted ? (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', padding: '4px 8px' }} onClick={() => handleRestoreStudent(s.id)}>
                        <i className="ti ti-rotate-clockwise"></i> Restore
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px 8px' }} onClick={() => handleDeleteStudent(s.id)}>
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
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} siswa
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
