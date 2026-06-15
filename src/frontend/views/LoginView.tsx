import React, { useState } from 'react';

// --- LOGIN VIEW ---
export function LoginView({ onLogin, defaultMode = 'siswa' }: { onLogin: (e: string, p: string, remember: boolean) => void, defaultMode?: 'siswa' | 'guru' | 'admin' }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
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
  
  const handleSendOtp = () => {
    if (!forgotEmail) {
      setError('Email wajib diisi.');
      return;
    }
    setError('');
    // Mock OTP sending
    setForgotStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp !== '1234') {
      setError('OTP tidak valid (gunakan 1234 untuk demo).');
      return;
    }
    setError('');
    setForgotStep('reset');
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 5) {
      setError('Password baru minimal 5 karakter.');
      return;
    }
    setError('');
    setResetSuccess('Password berhasil direset! Silakan masuk dengan password baru.');
    setTimeout(() => {
      setIsForgotMode(false);
      setForgotStep('email');
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setResetSuccess('');
    }, 3000);
  };

  const title = defaultMode === 'siswa' ? 'Siswa' : defaultMode === 'guru' ? 'Guru' : 'Admin';
  
  if (isForgotMode) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo" style={{ justifyContent: 'center' }}>
            <img src="/Pusmendik.jpg" className="logo-img" alt="Pusmendik Logo" />
          </div>
          
          {resetSuccess ? (
            <div className="alert alert-success" style={{ padding: '12px', fontSize: '14px', borderRadius: '8px', textAlign: 'center' }}>
              <i className="ti ti-check" style={{ fontSize: '24px', display: 'block', margin: '0 auto 8px' }}></i>
              {resetSuccess}
            </div>
          ) : (
            <>
              {forgotStep === 'email' && (
                <>
                  <div className="login-title">Lupa Password?</div>
                  <div className="login-subtitle">Masukkan email Anda untuk menerima kode OTP.</div>
                  <div className="form-group">
                    <label className="form-label">Email Anda</label>
                    <input className="form-input" type="email" placeholder="contoh@sekolah.sch.id" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                  </div>
                  {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleSendOtp}>Kirim Kode OTP</button>
                </>
              )}

              {forgotStep === 'otp' && (
                <>
                  <div className="login-title">Verifikasi OTP</div>
                  <div className="login-subtitle">Kode OTP telah dikirim ke {forgotEmail}.<br/>(Petunjuk: Masukkan 1234)</div>
                  <div className="form-group">
                    <label className="form-label">Kode OTP</label>
                    <input className="form-input" type="text" placeholder="Masukkan 4 digit kode" value={otp} onChange={e => setOtp(e.target.value)} maxLength={4} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px' }} />
                  </div>
                  {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleVerifyOtp}>Verifikasi</button>
                </>
              )}

              {forgotStep === 'reset' && (
                <>
                  <div className="login-title">Buat Password Baru</div>
                  <div className="login-subtitle">Masukkan password baru Anda di bawah ini</div>
                  <div className="form-group">
                    <label className="form-label">Password Baru</label>
                    <input className="form-input" type="password" placeholder="Password baru" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleResetPassword}>Simpan Password</button>
                </>
              )}
            </>
          )}

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
            <img src="/Pusmendik.jpg" className="logo-img" alt="Pusmendik Logo" />
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
                  onClick={() => setError('Siswa tidak dapat mereset password. Silakan hubungi guru Anda.')}
                >
                  Lupa Password?
                </button>
              )}
            </div>
          </div>
          
          {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
          
          <button className="btn btn-primary btn-full btn-lg" onClick={submit}>
            Masuk <i className="ti ti-arrow-right"></i>
          </button>
      </div>
    </div>
  );
}
