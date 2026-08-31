import React, { useState } from 'react';

// --- LOGIN VIEW ---
interface LoginViewProps {
  onLogin?: (email: string, pass: string, remember: boolean) => void;
  onGuestLogin?: (name: string) => void;
  defaultMode?: 'siswa-guest' | 'siswa-full' | 'guru' | 'admin';
}

export function LoginView({ onLogin, onGuestLogin, defaultMode = 'siswa-guest' }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const submit = () => {
    if (defaultMode === 'siswa-guest') {
      const cleanName = guestName.trim();
      if (!cleanName) {
        setError('Silakan masukkan nama lengkap Anda.');
        return;
      }
      if (onGuestLogin) onGuestLogin(cleanName);
    } else {
      const cleanEmail = email.trim();
      const cleanPass = pass.trim();
      if (!cleanEmail || !cleanPass) {
        setError('Username/Email dan password wajib diisi.');
        return;
      }
      if (onLogin) onLogin(cleanEmail, cleanPass, rememberMe);
    }
  };

  const handleForgotSubmit = () => {
    // Fake forgot password flow for UI purposes
    if (forgotStep === 'email') {
      if (!forgotEmail || !forgotEmail.includes('@')) {
        setError('Masukkan email yang valid.');
        return;
      }
      setError('');
      setForgotStep('otp');
    } else if (forgotStep === 'otp') {
      if (otp.length < 4) {
        setError('Masukkan kode OTP yang valid.');
        return;
      }
      setError('');
      setForgotStep('reset');
    } else if (forgotStep === 'reset') {
      if (newPassword.length < 6) {
        setError('Password baru minimal 6 karakter.');
        return;
      }
      setError('');
      setResetSuccess('Password berhasil direset. Silakan login dengan password baru.');
      setTimeout(() => {
        setIsForgotMode(false);
        setForgotStep('email');
        setResetSuccess('');
      }, 3000);
    }
  };

  let title = 'Siswa';
  if (defaultMode === 'admin') title = 'Admin';
  if (defaultMode === 'guru') title = 'Guru';

  if (isForgotMode && defaultMode !== 'siswa-guest' && defaultMode !== 'siswa-full') {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo" style={{ justifyContent: 'center' }}>
            <img src="/digital/simulasisains/Pusmendik.jpg" className="logo-img" alt="Pusmendik Logo" />
          </div>
          
          <div className="login-title">Lupa Password</div>
          <div className="login-subtitle">
            {forgotStep === 'email' && 'Masukkan email Anda untuk menerima instruksi reset password.'}
            {forgotStep === 'otp' && 'Masukkan kode OTP yang telah dikirim ke email Anda.'}
            {forgotStep === 'reset' && 'Buat password baru untuk akun Anda.'}
          </div>

          {resetSuccess && (
            <div className="form-error" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', marginBottom: '16px' }}>
              <i className="ti ti-check" style={{ marginRight: '8px' }}></i> {resetSuccess}
            </div>
          )}

          {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}

          {forgotStep === 'email' && (
            <div className="form-group">
              <label className="form-label">Email Terdaftar</label>
              <input className="form-input" type="email" placeholder="nama@sekolah.sch.id" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()} />
            </div>
          )}

          {forgotStep === 'otp' && (
            <div className="form-group">
              <label className="form-label">Kode OTP</label>
              <input className="form-input" type="text" placeholder="Masukkan 6 digit kode" value={otp} onChange={e => setOtp(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()} maxLength={6} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }} />
            </div>
          )}

          {forgotStep === 'reset' && (
            <div className="form-group">
              <label className="form-label">Password Baru</label>
              <input className="form-input" type="password" placeholder="Minimal 6 karakter" value={newPassword} onChange={e => setNewPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()} />
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" onClick={handleForgotSubmit} disabled={!!resetSuccess}>
            {forgotStep === 'email' && 'Kirim Kode OTP'}
            {forgotStep === 'otp' && 'Verifikasi OTP'}
            {forgotStep === 'reset' && 'Simpan Password Baru'}
          </button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '13px', color: 'var(--text-muted)' }}
              onClick={() => {
                setIsForgotMode(false);
                setForgotStep('email');
                setError('');
              }}
            >
              <i className="ti ti-arrow-left"></i> Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" style={{ justifyContent: 'center' }}>
            <img src="/digital/simulasisains/Pusmendik.jpg" className="logo-img" alt="Pusmendik Logo" />
        </div>
        
        {defaultMode === 'siswa-guest' ? (
          <>
            <div className="login-title">Mulai Simulasi Sains</div>
            <div className="login-subtitle">Silakan masukkan nama lengkap untuk mulai belajar.</div>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input className="form-input" type="text" placeholder="Masukkan nama lengkap..." value={guestName} onChange={e => setGuestName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </>
        ) : (
          <>
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{
                    width: '22px', 
                    height: '22px', 
                    borderRadius: '6px', 
                    border: rememberMe ? '2px solid var(--primary)' : '2px solid var(--border)', 
                    background: rememberMe ? 'var(--primary)' : 'white',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: rememberMe ? '0 2px 8px rgba(13, 71, 161, 0.2)' : 'none'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={e => setRememberMe(e.target.checked)} 
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, margin: 0 }}
                    />
                    {rememberMe && <i className="ti ti-check" style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}></i>}
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>Ingat Saya</span>
                </label>
                {(defaultMode === 'admin' || defaultMode === 'guru') ? (
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
                    onClick={() => { setIsForgotMode(true); setError(''); }}
                  >
                    Lupa Password?
                  </button>
                ) : (
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
                    onClick={() => setError('Silakan hubungi guru Anda jika mengalami masalah login.')}
                  >
                    Lupa Password?
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        
        {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
        
        <button className="btn btn-primary btn-full btn-lg" onClick={submit}>
          {defaultMode === 'siswa-guest' ? 'Mulai Belajar' : 'Masuk'} <i className="ti ti-arrow-right"></i>
        </button>
        {defaultMode !== 'siswa-guest' && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '13px', color: 'var(--text-muted)' }}
              onClick={() => window.location.href = '/'}
            >
              <i className="ti ti-arrow-left"></i> Halaman Siswa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
