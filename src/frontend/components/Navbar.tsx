import { User } from '../../types';
import React, { useState } from 'react';

// --- NAVBAR COMPONENT ---
export function Navbar({ user, onLogout, viewMode, inDetail, onNavigate }: { user: User | null, onLogout: () => void, viewMode: 'main' | 'profile', inDetail: boolean, onNavigate: (mode: 'main' | 'profile', resetModule_?: boolean) => void }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="https://upload.wikimedia.org/wikipedia/id/4/44/Logo_PENS.png" className="logo-img" alt="PENS Logo URL" />
          <div className="logo-text">
            SimPend
            <span>Simulasi Pendidikan 2025/2026</span>
          </div>
        </div>
        <div className="navbar-spacer"></div>
        {user && (
          <div className="navbar-menu">
             <span className={`navbar-link ${viewMode === 'main' && !inDetail ? 'active' : ''}`} onClick={() => onNavigate('main', true)} style={{ cursor: 'pointer' }}><i className="ti ti-home" aria-hidden="true"></i> Beranda</span>
             <span className={`navbar-link ${viewMode === 'main' && inDetail ? 'active' : ''}`} onClick={() => onNavigate('main', true)} style={{ cursor: 'pointer' }}><i className="ti ti-layout-list" aria-hidden="true"></i> Modul</span>
             <span className={`navbar-link ${viewMode === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}><i className="ti ti-user" aria-hidden="true"></i> Profil</span>
          </div>
        )}
        {user && (
          <div className="navbar-user">
            <div className="navbar-avatar">
              <span>{user.name.charAt(0)}</span>
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
          <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onNavigate('main', true); }}><i className="ti ti-home" aria-hidden="true"></i> Beranda</span>
          <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onNavigate('main', true); }}><i className="ti ti-layout-list" aria-hidden="true"></i> Modul</span>
          <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onNavigate('profile'); }}><i className="ti ti-user" aria-hidden="true"></i> Profil</span>
          <span className="navbar-link" onClick={() => { setMobileNavOpen(false); onLogout(); }}><i className="ti ti-logout" aria-hidden="true"></i> Keluar</span>
        </div>
      )}
    </>
  );
}
