import React, { useState, useEffect, useMemo } from 'react';
import { User, Toast, Module } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import AdminDashboard from './AdminDashboard';
import { Navbar } from './frontend/components/Navbar';
import { LoginView } from './frontend/views/LoginView';
import { ModulesView } from './frontend/views/ModulesView';
import { DetailView } from './frontend/views/DetailView';
import { ProfileView } from './frontend/views/ProfileView';

// --- MAIN APP COMPONENT ---
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'main' | 'profile'>('main');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('simpend_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [appModules, setAppModules] = useState<Module[]>([]);
  const [lastModuleId, setLastModuleId] = useState<number | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const [playedGames, setPlayedGames] = useState<Set<number>>(new Set());
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<number>>(new Set());
  const [showAllDoneModal, setShowAllDoneModal] = useState(false);
  const [completedModulePopup, setCompletedModulePopup] = useState<Module | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Anti spam state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginBlockTime, setLoginBlockTime] = useState<number | null>(null);

  // Anti-inspect implementation
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC')) ||
        (e.ctrlKey && e.code === 'KeyU')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const computedModules = useMemo(() => {
    let prevCompleted = true;
    return appModules.map(mod => {
      let status = 'locked';
      if (completedModuleIds.has(mod.id)) {
        status = 'completed';
      } else if (prevCompleted) {
        status = 'unlocked';
      }
      prevCompleted = (status === 'completed');
      return { ...mod, status };
    });
  }, [completedModuleIds, appModules]);

  useEffect(() => {
    if (showAllDoneModal || showLogoutConfirm || completedModulePopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showAllDoneModal, showLogoutConfirm, completedModulePopup]);

  useEffect(() => {
    // Check auto-login if remember me was checked
    const savedUser = localStorage.getItem('simpend_auto_login');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        refreshUserData(parsed);
      } catch(e) {}
    }
    fetchModules();
  }, []);

  // Polling for new modules
  useEffect(() => {
    // Only poll if not currently playing a module
    if (currentModuleId !== null) return;
    
    let interval: NodeJS.Timeout;
    
    const startPolling = () => {
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchModules();
        }
      }, 15000); // 15 seconds saves resources
    };
    
    startPolling();
    
    const handleVisChange = () => {
      if (document.visibilityState === 'visible') {
        fetchModules(); // Fetch immediately when tab becomes active
      }
    };
    
    document.addEventListener('visibilitychange', handleVisChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, [currentModuleId]);

  const refreshUserData = (user: User) => {
    try {
      const played = localStorage.getItem(`simpend_played_${user.id}`);
      if (played) setPlayedGames(new Set(JSON.parse(played)));
      const completed = localStorage.getItem(`simpend_completed_${user.id}`);
      if (completed) setCompletedModuleIds(new Set(JSON.parse(completed)));
      const lastMod = localStorage.getItem(`simpend_last_module_${user.id}`);
      if (lastMod) setLastModuleId(parseInt(lastMod, 10));
    } catch(e) {}
  };

  const fetchModules = () => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAppModules(data.filter(m => !m.isDeleted));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('simpend_current_user', JSON.stringify(currentUser));
      localStorage.setItem(`simpend_played_${currentUser.id}`, JSON.stringify(Array.from(playedGames)));
      localStorage.setItem(`simpend_completed_${currentUser.id}`, JSON.stringify(Array.from(completedModuleIds)));
      
      let roleTitle = currentUser.role;
      if (roleTitle === 'siswa') roleTitle = 'Siswa';
      else if (roleTitle === 'guru') roleTitle = 'Guru';
      else if (roleTitle === 'admin') roleTitle = 'Admin';
      document.title = `Pusmendik \u2014 ${roleTitle}`;
    } else {
      document.title = 'Pusmendik \u2014 Website Simulasi Pendidikan 2025/2026';
    }
  }, [playedGames, completedModuleIds, currentUser]);

  const handleLogin = async (email: string, pass: string, remember: boolean, mode: 'siswa' | 'guru' | 'admin') => {
    if (loginBlockTime && Date.now() < loginBlockTime) {
      const waitTime = Math.ceil((loginBlockTime - Date.now()) / 1000);
      showToast(`Terlalu banyak percobaan. Coba lagi dalam ${waitTime} detik.`, 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login gagal.');
      }
      
      let user = data.user || data.foundUser; // if returned differently
      if (!user) user = data; // fallback
      
      if (user) {
        // If an admin/guru attempts to login through "siswa" page, they will just be redirected to their dashboard.
        // It's more convenient this way.
      }

      setLoginAttempts(0);
      setLoginBlockTime(null);
      setCurrentUser(user);
      if (remember) {
        localStorage.setItem('simpend_auto_login', JSON.stringify(user));
      } else {
        localStorage.removeItem('simpend_auto_login');
      }
      refreshUserData(user as any);
      fetchModules();
      showToast(`Selamat datang, ${user.name}!`, 'success');
      
      // Redirect based on login mode
      if (user.role === 'admin' || user.role === 'guru') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLoginBlockTime(Date.now() + 60000); // 1 minute block
        showToast('Terlalu banyak percobaan gagal. Akun diblokir sementara.', 'error');
      } else {
        showToast(err.message || 'Username/Email atau password salah.', 'error');
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('simpend_auto_login');
    localStorage.removeItem('simpend_current_user');
    setCurrentUser(null);
    setCurrentModuleId(null);
    setActiveGameId(null);
    setPlayedGames(new Set());
    setCompletedModuleIds(new Set());
    setViewMode('main');
    showToast('Berhasil keluar.', 'info');
    navigate('/login');
  };

  const currentModule = currentModuleId ? computedModules.find(m => m.id === currentModuleId) : null;

  // Track last viewed module
  useEffect(() => {
    if (currentUser && currentModuleId) {
      localStorage.setItem(`simpend_last_module_${currentUser.id}`, currentModuleId.toString());
      setLastModuleId(currentModuleId);
    }
  }, [currentModuleId, currentUser]);

  const handleOpenModule = (id: number) => {
    const target = computedModules.find(m => m.id === id);
    if (!target) return;
    if (target.status === 'locked') {
      showToast('Selesaikan modul sebelumnya terlebih dahulu.', 'error');
      return;
    }
    setCurrentModuleId(id);
    setActiveGameId(null);
    setPlayedGames(new Set());
  };

  const handleLaunchGame = (id: number, title: string) => {
    if (activeGameId !== null && activeGameId !== id) {
      showToast('Tutup game aktif dulu sebelum memilih game lain.', 'error');
      return;
    }
    setActiveGameId(id);
    setPlayedGames(prev => new Set(prev).add(id));
    showToast(`Game "${title}" sedang dimuat…`, 'info');
  };

  const handleCloseGame = () => {
    setActiveGameId(null);
    showToast('Game ditutup.', 'info');
  };

  const handleCompleteModule = () => {
    if (!currentModule) return;
    const totalGames = currentModule.games.length;
    const unplayed = currentModule.games.filter(g => !playedGames.has(g.id));
    
    if (totalGames > 0 && unplayed.length > 0) {
      const names = unplayed.map(g => `"${g.title}"`).join(', ');
      showToast(`Mainkan dulu game: ${names}`, 'error');
      return;
    }

    setCompletedModuleIds(prev => {
      const next = new Set(prev).add(currentModule.id);
      if (next.size === appModules.length) {
         setShowAllDoneModal(true);
      } else {
         setCompletedModulePopup(currentModule);
      }
      return next;
    });
    setActiveGameId(null);
    setCurrentModuleId(null); // Return to module list immediately
    setPlayedGames(new Set()); // Reset played games sequence
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to="/" replace /> :
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <LoginView onLogin={(e, p, r) => handleLogin(e, p, r, 'siswa')} defaultMode="siswa" />
          </motion.div>
        } />
        
        <Route path="/admin/login" element={
          currentUser ? <Navigate to="/admin" replace /> :
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <LoginView onLogin={(e, p, r) => handleLogin(e, p, r, 'admin')} defaultMode="admin" />
          </motion.div>
        } />

        <Route path="/admin" element={
          !currentUser ? <Navigate to="/admin/login" replace /> :
          ((currentUser.role === 'admin' || currentUser.role === 'guru') ? 
            <AdminDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onNavigate={setViewMode} 
              onUpdateUser={setCurrentUser}
            /> : 
            <Navigate to="/" replace />
          )
        } />

        <Route path="/*" element={
          !currentUser ? <Navigate to="/login" replace /> :
            <>
              <Navbar 
                user={currentUser} 
                onLogout={() => setShowLogoutConfirm(true)} 
                viewMode={viewMode}
                onNavigate={(mode, resetModule) => {
                  setViewMode(mode);
                  if (resetModule) {
                    setCurrentModuleId(null);
                    setActiveGameId(null);
                  }
                }} 
                inDetail={!!currentModuleId} 
              />

              <AnimatePresence mode="wait">
                {viewMode === 'main' && !currentModuleId && (
                  <motion.div key="modules" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <ModulesView 
                      modules={computedModules} 
                      onOpenModule={handleOpenModule} 
                      lastModuleId={lastModuleId}
                    />
                  </motion.div>
                )}

                {viewMode === 'main' && currentModuleId && currentModule && (
                  <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <DetailView 
                      module={currentModule}
                      onBack={() => {
                        setCurrentModuleId(null);
                        setActiveGameId(null);
                      }}
                      activeGameId={activeGameId}
                      playedGames={playedGames}
                      onLaunchGame={handleLaunchGame}
                      onCloseGame={handleCloseGame}
                      onCompleteModule={handleCompleteModule}
                    />
                  </motion.div>
                )}

                {viewMode === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                     <ProfileView user={currentUser} completedModuleIds={completedModuleIds} modules={appModules} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
        } />
      </Routes>

      <AnimatePresence>
        {completedModulePopup && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 20 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-content"
              style={{ background: 'white', padding: '36px', borderRadius: '20px', maxWidth: '420px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px' }}
            >
              <div style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }}><i className="ti ti-circle-check-filled"></i></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--success)', marginBottom: '12px' }}>Selamat!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.5 }}>Kamu telah menyelesaikan modul <strong>{completedModulePopup.title}</strong>.</p>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setCompletedModulePopup(null)}>
                Lanjut ke Modul Berikutnya
              </button>
            </motion.div>
          </motion.div>
        )}

        {showAllDoneModal && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 20 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-content"
              style={{ background: 'white', padding: '36px', borderRadius: '20px', maxWidth: '420px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px' }}
            >
              <div style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }}><i className="ti ti-circle-check-filled"></i></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--success)', marginBottom: '12px' }}>Modul Terselesaikan!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.5 }}>Selamat! Kamu telah menyelesaikan seluruh modul pada Simulasi Pendidikan ini. Terus pertahankan semangat belajarmu untuk masa depan yang gemilang!</p>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowAllDoneModal(false)}>
                Tutup &amp; Lihat Progres
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px' }}
            >
              <div style={{ fontSize: '48px', color: 'var(--accent)', marginBottom: '16px', lineHeight: 1 }}><i className="ti ti-alert-triangle"></i></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--text)', marginBottom: '12px' }}>Konfirmasi Logout</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>Apakah kamu yakin ingin keluar? Progres kamu akan tetap tersimpan aman.</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowLogoutConfirm(false)}>Batal</button>
                <button className="btn btn-danger btn-full" onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}>Ya, Keluar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="toast-container" id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} style={{ animation: 'slideIn 0.3s ease' }}>
            {t.type === 'success' && <i className="ti ti-circle-check"></i>}
            {t.type === 'error' && <i className="ti ti-circle-x"></i>}
            {t.type === 'info' && <i className="ti ti-info-circle"></i>}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}
