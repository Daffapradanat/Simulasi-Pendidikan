import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const toast = {
  success: (msg: string) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type: 'success' } })),
  error: (msg: string) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type: 'error' } })),
  info: (msg: string) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type: 'info' } }))
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
              background: t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: 500
            }}>
            {t.type === 'error' ? <i className="ti ti-alert-circle" style={{ fontSize: '18px' }}></i> : 
             t.type === 'success' ? <i className="ti ti-check" style={{ fontSize: '18px' }}></i> :
             <i className="ti ti-info-circle" style={{ fontSize: '18px' }}></i>}
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
