import React, { useState } from 'react';

// --- LOGIN VIEW ---
export function LoginView({ onLogin, defaultMode = 'siswa' }: { onLogin: (e: string, p: string, remember: boolean) => void, defaultMode?: 'siswa' | 'guru' | 'admin' }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMsg, setShowForgotMsg] = useState(false);
  
  const submit = () => {
    if (!email || !pass) {
      setError('Username/Email dan password wajib diisi.');
      return;
    }

    if (email.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Format email tidak valid.');
        return;
      }
    }

    setError('');
    onLogin(email, pass, rememberMe);
  };
  
  const title = defaultMode === 'siswa' ? 'Siswa' : defaultMode === 'guru' ? 'Guru' : 'Admin';
  
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
            <img src="/logo_pens.png" className="logo-img" alt="PENS Logo" />
            <div className="login-logo-text">
              SimPend
              <span>Website Simulasi Pendidikan 2025/2026</span>
            </div>
          </div>
          <div className="login-title">Masuk ke Akun {title}</div>
          <div className="login-subtitle">Selamat datang! Silakan masuk untuk mengakses dashboard.</div>
          
          <div className="form-group">
            <label className="form-label">Username / Email {title}</label>
            <input className="form-input" type="text" placeholder={`Masukkan username atau email ${title.toLowerCase()}`} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                className="form-input" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Masukkan password" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && submit()} 
                style={{ paddingRight: '40px', width: '100%' }}
              />
              <button 
                type="button"
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer', 
                  padding: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
              >
                <i className={`ti ti-${showPassword ? 'eye-off' : 'eye'}`} style={{ fontSize: '18px' }}></i>
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer', margin: 0 }}
                />
                Ingat Saya
              </label>
              <button 
                type="button"
                style={{ 
                  fontSize: '13px', 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: 'var(--primary)', 
                  cursor: 'pointer', 
                  fontWeight: 500 
                }}
                onClick={() => setShowForgotMsg(!showForgotMsg)}
              >
                Lupa Password?
              </button>
            </div>
          </div>
          
          {showForgotMsg && (
            <div className="alert alert-info" style={{ marginBottom: '16px', padding: '12px', fontSize: '13px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <i className="ti ti-info-circle" style={{ fontSize: '16px', marginTop: '2px' }}></i> 
              <span>Silakan hubungi administrator sekolah atau guru wali kelas Anda untuk melakukan reset password.</span>
            </div>
          )}
          
          {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
          
          <button className="btn btn-primary btn-full btn-lg" onClick={submit}>
            Masuk <i className="ti ti-arrow-right"></i>
          </button>
      </div>
    </div>
  );
}
