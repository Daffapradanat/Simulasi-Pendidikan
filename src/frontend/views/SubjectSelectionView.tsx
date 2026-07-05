import React from 'react';
import { Subject } from '../../types';

export function SubjectSelectionView({ subjects, onSelectSubject }: { subjects: Subject[], onSelectSubject: (id: number) => void }) {
  return (
    <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '8px' }}>Pilih Mata Pelajaran</h2>
          <p className="page-desc">Silakan pilih mata pelajaran untuk melihat modul yang tersedia.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {subjects.map(subject => (
          <div key={subject.id} className="section-card module-card" style={{ cursor: 'pointer', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => onSelectSubject(subject.id)}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' }}>
              <i className="ti ti-book"></i>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>{subject.name}</h3>
          </div>
        ))}
        {subjects.length === 0 && (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-light)' }}>
             Belum ada mata pelajaran yang tersedia.
           </div>
        )}
      </div>
    </div>
  );
}
