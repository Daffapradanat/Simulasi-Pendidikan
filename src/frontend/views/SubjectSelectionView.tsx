import React from 'react';
import { Subject } from '../../types';
import { motion } from 'motion/react';

const getSubjectStyles = (subject: Subject) => {
  const name = subject.name;
  const lowerName = name.toLowerCase();
  const presets = [
    { icon: 'ti-calculator', color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '#bfdbfe' },
    { icon: 'ti-atom', color: '#8b5cf6', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '#ddd6fe' },
    { icon: 'ti-flask', color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '#a7f3d0' },
    { icon: 'ti-microscope', color: '#84cc16', bg: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)', border: '#d9f99d' },
    { icon: 'ti-building-monument', color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '#fde68a' },
    { icon: 'ti-language', color: '#ec4899', bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '#fbcfe8' },
    { icon: 'ti-world', color: '#06b6d4', bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', border: '#a5f3fc' },
    { icon: 'ti-palette', color: '#f43f5e', bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', border: '#fecdd3' },
    { icon: 'ti-device-laptop', color: '#6366f1', bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', border: '#c7d2fe' },
    { icon: 'ti-book-2', color: '#14b8a6', bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', border: '#99f6e4' },
    { icon: 'ti-chart-bar', color: '#eab308', bg: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)', border: '#fde047' },
    { icon: 'ti-leaf', color: '#22c55e', bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '#bbf7d0' },
    { icon: 'ti-music', color: '#d946ef', bg: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', border: '#f5d0fe' },
    { icon: 'ti-brain', color: '#f97316', bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '#fed7aa' },
    { icon: 'ti-ball-basketball', color: '#ea580c', bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '#fed7aa' }
  ];

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

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % presets.length;
  return presets[index];
};

export function SubjectSelectionView({ subjects, onSelectSubject, onBack }: { subjects: Subject[], onSelectSubject: (id: number) => void, onBack?: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', paddingBottom: '60px' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', marginBottom: '48px', position: 'relative', justifyContent: 'center' }}
      >
        {onBack && (
          <button className="btn btn-ghost" onClick={onBack} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>
            <i className="ti ti-arrow-left"></i> Kembali
          </button>
        )}
        <div style={{ textAlign: 'center' }}>
          <h2 className="page-title" style={{ marginBottom: '12px', textAlign: 'center', fontSize: '32px' }}>Pilih Mata Pelajaran</h2>
          <p className="page-desc" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', fontSize: '16px', color: 'var(--text-muted)' }}>
            Eksplorasi modul simulasi yang tersedia berdasarkan mata pelajaran.
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}
      >
        {subjects.map(subject => {
          const style = getSubjectStyles(subject);
          const icon = subject.icon || style.icon;
          return (
            <motion.div 
              variants={itemVariants}
              key={subject.id} 
              style={{
                cursor: 'pointer',
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                border: `1px solid #e2e8f0`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => onSelectSubject(subject.id)}
              whileHover={{ 
                y: -6, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                borderColor: style.border
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '20px',
                background: style.bg, color: style.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', flexShrink: 0,
                boxShadow: `inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 12px ${style.color}20`
              }}>
                <i className={`ti ${icon}`}></i>
              </div>
              
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{subject.name}</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px', color: style.color, fontWeight: 600 }}>
                  Buka Modul <i className="ti ti-arrow-right" style={{ marginLeft: '6px', fontSize: '16px' }}></i>
                </div>
              </div>
            </motion.div>
          );
        })}
        {subjects.length === 0 && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', background: 'white', borderRadius: '24px', border: '1px dashed var(--border)' }}
           >
             <div style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}><i className="ti ti-books"></i></div>
             <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Belum Ada Mata Pelajaran</h3>
             <p style={{ color: 'var(--text-light)' }}>Mata pelajaran belum tersedia saat ini.</p>
           </motion.div>
        )}
      </motion.div>
    </div>
  );
}
