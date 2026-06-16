import React from 'react';
import { Module } from '../../types';

export default function AuditView({ modules }: { modules: Module[] }) {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>Audit Konten Modul</h1>
        <p style={{ color: 'var(--text-muted)' }}>Pantau kelengkapan struktur materi dari setiap modul untuk memastikan sinkronisasi data yang sempurna.</p>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modul</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tujuan Pembelajaran</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Penjelasan Materi</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Istilah Kunci</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Games Simulasi</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Audit</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(mod => {
              const hasObjectives = mod.material?.objectives && mod.material.objectives.length > 0;
              const hasTheory = mod.material?.theory && mod.material.theory.trim() !== '' && mod.material.theory !== '<p><br></p>';
              const hasKeyTerms = mod.material?.keyTerms && mod.material.keyTerms.length > 0;
              const hasGames = mod.games && mod.games.length > 0;
              const isComplete = hasObjectives && hasTheory && hasKeyTerms && hasGames;

              const CheckIcon = () => <i className="ti ti-check" style={{ color: 'var(--success)', fontSize: '18px', fontWeight: 800 }}></i>;
              const CrossIcon = () => <i className="ti ti-x" style={{ color: 'var(--danger)', fontSize: '18px', fontWeight: 800 }}></i>;

              return (
                <tr key={mod.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{mod.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mod.level}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>{hasObjectives ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>{hasTheory ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>{hasKeyTerms ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>{hasGames ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {isComplete ? (
                      <span className="badge badge-success">Lengkap</span>
                    ) : (
                      <span className="badge badge-warning" style={{ background: '#FFF3E0', color: '#E65100' }}>Perlu Dilengkapi</span>
                    )}
                  </td>
                </tr>
              )
            })}
            
            {modules.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada data modul.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
