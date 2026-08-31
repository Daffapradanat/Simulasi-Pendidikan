import React from 'react';
import { Subject } from '../../types';
import { motion } from 'motion/react';

const getSubjectStyles = (subject: Subject) => {
  const name = subject.name;
  const lowerName = name.toLowerCase();
  const presets = [
    { icon: 'ti-calculator', color: '#0d47a1', bg: '#0d47a1', border: '#bfdbfe' },
    { icon: 'ti-atom', color: '#6d28d9', bg: '#6d28d9', border: '#ddd6fe' },
    { icon: 'ti-flask', color: '#047857', bg: '#047857', border: '#a7f3d0' },
    { icon: 'ti-microscope', color: '#4d7c0f', bg: '#4d7c0f', border: '#d9f99d' },
    { icon: 'ti-building-monument', color: '#b45309', bg: '#b45309', border: '#fde68a' },
    { icon: 'ti-language', color: '#be185d', bg: '#be185d', border: '#fbcfe8' },
    { icon: 'ti-world', color: '#0e7490', bg: '#0e7490', border: '#a5f3fc' },
    { icon: 'ti-palette', color: '#be123c', bg: '#be123c', border: '#fecdd3' },
    { icon: 'ti-device-laptop', color: '#4338ca', bg: '#4338ca', border: '#c7d2fe' },
    { icon: 'ti-book-2', color: '#0f766e', bg: '#0f766e', border: '#99f6e4' },
    { icon: 'ti-chart-bar', color: '#a16207', bg: '#a16207', border: '#fde047' },
    { icon: 'ti-leaf', color: '#15803d', bg: '#15803d', border: '#bbf7d0' },
    { icon: 'ti-music', color: '#a21caf', bg: '#a21caf', border: '#f5d0fe' },
    { icon: 'ti-brain', color: '#c2410c', bg: '#c2410c', border: '#fed7aa' },
    { icon: 'ti-ball-basketball', color: '#9a3412', bg: '#9a3412', border: '#fed7aa' }
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
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };


  return (
    <div className="main-wrapper">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', marginBottom: '40px' }}
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
        className="selection-grid"
      >
        {subjects.map(subject => {
          const style = getSubjectStyles(subject);
          const rawIcon = subject.icon || style.icon || 'ti-book';
          const iconClass = rawIcon.startsWith('ti ti-') ? rawIcon : rawIcon.startsWith('ti-') ? `ti ${rawIcon}` : `ti ti-${rawIcon}`;
          return (
            <motion.div 
              variants={itemVariants}
              key={subject.id} 
              className="selection-card"
              onClick={() => onSelectSubject(subject.id)}
              whileHover={{ 
                y: -6, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                borderColor: style.border
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="selection-icon-wrap" style={{ background: style.bg, color: '#ffffff', boxShadow: `0 8px 20px ${style.color}30` }}>
                <i className={iconClass} style={{ color: '#ffffff' }}></i>
              </div>
              
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 className="selection-card-title">{subject.name}</h3>
                <div className="selection-card-link" style={{ color: style.color }}>
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
