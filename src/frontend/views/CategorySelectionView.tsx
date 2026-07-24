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
            { bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', icon: '#3b82f6', border: '#bfdbfe' },
            { bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', icon: '#10b981', border: '#a7f3d0' },
            { bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', icon: '#f59e0b', border: '#fde68a' },
            { bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', icon: '#8b5cf6', border: '#ddd6fe' },
            { bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', icon: '#ef4444', border: '#fecaca' }
          ];
          const color = colors[i % colors.length];

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
              <div className="selection-icon-wrap" style={{ background: color.bg, color: color.icon, boxShadow: `inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 12px ${color.icon}20` }}>
                <i className={`ti ${cat.icon || 'ti-school'}`}></i>
              </div>
              
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 className="selection-card-title">{cat.name}</h3>
                <div className="selection-card-link" style={{ color: color.icon }}>
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
