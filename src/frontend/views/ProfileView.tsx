
import React from 'react';
import { Module, User, Subject } from '../../types';

// --- PROFILE VIEW ---
export function ProfileView({ user, completedModuleIds, modules, subjects = [] }: { user: User, completedModuleIds: Set<number>, modules: Module[], subjects?: Subject[] }) {
  const completedCount = completedModuleIds.size;
  const pct = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;
  
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
        </div>
      </div>
    </div>
  );
}
