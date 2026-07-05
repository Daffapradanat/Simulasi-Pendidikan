
import React from 'react';
import { Subject } from '../../types';


// Helper function to determine icon and color based on subject name
const getSubjectStyles = (name: string) => {
  const lowerName = name.toLowerCase();
  
  // Clean, professional styling
  const style = {
    color: '#334155', // slate-700
    bg: '#f8fafc'     // slate-50
  };

  if (lowerName.includes('matematika') || lowerName.includes('math')) {
    return { icon: 'ti-calculator', ...style };
  }
  if (lowerName.includes('fisika') || lowerName.includes('physics')) {
    return { icon: 'ti-atom', ...style };
  }
  if (lowerName.includes('kimia') || lowerName.includes('chemistry')) {
    return { icon: 'ti-flask', ...style };
  }
  if (lowerName.includes('biologi') || lowerName.includes('biology')) {
    return { icon: 'ti-microscope', ...style };
  }
  if (lowerName.includes('sejarah') || lowerName.includes('history')) {
    return { icon: 'ti-building-monument', ...style };
  }
  if (lowerName.includes('bahasa') || lowerName.includes('language')) {
    return { icon: 'ti-language', ...style };
  }
  if (lowerName.includes('geografi') || lowerName.includes('geography') || lowerName.includes('bumi')) {
    return { icon: 'ti-world', ...style };
  }
  if (lowerName.includes('seni') || lowerName.includes('art')) {
    return { icon: 'ti-palette', ...style };
  }
  if (lowerName.includes('komputer') || lowerName.includes('tik') || lowerName.includes('informatika')) {
    return { icon: 'ti-device-laptop', ...style };
  }
  if (lowerName.includes('agama') || lowerName.includes('religion')) {
    return { icon: 'ti-book-2', ...style };
  }
  if (lowerName.includes('ekonomi') || lowerName.includes('akuntansi')) {
    return { icon: 'ti-chart-bar', ...style };
  }
  
  // Default fallback
  return { icon: 'ti-book', ...style };
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
