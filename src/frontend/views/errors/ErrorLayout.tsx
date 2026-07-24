import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function ErrorLayout({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.3 }} 
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'var(--surface)' }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: '100px', color: 'var(--primary)', marginBottom: '32px' }}></i>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 16px', lineHeight: 1 }}>{title}</h1>
      <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '500px', lineHeight: '1.6' }}>{desc}</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/')} style={{ borderRadius: '100px', padding: '14px 32px' }}>
        <i className="ti ti-arrow-left"></i> Kembali ke Beranda
      </button>
    </motion.div>
  );
}
