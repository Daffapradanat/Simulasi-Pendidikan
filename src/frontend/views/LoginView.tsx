import React, { useState } from 'react';

// --- LOGIN VIEW ---
export function LoginView({ onLogin }: { onLogin: (e: string, p: string) => void }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  
  const submit = () => {
    if (!email || !pass) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setError('');
    onLogin(email, pass);
  };
  
  return (
    <div className="page active">
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <img src="https://upload.wikimedia.org/wikipedia/id/4/44/Logo_PENS.png" className="logo-img" alt="PENS Logo" />
            <div className="login-logo-text">
              SimPend
              <span>Website Simulasi Pendidikan 2025/2026</span>
            </div>
          </div>
          <div className="login-title">Masuk ke Akun</div>
          <div className="login-subtitle">Selamat datang! Silakan masuk untuk mengakses modul simulasi.</div>
          
          <div className="form-group">
            <label className="form-label">Email / NIS</label>
            <input className="form-input" type="email" placeholder="contoh@sekolah.sch.id" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Masukkan password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          
          {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}
          
          <button className="btn btn-primary btn-full btn-lg" onClick={submit}>
            Masuk <i className="ti ti-arrow-right"></i>
          </button>
          
          <div className="login-divider">atau</div>
          <div className="alert alert-info" style={{ marginBottom: 0 }}>
            <i className="ti ti-info-circle" aria-hidden="true"></i> Untuk demo: isi email & password apapun lalu klik Masuk.
          </div>
        </div>
      </div>
    </div>
  );
}
