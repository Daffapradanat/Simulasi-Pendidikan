import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function StudentsView({
  students, studentSearch, setStudentSearch, setShowStudentModal,
  setEditingStudent, setStudentForm,
  handleRestoreStudent, handleDeleteStudent, exportToExcel
}: any) {
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingProfile, setViewingProfile] = useState<any>(null);

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
                <th>No.</th>
                <th>NISN</th>
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
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <i className="ti ti-users" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
                    Tidak ada siswa yang sesuai
                  </td>
                </tr>
              ) : (
                displayedStudents.map((s, index) => (
                <tr key={s.id} style={{ ...(s.isDeleted ? { filter: 'grayscale(100%)', opacity: 0.5 } : {}) }}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.nisn || '-'}</div>
                    {s.isDeleted && <span className="badge" style={{ background: 'var(--border)', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>Dihapus</span>}
                  </td>
                  <td style={{ textDecoration: s.isDeleted ? 'line-through' : 'none' }}>{s.name}</td>
                  <td style={{ textDecoration: s.isDeleted ? 'line-through' : 'none' }}>{s.asalSekolah || '-'}</td>
                  <td style={{ textDecoration: s.isDeleted ? 'line-through' : 'none' }}>{s.email}</td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {s.subjectProgress && Object.keys(s.subjectProgress).length > 0 ? (
                         Object.entries(s.subjectProgress).map(([subName, pct]) => (
                           <div key={subName} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                             <div style={{ width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>{subName}</div>
                             <div className="progress-bar" style={{ width: '60px', margin: 0, height: '6px' }}>
                               <div className="progress-fill success" style={{ width: `${pct}%` }}></div>
                             </div>
                             <span style={{ fontWeight: 500 }}>{pct as number}%</span>
                           </div>
                         ))
                       ) : (
                         <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>-</span>
                       )}
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

      {viewingProfile && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-user-circle" style={{ color: 'var(--primary)', fontSize: '24px' }}></i> Profil Siswa
              </h3>
              <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={() => setViewingProfile(null)}>
                <i className="ti ti-x" style={{ fontSize: '20px' }}></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--surface-2)', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {viewingProfile.avatar ? (
                      <img src={viewingProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="ti ti-user" style={{ fontSize: '48px', color: 'var(--text-light)' }}></i>
                    )}
                  </div>
                  <label htmlFor="upload-avatar" style={{ position: 'absolute', bottom: '0', right: '0', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <i className="ti ti-camera" style={{ fontSize: '16px' }}></i>
                  </label>
                  <input type="file" id="upload-avatar" style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
              if (file.size > 5 * 1024 * 1024) { alert('Maksimal ukuran gambar adalah 5MB.'); e.target.value = ''; return; }
                    
                    const formData = new FormData();
                    formData.append('avatar', file);
                    
                    try {
                      const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.url) {
                           // Update the user avatar
                           await fetch(`/api/students/${viewingProfile.id}`, {
                             method: 'PUT',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ avatar: data.url })
                           });
                           setViewingProfile({...viewingProfile, avatar: data.url});
                           // Also we might need to trigger a re-fetch of students list. 
                           // For simplicity, we just mutate the current view.
                           const sIdx = students.findIndex((s:any) => s.id === viewingProfile.id);
                           if (sIdx !== -1) students[sIdx].avatar = data.url;
                        }
                      }
                    } catch (error) {
                      console.error("Failed to upload avatar", error);
                    }
                  }} />
                </div>
                
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 800 }}>{viewingProfile.name}</h2>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i className="ti ti-id"></i> {viewingProfile.nisn || '-'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i className="ti ti-building"></i> {viewingProfile.asalSekolah || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-primary">Siswa</span>
                    {viewingProfile.isDeleted && <span className="badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Nonaktif</span>}
                  </div>
                </div>
              </div>
              
              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)' }}>INFORMASI KONTAK</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-mail"></i>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{viewingProfile.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>PROGRES BELAJAR</h4>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{viewingProfile.progress}%</span>
                </div>
                
                {viewingProfile.subjectProgress && Object.keys(viewingProfile.subjectProgress).length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                     {Object.entries(viewingProfile.subjectProgress).map(([subName, pct]) => (
                       <div key={subName} style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '8px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                           <span>{subName}</span>
                           <span>{pct as number}%</span>
                         </div>
                         <div className="progress-bar" style={{ height: '6px', margin: 0 }}>
                           <div className="progress-fill success" style={{ width: `${pct}%` }}></div>
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-light)', fontSize: '14px' }}>
                    Belum ada progres modul yang diselesaikan.
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
