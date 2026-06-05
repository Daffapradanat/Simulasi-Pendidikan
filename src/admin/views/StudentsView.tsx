import React from 'react';
import * as XLSX from 'xlsx';

export default function StudentsView({
  students, studentSearch, setStudentSearch, setShowStudentModal,
  handleRestoreStudent, handleDeleteStudent, exportToExcel
}: any) {
  const filteredStudents = students.filter(s => 
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
          s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
          (s.nisn && s.nisn.includes(studentSearch))
        );
        return (
          <div className="admin-content">
            <h2 className="page-title">Manajemen Siswa</h2>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="section-card-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}><i className="ti ti-users"></i> Daftar Siswa</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '250px' }}>
                    <i className="ti ti-search" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}></i>
                    <input type="text" className="form-input" style={{ paddingLeft: '36px', height: '36px', margin: 0 }} placeholder="Cari siswa/NISN..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={exportToExcel}>
                    <i className="ti ti-download"></i> Export Excel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowStudentModal(true)}>
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
                    {filteredStudents.map(s => (
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
                          {s.isDeleted ? (
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', padding: '4px 8px' }} onClick={() => handleRestoreStudent(s.id)}>
                              <i className="ti ti-rotate-clockwise"></i> Restore
                            </button>
                          ) : (
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px 8px' }} onClick={() => handleDeleteStudent(s.id)}>
                              <i className="ti ti-trash"></i> Hapus
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
}
