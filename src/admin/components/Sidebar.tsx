import React from 'react';

export function Sidebar({ user, view, setView, onLogout, onNavigate }: { user: any, view: string, setView: (view: string) => void, onLogout?: () => void, onNavigate?: (v: 'main' | 'profile') => void }) {
  return (
    <div className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <div className="navbar-logo" style={{ marginBottom: 0 }}>
          <img src="/Pusmendik-dashboard.png" className="logo-img" alt="Pusmendik Dashboard Logo" />
        </div>
      </div>
      <div className="admin-sidebar-menu" style={{ flex: 1, overflowY: 'auto' }}>
        <button className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'dashboard' ? undefined : 'none' }} onClick={() => setView('dashboard')}>
          <i className="ti ti-dashboard"></i> Dashboard
        </button>
        {(user?.role === 'admin' || user?.role === 'guru') && (
        <button className={`btn ${view === 'modules' || view === 'modules_add_edit' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: (view === 'modules' || view === 'modules_add_edit') ? undefined : 'none' }} onClick={() => setView('modules')}>
          <i className="ti ti-books"></i> Manajemen Modul
        </button>
        )}
        {(user?.role === 'admin') && (
        <button className={`btn ${view === 'categories_subjects' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'categories_subjects' ? undefined : 'none' }} onClick={() => setView('categories_subjects')}>
          <i className="ti ti-book-2"></i> Jenjang & Mapel
        </button>
        )}
        {(user?.role === 'admin') && (
        <button className={`btn ${view === 'schools' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'schools' ? undefined : 'none' }} onClick={() => setView('schools')}>
          <i className="ti ti-building-community"></i> Sekolah
        </button>
        )}
        {(user?.role === 'admin') && (
        <button className={`btn ${view === 'audit' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'audit' ? undefined : 'none' }} onClick={() => setView('audit')}>
          <i className="ti ti-clipboard-check"></i> Audit Modul
        </button>
        )}
        <button className={`btn ${view === 'students' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'students' ? undefined : 'none' }} onClick={() => setView('students')}>
          <i className="ti ti-users"></i> Manajemen Siswa
        </button>
        {(user?.role === 'admin' || user?.role === 'guru') && (
        <button className={`btn ${view === 'teachers' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'teachers' ? undefined : 'none' }} onClick={() => setView('teachers')}>
          <i className="ti ti-user-plus"></i> Manajemen Guru
        </button>
        )}
        <button className={`btn ${view === 'profile' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'profile' ? undefined : 'none' }} onClick={() => setView('profile')}>
          <i className="ti ti-settings"></i> Profil Admin
        </button>
      </div>
      {(onLogout || onNavigate) && (
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
  );
}
