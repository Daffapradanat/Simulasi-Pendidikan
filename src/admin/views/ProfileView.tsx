import { toast } from '../../components/Toast';
import React, { useState } from 'react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { motion } from 'motion/react';
import { fetchAuth } from '../../lib/fetchAuth';

export default function ProfileView({
  user, isEditingProfile, setIsEditingProfile, profileForm, setProfileForm, onUpdateUser, onClearAll
}: any) {
  const [showCompleteAllConfirm, setShowCompleteAllConfirm] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  return (
    <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Profil Anda</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
        <div className="section-card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}></div>
          <div style={{ padding: '0 32px 32px', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', marginTop: '-50px', marginBottom: '20px' }}>
              <div style={{ 
                 width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 border: '5px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                color: 'white', overflow: 'hidden'
              }}>
                {(user as any).avatar ? (
                  <img src={(user as any).avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=100`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <label htmlFor="upload-my-avatar-admin" style={{ position: 'absolute', bottom: '0', right: '0', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                <i className="ti ti-camera" style={{ fontSize: '16px' }}></i>
              </label>
              <input type="file" id="upload-my-avatar-admin" style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
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
                       if (onUpdateUser) {
                         onUpdateUser({...user, avatar: data.url});
                       } else {
                         user.avatar = data.url;
                       }
                       toast.success('Foto profil berhasil diperbarui!');
                    }
                  }
                } catch (error: any) {
                  console.error("Failed to upload avatar", error);
                  toast.error(`Gagal upload avatar: ${error.message || 'Terjadi kesalahan'}`);
                }
              }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-dark)' }}>{user.name}</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 20px', fontSize: '15px' }}><i className="ti ti-mail" style={{ marginRight: '6px' }}></i>{user.email}</p>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--primary)', color: '#ffffff', fontSize: '13px', padding: '6px 12px', fontWeight: 600 }}>
                    <i className="ti ti-shield" style={{ color: '#ffffff', marginRight: '4px' }}></i> {user.role === 'admin' ? 'Administrator' : user.role === 'guru' ? 'Guru Pengajar' : 'Siswa'}
                  </span>
                  <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', fontSize: '13px', padding: '6px 12px' }}>
                    <i className="ti ti-check"></i> Akun Aktif
                  </span>
                </div>
              </div>
              
              {!isEditingProfile && (
                <button className="btn btn-primary" onClick={() => setIsEditingProfile(true)} style={{ borderRadius: '100px', padding: '10px 20px', fontSize: '13px', flexShrink: 0 }}>
                  <i className="ti ti-edit"></i> Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>

        {(user.role === 'admin' || user.role === 'guru') && !isEditingProfile && (
          <div className="section-card" style={{ flex: 1 }}>
             <div className="section-card-title"><i className="ti ti-tool"></i> Alat Administrator / Guru</div>
             <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Gunakan fungsi ini untuk mempercepat simulasi dan pengetesan akses konten. Fungsi ini akan langsung menyelesaikan semua modul & game untuk akun ini.</p>
             <button className="btn" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success-light)', width: '100%', justifyContent: 'center' }} onClick={() => setShowCompleteAllConfirm(true)}>
               <i className="ti ti-checks"></i> Selesaikan Semua Modul Sekaligus
             </button>
          </div>
        )}

        {isEditingProfile && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="section-card" style={{ flex: 1 }}>
            <div className="section-card-title"><i className="ti ti-settings"></i> Pengaturan Akun</div>
            <form onSubmit={async e => {
              e.preventDefault();
              if (isSavingProfile) return;
              setIsSavingProfile(true);
              try {
                const res = await fetchAuth('/api/auth/profile', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...user, ...profileForm })
                });
                const data = await res.json();
                if (res.ok) {
                  if (onUpdateUser) {
                    onUpdateUser(data.user);
                  } else {
                    user.name = data.user.name;
                    user.email = data.user.email;
                  }
                  setIsEditingProfile(false);
                  toast.success('Profil berhasil diperbarui!');
                } else {
                  toast.error(data.error || 'Failed to update profile');
                }
              } catch (e: any) {
                console.error(e);
                toast.error(`Error: ${e.message}`);
              } finally {
                setIsSavingProfile(false);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Nama Lengkap</label>
                <div style={{ position: 'relative' }}>
                  <i className="ti ti-user" style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                  <input type="text" className="form-input" style={{ paddingLeft: '40px' }} required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <i className="ti ti-mail" style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                  <input type="email" className="form-input" style={{ paddingLeft: '40px' }} required value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Peran (Role)</label>
                <div style={{ position: 'relative' }}>
                  <i className="ti ti-shield" style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                  <input type="text" className="form-input" style={{ paddingLeft: '40px', background: 'var(--surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)' }} disabled value={profileForm.role === 'admin' ? 'Administrator' : profileForm.role === 'guru' ? 'Guru' : 'Siswa'} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}><i className="ti ti-info-circle"></i> Peran ditetapkan oleh sistem dan tidak dapat diubah.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary btn-full" disabled={isSavingProfile}>{isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => {
                  setProfileForm({ name: user.name, email: user.email, role: user.role });
                  setIsEditingProfile(false);
                }}>Batal</button>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCompleteAllConfirm}
        title="Selesaikan Semua Modul?"
        message="Fungsi ini akan menandai semua materi dan evaluasi sebagai selesai untuk akun Anda. Apakah Anda yakin?"
        confirmText="Ya, Selesaikan"
        cancelText="Batal"
        onConfirm={async () => {
          try {
            if (onClearAll) {
              await onClearAll();
            }
            toast.success('Semua modul berhasil ditandai selesai!');
          } catch (err: any) {
            toast.error('Gagal menyelesaikan modul: ' + err.message);
          } finally {
            setShowCompleteAllConfirm(false);
          }
        }}
        onCancel={() => setShowCompleteAllConfirm(false)}
      />
    </div>
  );
}
