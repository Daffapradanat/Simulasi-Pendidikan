import { User } from '../../types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- NAVBAR COMPONENT ---
export function Navbar({ user, onLogout, viewMode, inDetail, onNavigate }: { user: User | null, onLogout: () => void, viewMode: 'main' | 'profile', inDetail: boolean, onNavigate: (mode: 'main' | 'profile', resetModule_?: boolean) => void }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="/logo_pens.png" className="logo-img" alt="PENS Logo URL" />
          <div className="logo-text">
            SimPend
            <span>Simulasi Pendidikan 2025/2026</span>
          </div>
        </div>
        <div className="navbar-spacer"></div>
        {user && (
          <div className="navbar-menu">
             <span className={`navbar-link ${viewMode === 'main' && !inDetail ? 'active' : ''}`} onClick={() => onNavigate('main', true)} style={{ cursor: 'pointer' }}><i className="ti ti-books" aria-hidden="true"></i> Semua Modul</span>
             {inDetail && <span className={`navbar-link ${viewMode === 'main' && inDetail ? 'active' : ''}`} onClick={() => onNavigate('main', false)} style={{ cursor: 'pointer' }}><i className="ti ti-layout-list" aria-hidden="true"></i> Sedang Dipelajari</span>}
             <span className={`navbar-link ${viewMode === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}><i className="ti ti-user" aria-hidden="true"></i> Profil</span>
             {user.role === 'admin' && (
               <span className="navbar-link" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}><i className="ti ti-dashboard" aria-hidden="true"></i> Dashboard</span>
             )}
          </div>
        )}
        {user && (
          <div className="navbar-user">
            <div className="navbar-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', border: '2px solid rgba(255,255,255,0.8)' }}>
              <i className="ti ti-user" style={{ fontSize: '16px' }}></i>
            </div>
            <span className="navbar-username">{user.name}</span>
          </div>
        )}
        {user && <button className="btn-logout" onClick={onLogout}>Keluar</button>}
        {user && (
          <div className="hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <span></span><span></span><span></span>
          </div>
        )}
      </nav>

      {user && mobileNavOpen && (
        <div className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
          <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onNavigate('main', true); }}><i className="ti ti-books" aria-hidden="true"></i> Semua Modul</span>
          {inDetail && <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onNavigate('main', false); }}><i className="ti ti-layout-list" aria-hidden="true"></i> Sedang Dipelajari</span>}
          <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onNavigate('profile'); }}><i className="ti ti-user" aria-hidden="true"></i> Profil</span>
          {user.role === 'admin' && (
             <span className="navbar-link" onClick={() => { setMobileNavOpen(false); navigate('/admin'); }}><i className="ti ti-dashboard" aria-hidden="true"></i> Dashboard</span>
          )}
          <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onLogout(); }}><i className="ti ti-logout" aria-hidden="true"></i> Keluar</span>
        </div>
      )}
    </>
  );
}
