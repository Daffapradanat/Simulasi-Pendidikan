
import React from 'react';
import { Subject } from '../../types';


// Helper function to dynamically determine icon and color based on subject name
const getSubjectStyles = (name: string) => {
  const lowerName = name.toLowerCase();
  
  // Clean, professional styling presets
  const presets = [
    { icon: 'ti-calculator', color: '#3b82f6', bg: '#eff6ff' }, // blue
    { icon: 'ti-atom', color: '#8b5cf6', bg: '#f5f3ff' }, // purple
    { icon: 'ti-flask', color: '#10b981', bg: '#ecfdf5' }, // green
    { icon: 'ti-microscope', color: '#84cc16', bg: '#f7fee7' }, // lime
    { icon: 'ti-building-monument', color: '#f59e0b', bg: '#fffbeb' }, // amber
    { icon: 'ti-language', color: '#ec4899', bg: '#fdf2f8' }, // pink
    { icon: 'ti-world', color: '#06b6d4', bg: '#ecfeff' }, // cyan
    { icon: 'ti-palette', color: '#f43f5e', bg: '#fff1f2' }, // rose
    { icon: 'ti-device-laptop', color: '#6366f1', bg: '#eef2ff' }, // indigo
    { icon: 'ti-book-2', color: '#14b8a6', bg: '#f0fdfa' }, // teal
    { icon: 'ti-chart-bar', color: '#eab308', bg: '#fefce8' }, // yellow
    { icon: 'ti-leaf', color: '#22c55e', bg: '#f0fdf4' }, // green variant
    { icon: 'ti-music', color: '#d946ef', bg: '#fdf4ff' }, // fuchsia
    { icon: 'ti-brain', color: '#f97316', bg: '#fff7ed' }, // orange
    { icon: 'ti-ball-basketball', color: '#ea580c', bg: '#fff7ed' } // dark orange
  ];

  // Specific overrides for known subjects
  if (lowerName.includes('matematika') || lowerName.includes('math')) return presets[0];
  if (lowerName.includes('fisika') || lowerName.includes('physics')) return presets[1];
  if (lowerName.includes('kimia') || lowerName.includes('chemistry')) return presets[2];
  if (lowerName.includes('biologi') || lowerName.includes('biology') || lowerName.includes('ipa')) return presets[3];
  if (lowerName.includes('sejarah') || lowerName.includes('history')) return presets[4];
  if (lowerName.includes('bahasa') || lowerName.includes('language')) return presets[5];
  if (lowerName.includes('geografi') || lowerName.includes('geography') || lowerName.includes('bumi')) return presets[6];
  if (lowerName.includes('seni') || lowerName.includes('art')) return presets[7];
  if (lowerName.includes('komputer') || lowerName.includes('tik') || lowerName.includes('informatika')) return presets[8];
  if (lowerName.includes('agama') || lowerName.includes('religion')) return presets[9];
  if (lowerName.includes('ekonomi') || lowerName.includes('akuntansi') || lowerName.includes('ips')) return presets[10];
  
  // Consistent hash for unknown subjects
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % presets.length;
  return presets[index];
};


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
        {subjects.map(subject => {
          const style = getSubjectStyles(subject.name);
          return (
            
            <div 
              key={subject.id} 
              className="section-card module-card" 
              style={{ 
                cursor: 'pointer', 
                padding: '32px 24px', 
                textAlign: 'center', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                borderTop: `4px solid ${style.color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }} 
              onClick={() => onSelectSubject(subject.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '20px', 
                background: style.bg, 
                color: style.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '32px', 
                marginBottom: '20px',
                transition: 'transform 0.3s ease'
              }}>
                <i className={`ti ${style.icon}`}></i>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{subject.name}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, padding: '4px 12px', background: '#f1f5f9', borderRadius: '12px' }}>
                Buka Modul <i className="ti ti-arrow-right" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
              </div>
            </div>

          );
        })}
        {subjects.length === 0 && (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
             <div style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }}><i className="ti ti-books"></i></div>
             <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Belum Ada Mata Pelajaran</h3>
             <p style={{ color: 'var(--text-light)' }}>Mata pelajaran belum tersedia saat ini.</p>
           </div>
        )}
      </div>
    </div>
  );
}
