import React from 'react';
import { Module, User } from '../../types';

// --- PROFILE VIEW ---
export function ProfileView({ user, completedModuleIds, modules }: { user: User, completedModuleIds: Set<number>, modules: Module[] }) {
  const completedCount = completedModuleIds.size;
  const pct = Math.round((completedCount / modules.length) * 100);

  return (
    <div className="page active">
      <div className="main-wrapper" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <div className="page-title">Profil Pengguna</div>
          <div className="page-subtitle">Informasi akun dan progres belajarmu</div>
        </div>

        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
            <i className="ti ti-user" style={{ fontSize: '40px' }}></i>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text)' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            <span className="badge badge-primary" style={{ marginTop: '8px' }}><i className="ti ti-star"></i> Peran: {user.role}</span>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-title"><i className="ti ti-chart-bar"></i> Statistik Belajar</div>
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
          <div className="progress-bar">
            <div className="progress-fill success" style={{ width: `${pct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
