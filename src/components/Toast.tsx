import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const recentMessages = new Map<string, number>();

export const toast = {
  success: (msg: string) => {
    if (!msg) return;
    const now = Date.now();
    const last = recentMessages.get(msg) || 0;
    if (now - last < 1800) return;
    recentMessages.set(msg, now);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type: 'success' } }));
  },
  error: (msg: string) => {
    if (!msg) return;
    const now = Date.now();
    const last = recentMessages.get(msg) || 0;
    if (now - last < 1800) return;
    recentMessages.set(msg, now);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type: 'error' } }));
  },
  info: (msg: string) => {
    if (!msg) return;
    const now = Date.now();
    const last = recentMessages.get(msg) || 0;
    if (now - last < 1800) return;
    recentMessages.set(msg, now);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type: 'info' } }));
  }
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const msg = e.detail?.msg;
      const type = e.detail?.type || 'info';
      if (!msg) return;

      const id = Date.now() + Math.random();
      setToasts(prev => {
        // If success or error arrives, clear any pending info/loading toasts
        let filtered = prev;
        if (type === 'success' || type === 'error') {
          filtered = filtered.filter(t => t.type !== 'info');
        }

        // Prevent duplicate message if already visible
        if (filtered.some(t => t.msg === msg)) return filtered;

        // Keep at most 2 active toasts to prevent clutter
        const next = [...filtered, { id, msg, type }];
        return next.slice(-2);
      });

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };

    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div 
      className="toast-container no-print"
      style={{ 
        position: 'fixed', 
        top: 24, 
        right: 24, 
        zIndex: 999999, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 10,
        maxWidth: 'calc(100vw - 48px)',
        width: '380px',
        pointerEvents: 'none'
      }}
    >
      <AnimatePresence>
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const bg = isSuccess ? '#059669' : isError ? '#dc2626' : '#2563eb';
          const title = isSuccess ? 'Berhasil' : isError ? 'Terjadi Kesalahan' : 'Pemberitahuan';

          return (
            <motion.div 
              key={t.id}
              className="toast no-print"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15 } }}
              style={{
                pointerEvents: 'auto',
                background: bg,
                color: '#ffffff',
                padding: '14px 18px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {isError ? (
                  <i className="ti ti-alert-circle" style={{ fontSize: '18px', color: '#fff' }}></i>
                ) : isSuccess ? (
                  <i className="ti ti-check" style={{ fontSize: '18px', color: '#fff' }}></i>
                ) : (
                  <i className="ti ti-info-circle" style={{ fontSize: '18px', color: '#fff' }}></i>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', opacity: 0.9, marginBottom: '2px' }}>
                  {title}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {t.msg}
                </div>
              </div>

              <button 
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  lineHeight: 1,
                  borderRadius: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                title="Tutup"
              >
                <i className="ti ti-x"></i>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
