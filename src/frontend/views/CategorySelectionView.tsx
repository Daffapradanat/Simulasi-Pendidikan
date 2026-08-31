import React from 'react';
import { motion } from 'motion/react';

export function CategorySelectionView({ categories, onSelectCategory }: { categories: any[], onSelectCategory: (id: number) => void }) {
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
        style={{ marginBottom: '40px' }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 className="page-title" style={{ marginBottom: '12px', textAlign: 'center', fontSize: '32px' }}>Pilih Fase Pembelajaran</h2>
          <p className="page-desc" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', fontSize: '16px', color: 'var(--text-muted)' }}>
            Silahkan pilih fase atau kategori pembelajaran yang sesuai dengan tingkat pendidikan Anda.
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="selection-grid"
      >
        {categories.map((cat, i) => {
          const colors = [
            { bg: '#0d47a1', themeColor: '#0d47a1', border: '#bfdbfe' },
            { bg: '#047857', themeColor: '#047857', border: '#a7f3d0' },
            { bg: '#b45309', themeColor: '#b45309', border: '#fde68a' },
            { bg: '#6d28d9', themeColor: '#6d28d9', border: '#ddd6fe' },
            { bg: '#b91c1c', themeColor: '#b91c1c', border: '#fecaca' }
          ];
          const color = colors[i % colors.length];

          const rawIcon = cat.icon || 'ti-school';
          const iconClass = rawIcon.startsWith('ti ti-') ? rawIcon : rawIcon.startsWith('ti-') ? `ti ${rawIcon}` : `ti ti-${rawIcon}`;

          return (
            <motion.div 
              variants={itemVariants}
              key={cat.id} 
              className="selection-card"
              onClick={() => onSelectCategory(cat.id)}
              whileHover={{ 
                y: -6, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                borderColor: color.border
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="selection-icon-wrap" style={{ background: color.bg, color: '#ffffff', boxShadow: `0 8px 20px ${color.themeColor}30` }}>
                <i className={iconClass} style={{ color: '#ffffff' }}></i>
              </div>
              
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 className="selection-card-title">{cat.name}</h3>
                <div className="selection-card-link" style={{ color: color.themeColor }}>
                  Mulai Belajar <i className="ti ti-arrow-right" style={{ marginLeft: '6px', fontSize: '16px' }}></i>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
