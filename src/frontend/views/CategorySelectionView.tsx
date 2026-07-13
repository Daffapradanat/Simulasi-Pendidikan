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
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', paddingBottom: '60px' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '48px' }}
      >
        <div>
          <h2 className="page-title" style={{ marginBottom: '12px', textAlign: 'center', fontSize: '32px' }}>Pilih Jenjang Pendidikan</h2>
          <p className="page-desc" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', fontSize: '16px', color: 'var(--text-muted)' }}>
            Langkah pertama menuju simulasi yang tepat. Silakan pilih jenjang pendidikan untuk memulai.
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}
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
              onClick={() => onSelectCategory(cat.id)}
              whileHover={{ 
                y: -6, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                borderColor: color.border
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '20px',
                background: color.bg, color: color.icon,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', flexShrink: 0,
                boxShadow: `inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 12px ${color.icon}20`
              }}>
                <i className={`ti ${cat.icon || 'ti-school'}`}></i>
              </div>
              
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{cat.name}</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px', color: color.icon, fontWeight: 600 }}>
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
