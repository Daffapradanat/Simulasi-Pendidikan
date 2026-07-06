import React from 'react';
import { Module } from '../../types';

export default function AuditView({ modules }: { modules: Module[] }) {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>Audit Konten Modul</h1>
        <p style={{ color: 'var(--text-muted)' }}>Pantau kelengkapan struktur materi dari setiap modul untuk memastikan sinkronisasi data yang sempurna.</p>
      </div>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>No.</th>
              <th>Modul</th>
              <th>Tujuan Pembelajaran</th>
              <th>Penjelasan Materi</th>
              <th>Istilah Kunci</th>
              <th>Games Simulasi</th>
              <th>Status Audit</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod, index) => {
              const hasObjectives = mod.material?.objectives && mod.material.objectives.length > 0;
              const hasTheory = mod.material?.theory && mod.material.theory.trim() !== '' && mod.material.theory !== '<p><br></p>';
              const hasKeyTerms = mod.material?.keyTerms && mod.material.keyTerms.length > 0;
              const hasGames = mod.games && mod.games.length > 0;
              
              const isComplete = hasObjectives && hasTheory && hasKeyTerms && hasGames;
              
              const CheckIcon = () => <i className="ti ti-check" style={{ color: 'var(--success)', fontSize: '18px', fontWeight: 800 }}></i>;
              const CrossIcon = () => <i className="ti ti-x" style={{ color: 'var(--danger)', fontSize: '18px', fontWeight: 800 }}></i>;

              return (
                <tr key={mod.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{mod.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mod.level}</div>
                  </td>
                  <td>{hasObjectives ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>{hasTheory ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>{hasKeyTerms ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>{hasGames ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <i className="ti ti-clipboard-list" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
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
