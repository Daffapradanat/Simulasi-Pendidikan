import React, { useState } from 'react';

export function Sidebar({ user, view, setView, onLogout, onNavigate, onClearAll }: { user: any, view: string, setView: (view: string) => void, onLogout?: () => void, onNavigate?: (v: 'main' | 'profile') => void, onClearAll?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (v: string) => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <>
      <div className="admin-mobile-header">
        <div className="navbar-logo" style={{ marginBottom: 0 }}>
          <img src="/digital/simulasisains/Pusmendik-dashboard.png" className="logo-img" alt="Pusmendik Dashboard Logo" style={{ height: '32px' }} />
        </div>
        <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
      
      <div className={`admin-sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}></div>
      
      <div className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <div className="navbar-logo" style={{ marginBottom: 0 }}>
            <img src="/digital/simulasisains/Pusmendik-dashboard.png" className="logo-img" alt="Pusmendik Dashboard Logo" />
          </div>
        </div>
        <div className="admin-sidebar-menu">
          <button className={`btn btn-ghost btn-full ${view === 'dashboard' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: view === 'dashboard' ? undefined : 'none' }} onClick={() => handleNav('dashboard')}>
            <i className="ti ti-layout-dashboard"></i> Dashboard
          </button>
          {(user?.role === 'admin' || user?.role === 'guru') && (
          <button className={`btn btn-ghost btn-full ${view === 'modules' || view === 'modules_add_edit' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: (view === 'modules' || view === 'modules_add_edit') ? undefined : 'none' }} onClick={() => handleNav('modules')}>
            <i className="ti ti-books"></i> Manajemen Modul
          </button>
          )}
          {(user?.role === 'admin') && (
          <button className={`btn btn-ghost btn-full ${view === 'categories_subjects' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: view === 'categories_subjects' ? undefined : 'none' }} onClick={() => handleNav('categories_subjects')}>
            <i className="ti ti-book-2"></i> Jenjang & Mapel
          </button>
          )}
          {(user?.role === 'admin') && (
          <button className={`btn btn-ghost btn-full ${view === 'schools' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: view === 'schools' ? undefined : 'none' }} onClick={() => handleNav('schools')}>
            <i className="ti ti-building-community"></i> Sekolah
          </button>
          )}
          {(user?.role === 'admin') && (
          <button className={`btn btn-ghost btn-full ${view === 'audit' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: view === 'audit' ? undefined : 'none' }} onClick={() => handleNav('audit')}>
            <i className="ti ti-clipboard-check"></i> Audit Modul
          </button>
          )}
          <button className={`btn btn-ghost btn-full ${view === 'students' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: view === 'students' ? undefined : 'none' }} onClick={() => handleNav('students')}>
            <i className="ti ti-users"></i> Manajemen Siswa
          </button>
          {(user?.role === 'admin' || user?.role === 'guru') && (
          <button className={`btn btn-ghost btn-full ${view === 'teachers' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: view === 'teachers' ? undefined : 'none' }} onClick={() => handleNav('teachers')}>
            <i className="ti ti-user-plus"></i> Manajemen Guru
          </button>
          )}
          <button className={`btn btn-ghost btn-full ${view === 'profile' ? 'active' : ''}`} style={{ justifyContent: 'flex-start', border: view === 'profile' ? undefined : 'none' }} onClick={() => handleNav('profile')}>
            <i className="ti ti-settings"></i> Profil Admin
          </button>
        </div>
        {(onLogout || onNavigate) && (
        <div className="admin-logout-wrapper">
          {onNavigate && (
          <button className="btn btn-outline btn-full" onClick={() => onNavigate('main')}>
            <i className="ti ti-device-desktop"></i> Akses Frontend
          </button>
          )}
          
          {onLogout && (
          <button className="btn btn-danger btn-full" onClick={onLogout}>
            <i className="ti ti-logout"></i> Logout
          </button>
          )}
        </div>
        )}
      </div>
    </>
  );
}
