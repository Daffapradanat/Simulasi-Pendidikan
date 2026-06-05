import React from 'react';

export default function ProfileView({
  user, isEditingProfile, setIsEditingProfile, profileForm, setProfileForm, onUpdateUser
}: any) {
  return (
          <div className="admin-content">
            <h2 className="page-title">Profil</h2>
            <div className="section-card" style={{ maxWidth: '500px' }}>
              {!isEditingProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px', gap: '16px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800' }}>{user.name}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{user.email}</p>
                    <span className="badge badge-primary" style={{ marginBottom: '16px' }}><i className="ti ti-star"></i> Peran: {user.role === 'admin' ? 'Administrator' : user.role === 'guru' ? 'Guru' : 'Siswa'}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingProfile(true)}>
                    <i className="ti ti-edit"></i> Edit Profil
                  </button>
                </div>
              ) : (
                <form onSubmit={e => {
                  e.preventDefault();
                  if (onUpdateUser) {
                    onUpdateUser({ ...user, ...profileForm });
                  } else {
                    user.name = profileForm.name;
                    user.email = profileForm.email;
                  }
                  setIsEditingProfile(false);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Edit Profil</h3>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Lengkap</label>
                    <input type="text" className="form-input" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" required value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Peran (Role)</label>
                    <input type="text" className="form-input" disabled value={profileForm.role === 'admin' ? 'Administrator' : profileForm.role === 'guru' ? 'Guru' : 'Siswa'} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Peran tidak dapat diubah</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button type="submit" className="btn btn-primary btn-full">Simpan</button>
                    <button type="button" className="btn btn-ghost btn-full" onClick={() => {
                      setProfileForm({ name: user.name, email: user.email, role: user.role });
                      setIsEditingProfile(false);
                    }}>Batal</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
}
