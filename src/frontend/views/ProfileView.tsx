import { getBaseUrl } from '../../lib/basePath';
import { toast } from '../../components/Toast';

import React, { useState } from 'react';
import { Module, User, Subject } from '../../types';
import { fetchAuth } from '../../lib/fetchAuth';

// --- PROFILE VIEW ---
export function ProfileView({ user, completedModuleIds, modules, subjects = [], setUser, reflections = {} }: { user: User, completedModuleIds: Set<number>, modules: Module[], subjects?: Subject[], setUser: (u: User) => void, reflections?: Record<number, string> }) {
  const completedCount = completedModuleIds.size;
  const pct = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, email: user.email, password: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Group by subjects
  const subjectProgress = subjects.map(sub => {
    const subModules = modules.filter(m => m.subject_id === sub.id);
    const subCompleted = subModules.filter(m => completedModuleIds.has(m.id)).length;
    const subPct = subModules.length ? Math.round((subCompleted / subModules.length) * 100) : 0;
    return { ...sub, total: subModules.length, completed: subCompleted, pct: subPct };
  }).filter(sp => sp.total > 0);

  return (
    <div className="page active">
      <div className="main-wrapper" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <div className="page-title">Profil Pengguna</div>
          <div className="page-subtitle">Informasi akun dan progres belajarmu</div>
        </div>

        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', overflow: 'hidden' }}>
              {(user as any).avatar ? (
                <img src={((user as any).avatar || "").startsWith("/") ? `${getBaseUrl()}${((user as any).avatar).substring(1)}` : (user as any).avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=100`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            {!user.isGuest && (
              <>
                <label htmlFor="upload-my-avatar" style={{ position: 'absolute', bottom: '0', right: '0', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} title="Ubah Foto Profil">
                  <i className="ti ti-camera" style={{ fontSize: '16px' }}></i>
                </label>
                <input type="file" id="upload-my-avatar" style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { toast.error('Maksimal ukuran gambar adalah 5MB.'); e.target.value = ''; return; }
                  const formData = new FormData();
                  formData.append('avatar', file);
                  
                  try {
                    const res = await fetchAuth('/api/upload-avatar', { method: 'POST', body: formData });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.url) {
                         // Update the user avatar in backend
                         await fetchAuth(`/api/users/${user.id}/avatar`, {
                           method: 'PUT',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ avatar: data.url, role: user.role })
                         });
                         setUser({...user, avatar: data.url} as User);
                         toast.success('Foto profil berhasil diperbarui!');
                      }
                    }
                  } catch (error: any) {
                    console.error("Failed to upload avatar", error);
                    toast.error(`Gagal upload avatar: ${error.message || 'Terjadi kesalahan'}`);
                  }
                }} />
              </>
            )}
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text)' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user.isGuest ? 'Sesi Tamu' : user.email}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginTop: '8px' }}>
              <span className="badge badge-primary"><i className="ti ti-user"></i> Peran: {user.isGuest ? 'Siswa (Tamu)' : user.role}</span>
            </div>
            {user.isGuest && (
              <div style={{ marginTop: '12px', padding: '8px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '400px' }}>
                <i className="ti ti-info-circle" style={{ marginRight: '6px' }}></i>
                Foto profil otomatis dibuat berdasarkan inisial nama untuk mode tamu.
              </div>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-title"><i className="ti ti-chart-bar"></i> Statistik Belajar Keseluruhan</div>
          <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '24px' }}>
             <div className="stat-card">
               <div className="stat-icon"><i className="ti ti-books" aria-hidden="true"></i></div>
               <div className="stat-value">{modules.length}</div>
               <div className="stat-label">Total Modul Simulasi</div>
             </div>
             <div className="stat-card">
               <div className="stat-icon"><i className="ti ti-circle-check" aria-hidden="true"></i></div>
               <div className="stat-value">{completedCount}</div>
               <div className="stat-label">Modul Selesai</div>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>Progres Keseluruhan</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{ marginBottom: '32px' }}>
            <div className="progress-fill success" style={{ width: `${pct}%` }}></div>
          </div>
          
          {subjectProgress.length > 0 && (
            <>
              <div className="section-card-title" style={{ marginTop: '32px' }}><i className="ti ti-tags"></i> Progres Per Mata Pelajaran</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {subjectProgress.map(sp => (
                  <div key={sp.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>{sp.name}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sp.completed} / {sp.total} Selesai</span>
                    </div>
                    <div className="progress-bar" style={{ height: '8px', marginBottom: '6px' }}>
                      <div className="progress-fill" style={{ width: `${sp.pct}%`, background: 'var(--primary)' }}></div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {sp.pct}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {completedModuleIds.size > 0 && (
            <>
              <div className="section-card-title" style={{ marginTop: '32px' }}><i className="ti ti-notebook"></i> Riwayat Refleksi Belajarku</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array.from(completedModuleIds).map(modId => {
                  const mod = modules.find(m => m.id === modId);
                  const reflectionText = reflections[modId];
                  return (
                    <div key={modId} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{mod ? mod.title : `Modul #${modId}`}</span>
                        <span className="badge badge-success" style={{ fontSize: '11px', padding: '4px 8px' }}><i className="ti ti-circle-check"></i> Selesai</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontStyle: reflectionText ? 'normal' : 'italic', lineHeight: 1.5 }}>
                        {reflectionText ? `"${reflectionText}"` : 'Belum menuliskan refleksi.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Edit Profil</h3>
              <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={() => setIsEditing(false)}>
                <i className="ti ti-x" style={{ fontSize: '20px' }}></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <div className="input-group">
                  <div className="input-icon"><i className="ti ti-user"></i></div>
                  <input type="text" className="input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <div className="input-icon"><i className="ti ti-mail"></i></div>
                  <input type="email" className="input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password Baru (Opsional)</label>
                <div className="input-group">
                  <div className="input-icon"><i className="ti ti-lock"></i></div>
                  <input type={showPassword ? "text" : "password"} className="input" placeholder="Kosongkan jika tidak diubah" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                  <div className="input-addon" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}></i>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Jika diisi, ini akan mereset password Anda.</div>
              </div>
              
              {editForm.password && (
                <div className="form-group">
                  <label className="form-label">Konfirmasi Password Baru</label>
                  <div className="input-group">
                    <div className="input-icon"><i className="ti ti-lock-check"></i></div>
                    <input type={showPassword ? "text" : "password"} className="input" placeholder="Ulangi password baru" value={editForm.confirmPassword} onChange={e => setEditForm({...editForm, confirmPassword: e.target.value})} />
                  </div>
                </div>
              )}
              
              {errorMsg && <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{errorMsg}</div>}
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => {
                setIsEditing(false);
                setErrorMsg('');
                setEditForm({ name: user.name, email: user.email, password: '', confirmPassword: '' });
              }}>Batal</button>
              <button className="btn btn-primary" onClick={async () => {
                 if (editForm.password && editForm.password !== editForm.confirmPassword) {
                   setErrorMsg('Password dan konfirmasi password tidak cocok.');
                   return;
                 }
                 setErrorMsg('');
                 try {

                   const res = await fetchAuth('/api/auth/profile', {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ id: user.id, name: editForm.name, email: editForm.email, role: user.role, password: editForm.password })
                   });
                   if (res.ok) {
                     const data = await res.json();
                     if (data.success) {
                       setUser({ ...user, name: editForm.name, email: editForm.email });
                       setIsEditing(false);
                       toast.success('Profil berhasil diperbarui.');
                     }
                   }
                 } catch (err) {
                   console.error("Gagal mengupdate profil", err);
                 }
              }}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
