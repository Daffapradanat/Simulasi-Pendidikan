import React from 'react';
import { Module } from '../../types';

import { useState } from 'react';
export default function AuditView({ modules }: { modules: Module[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(modules.length / itemsPerPage);
  const displayedModules = modules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              <th>Soal Evaluasi</th>
              <th>Status Audit</th>
            </tr>
          </thead>
          <tbody>
            {displayedModules.map((mod, index) => {
              const hasObjectives = mod.material?.objectives && mod.material.objectives.length > 0;
              const hasTheory = mod.material?.theory && mod.material.theory.trim() !== '' && mod.material.theory !== '<p><br></p>';
              const hasKeyTerms = mod.material?.keyTerms && mod.material.keyTerms.length > 0;
              const hasGames = mod.games && mod.games.length > 0;
              const hasQuestions = (mod.questionCount || 0) > 0;
              
              const isComplete = hasObjectives && hasTheory && hasKeyTerms && hasGames && hasQuestions;
              
              const CheckIcon = () => <i className="ti ti-check" style={{ color: 'var(--success)', fontSize: '18px', fontWeight: 800 }}></i>;
              const CrossIcon = () => <i className="ti ti-x" style={{ color: 'var(--danger)', fontSize: '18px', fontWeight: 800 }}></i>;

              return (
                <tr key={mod.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{mod.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mod.level}</div>
                  </td>
                  <td>{hasObjectives ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>{hasTheory ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>{hasKeyTerms ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>{hasGames ? <CheckIcon/> : <CrossIcon/>}</td>
                  <td>{hasQuestions ? <CheckIcon/> : <CrossIcon/>} ({mod.questionCount || 0})</td>
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
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <i className="ti ti-clipboard-list" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
                  Tidak ada data modul.
                </td>
              </tr>
            )}
          </tbody>
        
        </table>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, modules.length)} dari {modules.length} modul
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '4px 8px' }}>
                <i className="ti ti-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCurrentPage(i + 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  {i + 1}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '4px 8px' }}>
                <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
