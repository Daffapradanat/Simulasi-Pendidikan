
import React from 'react';
import { Subject } from '../../types';


// Helper function to determine icon and color based on subject name
const getSubjectStyles = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('matematika') || lowerName.includes('math')) {
    return { icon: 'ti-math-symbols', color: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', shadow: 'rgba(37, 99, 235, 0.15)' };
  }
  if (lowerName.includes('fisika') || lowerName.includes('physics')) {
    return { icon: 'ti-atom', color: '#7c3aed', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', shadow: 'rgba(124, 58, 237, 0.15)' };
  }
  if (lowerName.includes('kimia') || lowerName.includes('chemistry')) {
    return { icon: 'ti-flask', color: '#059669', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', shadow: 'rgba(5, 150, 105, 0.15)' };
  }
  if (lowerName.includes('biologi') || lowerName.includes('biology')) {
    return { icon: 'ti-dna', color: '#65a30d', bg: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)', shadow: 'rgba(101, 163, 13, 0.15)' };
  }
  if (lowerName.includes('sejarah') || lowerName.includes('history')) {
    return { icon: 'ti-building-monument', color: '#d97706', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', shadow: 'rgba(217, 119, 6, 0.15)' };
  }
  if (lowerName.includes('bahasa') || lowerName.includes('language')) {
    return { icon: 'ti-language', color: '#db2777', bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', shadow: 'rgba(219, 39, 119, 0.15)' };
  }
  if (lowerName.includes('geografi') || lowerName.includes('geography') || lowerName.includes('bumi')) {
    return { icon: 'ti-world', color: '#0891b2', bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', shadow: 'rgba(8, 145, 178, 0.15)' };
  }
  if (lowerName.includes('seni') || lowerName.includes('art')) {
    return { icon: 'ti-palette', color: '#e11d48', bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', shadow: 'rgba(225, 29, 72, 0.15)' };
  }
  if (lowerName.includes('komputer') || lowerName.includes('tik') || lowerName.includes('informatika')) {
    return { icon: 'ti-device-laptop', color: '#4f46e5', bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', shadow: 'rgba(79, 70, 229, 0.15)' };
  }
  if (lowerName.includes('agama') || lowerName.includes('religion')) {
    return { icon: 'ti-moon-stars', color: '#0d9488', bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', shadow: 'rgba(13, 148, 136, 0.15)' };
  }
  if (lowerName.includes('ekonomi') || lowerName.includes('akuntansi')) {
    return { icon: 'ti-chart-bar', color: '#ca8a04', bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', shadow: 'rgba(202, 138, 4, 0.15)' };
  }
  
  // Default fallback
  return { icon: 'ti-book', color: 'var(--primary)', bg: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(13,71,161,0.1) 100%)', shadow: 'rgba(13, 71, 161, 0.15)' };
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
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                borderTop: `4px solid ${style.color}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
              }} 
              onClick={() => onSelectSubject(subject.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 16px 32px ${style.shadow}`;
                const iconDiv = e.currentTarget.querySelector('.subject-icon-wrapper') as HTMLDivElement;
                if (iconDiv) iconDiv.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
                const iconDiv = e.currentTarget.querySelector('.subject-icon-wrapper') as HTMLDivElement;
                if (iconDiv) iconDiv.style.transform = 'scale(1)';
              }}
            >
              <div 
                className="subject-icon-wrapper"
                style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '24px', 
                background: style.bg, 
                color: style.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '36px', 
                marginBottom: '24px',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: `inset 0 2px 4px rgba(255,255,255,0.5), 0 8px 16px ${style.shadow}`
              }}>
                <i className={`ti ${style.icon}`}></i>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.02em' }}>{subject.name}</h3>
              <div style={{ 
                fontSize: '13px', 
                color: style.color, 
                fontWeight: 600, 
                padding: '6px 16px', 
                background: style.bg, 
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: 0.9
              }}>
                Eksplorasi Modul <i className="ti ti-arrow-right" style={{ fontSize: '14px' }}></i>
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
