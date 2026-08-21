import { ToastContainer, toast } from "./components/Toast";
import { LoginView } from './frontend/views/LoginView';
import { ModulesView } from './frontend/views/ModulesView';
import { DetailView } from './frontend/views/DetailView';
import { ProfileView } from './frontend/views/ProfileView';
import { SubjectSelectionView } from './frontend/views/SubjectSelectionView';
import { CategorySelectionView } from './frontend/views/CategorySelectionView';
import { User, Toast, Module } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Navbar } from './frontend/components/Navbar';
import AdminDashboard from './admin/AdminDashboard';
import { fetchAuth } from './lib/fetchAuth';
import { ErrorView } from './frontend/views/ErrorView';
import { syncProgressWithServer } from './lib/syncProgress';


// --- MAIN APP COMPONENT ---
export default function App() {
  console.log("App render", Date.now());
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
  const [appCategories, setAppCategories] = useState<any[]>([]);
  const [appSubjects, setAppSubjects] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [lastModuleId, setLastModuleId] = useState<number | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const [playedGames, setPlayedGames] = useState<Set<number>>(new Set());
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<number>>(new Set());
  const [reflections, setReflections] = useState<Record<number, string>>({});
  const [showAllDoneModal, setShowAllDoneModal] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/guru') || location.pathname.startsWith('/login')) return;

    if (location.pathname === '/profile') {
      setViewMode('profile');
      setCurrentModuleId(null);
    } else if (location.pathname.startsWith('/module/')) {
      const parts = location.pathname.split('/');
      const modId = parseInt(parts[2]);
      if (modId) {
        setViewMode('main');
        setCurrentModuleId(modId);
        const mod = appModules.find(m => m.id === modId);
        if (mod) {
          setSelectedCategoryId(mod.category_id || null);
          setSelectedSubjectId(mod.subject_id || null);
        }
      }
    } else if (location.pathname.startsWith('/category/')) {
      const parts = location.pathname.split('/');
      const catId = parseInt(parts[2]);
      if (catId) {
        setViewMode('main');
        setCurrentModuleId(null);
        setSelectedCategoryId(catId);
        if (parts[3] === 'subject' && parts[4]) {
          setSelectedSubjectId(parseInt(parts[4]));
        } else {
          setSelectedSubjectId(null);
        }
      }
    } else if (location.pathname === '/') {
      setViewMode('main');
      setCurrentModuleId(null);
      setSelectedCategoryId(null);
      setSelectedSubjectId(null);
    }
  }, [location.pathname, appModules]);
  const [completedModulePopup, setCompletedModulePopup] = useState<Module | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);
  
  // Anti spam state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginBlockTime, setLoginBlockTime] = useState<number | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast.info(msg);
  };


  const filteredCategories = useMemo(() => {
    return currentUser?.category_ids?.length 
      ? appCategories.filter(c => currentUser.category_ids?.includes(c.id))
      : appCategories;
  }, [appCategories, currentUser?.category_ids]);

  const filteredSubjects = useMemo(() => {
    return currentUser?.subject_ids?.length 
      ? appSubjects.filter(s => currentUser.subject_ids?.includes(s.id))
      : appSubjects;
  }, [appSubjects, currentUser?.subject_ids]);

  useEffect(() => {
    if (filteredCategories.length === 1 && location.pathname === '/') {
      navigate(`/category/${filteredCategories[0].id}`, { replace: true });
    }
  }, [filteredCategories, location.pathname, navigate]);

  useEffect(() => {
    if (selectedCategoryId && filteredSubjects.length === 1 && location.pathname === `/category/${selectedCategoryId}`) {
      navigate(`/category/${selectedCategoryId}/subject/${filteredSubjects[0].id}`, { replace: true });
    }
  }, [selectedCategoryId, filteredSubjects, location.pathname, navigate]);

  const computedModules = useMemo(() => {
    // Group modules by category_id and subject_id
    const grouped = new Map<string, typeof appModules>();
    
    for (const mod of appModules) {
      const catId = mod.category_id || 0;
      const subId = mod.subject_id || 0;
      const key = `${catId}_${subId}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(mod);
    }
    
    const moduleStatuses = new Map<number, string>();
    
    for (const [key, mods] of grouped.entries()) {
      // Sort mods preserve their natural order in appModules
      let prevCompleted = true;
      for (const mod of mods) {
         let status = 'locked';
         if (completedModuleIds.has(mod.id)) {
            status = 'completed';
         } else if (prevCompleted) {
            status = 'unlocked';
         }
         prevCompleted = (status === 'completed');
         moduleStatuses.set(mod.id, status);
      }
    }
    
    return appModules.map(mod => ({
      ...mod,
      status: moduleStatuses.get(mod.id) || 'locked'
    }));
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
    const handleUnauthorized = () => {
      localStorage.removeItem('simpend_token');
      localStorage.removeItem('simpend_current_user');
      localStorage.removeItem('simpend_auto_login');
      setCurrentUser(null);
    };
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('simpend_token');
    let savedUser = localStorage.getItem('simpend_auto_login');
    if (!savedUser) {
      savedUser = localStorage.getItem('simpend_current_user');
    }

    if (token) {
      fetchAuth('/api/auth/me')
        .then(res => {
          if (!res.ok) throw new Error('401');
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('simpend_current_user', JSON.stringify(data.user));
            refreshUserData(data.user);
          } else {
            throw new Error('Invalid user');
          }
        })
        .catch(() => {
          localStorage.removeItem('simpend_token');
          localStorage.removeItem('simpend_current_user');
          localStorage.removeItem('simpend_auto_login');
          setCurrentUser(null);
          setIsProgressLoaded(true);
        });
    } else if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        refreshUserData(parsed);
      } catch (e) {
        setIsProgressLoaded(true);
      }
    } else {
      setCurrentUser(null);
      setIsProgressLoaded(true);
    }
    fetchModules();
  }, []);

  useEffect(() => {
    // Only fetch once on mount
    // visibility polling removed to prevent auto-refresh issues
  }, [currentModuleId]);

  const refreshUserData = async (user: User) => {
    try {
      const res = await fetchAuth(`/api/users/${user.id}/progress`);
      if (res.ok) {
         const data = await res.json();
         if (data.playedGames && data.playedGames.length > 0) setPlayedGames(new Set(data.playedGames));
         else setPlayedGames(new Set());
         if (data.completedModuleIds && data.completedModuleIds.length > 0) setCompletedModuleIds(new Set(data.completedModuleIds));
         else setCompletedModuleIds(new Set());
         if (data.reflections) setReflections(data.reflections);
         else setReflections({});
      } else {
         const played = localStorage.getItem(`simpend_played_${user.id}`);
         if (played) setPlayedGames(new Set(JSON.parse(played)));
         else setPlayedGames(new Set());
         const completed = localStorage.getItem(`simpend_completed_${user.id}`);
         if (completed) setCompletedModuleIds(new Set(JSON.parse(completed)));
         else setCompletedModuleIds(new Set());
         const savedReflections = localStorage.getItem(`simpend_reflections_${user.id}`);
         if (savedReflections) setReflections(JSON.parse(savedReflections));
         else setReflections({});
      }
      const lastMod = localStorage.getItem(`simpend_last_module_${user.id}`);
      if (lastMod) setLastModuleId(parseInt(lastMod, 10));
      setIsProgressLoaded(true);
    } catch(e) {
      setIsProgressLoaded(true);
    }
  };

  const fetchModules = () => {
    fetchAuth('/api/modules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const newData = data.filter(m => !m.isDeleted);
          setAppModules(prev => JSON.stringify(prev) === JSON.stringify(newData) ? prev : newData);
        }
      })
      .catch(() => {});
      
    fetchAuth('/api/categories')
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) {
          setAppCategories(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        }
      })
      .catch(() => {});
      
    fetchAuth('/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAppSubjects(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (currentUser) {
      if (!isProgressLoaded) return;
      localStorage.setItem('simpend_current_user', JSON.stringify(currentUser));
      const pArr = Array.from(playedGames);
      const cArr = Array.from(completedModuleIds);
      localStorage.setItem(`simpend_played_${currentUser.id}`, JSON.stringify(pArr));
      localStorage.setItem(`simpend_completed_${currentUser.id}`, JSON.stringify(cArr));
      localStorage.setItem(`simpend_reflections_${currentUser.id}`, JSON.stringify(reflections));
      
      // Sync with server
      fetchAuth(`/api/users/${currentUser.id}/progress`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('simpend_token')}` },
         body: JSON.stringify({ playedGames: pArr, completedModuleIds: cArr, reflections })
      }).catch(console.error);

      let roleTitle = currentUser.role;
      if (roleTitle === 'siswa') roleTitle = 'Siswa';
      else if (roleTitle === 'guru') roleTitle = 'Guru';
      else if (roleTitle === 'admin') roleTitle = 'Admin';
      document.title = `Pusat Asesmen Pendidikan (${roleTitle})`;
    } else {
      document.title = 'Pusat Asesmen Pendidikan - Website Literasi Sains 2025/2026';
    }
  }, [playedGames, completedModuleIds, reflections, currentUser, isProgressLoaded]);

  const handleLogin = async (email: string, pass: string, remember: boolean, mode: 'siswa' | 'guru' | 'admin') => {
    if (loginBlockTime && Date.now() < loginBlockTime) {
      const waitTime = Math.ceil((loginBlockTime - Date.now()) / 1000);
      showToast(`Terlalu banyak percobaan. Coba lagi dalam ${waitTime} detik.`, 'error');
      return;
    }

    try {
      const res = await fetchAuth('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login gagal.');
      }
      
      let user = data.user || data.foundUser;
      if (data.token) { localStorage.setItem('simpend_token', data.token); } // if returned differently
      if (!user) user = data; // fallback

      if (user.role && user.role !== mode) {
        if (mode === 'admin' || mode === 'guru') {
          fetchAuth('/api/auth/anomaly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, attemptedRole: mode, actualRole: user.role })
          }).catch(console.error);
        }
        throw new Error('Access Denied: Peran akun Anda tidak sesuai dengan portal login ini.');
      }
      
      setLoginAttempts(0);
      setLoginBlockTime(null);
      setCurrentUser(user);
      
      if (user) {
        setTimeout(() => {
          if (user.role === 'guru') {
            navigate('/guru', { replace: true });
          } else if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 0);
      }
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

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('simpend_current_user', JSON.stringify(updatedUser));
    if (localStorage.getItem('simpend_auto_login')) {
      localStorage.setItem('simpend_auto_login', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = async () => {
    const role = currentUser?.role;
    localStorage.removeItem('simpend_token');
    localStorage.removeItem('simpend_auto_login');
    localStorage.removeItem('simpend_current_user');
    
    setCurrentUser(null);
    setCurrentModuleId(null);
    setActiveGameId(null);
    setPlayedGames(new Set());
    setCompletedModuleIds(new Set());
    setIsProgressLoaded(false);
    setViewMode('main');
    showToast('Berhasil keluar.', 'info');

    setTimeout(() => {
      if (role === 'guru') {
        navigate('/guru/login', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 0);
  };

  const currentModule = currentModuleId ? computedModules.find(m => m.id === currentModuleId) : null;


  useEffect(() => {
    const handleOnline = async () => {
      showToast('Koneksi internet kembali tersambung!', 'success');
      if (currentUser && currentUser.id) {
        const pending = localStorage.getItem(`simpend_pending_sync_${currentUser.id}`);
        if (pending) {
          try {
            const data = JSON.parse(pending);
            const success = await syncProgressWithServer(currentUser.id, data.playedGames, data.completedModuleIds, data.reflections);
            if (success) {
              showToast('Progress yang tertunda berhasil disinkronkan ke server.', 'success');
            }
          } catch(e) {}
        }
      }
    };
    const handleOffline = () => showToast('Koneksi internet terputus! Anda sedang offline.', 'error');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

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
    navigate(`/module/${id}`);
    setLastModuleId(id);
    setActiveGameId(null);
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

  const handleCompleteModule = (reflection?: string) => {
    if (!currentModule) return;
    const totalGames = currentModule.games.length;
    const unplayed = currentModule.games.filter(g => !playedGames.has(g.id));
    
    if (totalGames > 0 && unplayed.length > 0) {
      const names = unplayed.map(g => `"${g.title}"`).join(', ');
      showToast(`Mainkan dulu game: ${names}`, 'error');
      return;
    }

    if (reflection) {
      setReflections(prev => ({
        ...prev,
        [currentModule.id]: reflection
      }));
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
  };

  if (!isProgressLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--surface-2)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="loading-spinner"></div></div>}>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin" : currentUser.role === 'guru' ? "/guru" : "/"} replace /> :
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <LoginView onLogin={(e, p, r) => handleLogin(e, p, r, 'siswa')} defaultMode="siswa" />
          </motion.div>
        } />
        
        <Route path="/admin/login" element={
          currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin" : currentUser.role === 'guru' ? "/guru" : "/"} replace /> :
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <LoginView onLogin={(e, p, r) => handleLogin(e, p, r, 'admin')} defaultMode="admin" />
          </motion.div>
        } />

        <Route path="/guru/login" element={
          currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin" : currentUser.role === 'guru' ? "/guru" : "/"} replace /> :
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <LoginView onLogin={(e, p, r) => handleLogin(e, p, r, 'guru')} defaultMode="guru" />
          </motion.div>
        } />

        <Route path="/admin/*" element={
          !currentUser ? <Navigate to="/" replace /> :
          (currentUser.role === 'admin' ? 
            <AdminDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onNavigate={() => { setViewMode('main'); navigate('/'); }} 
              onUpdateUser={handleUpdateUser}
            /> : 
            <Navigate to={currentUser.role === 'guru' ? "/guru" : "/"} replace />
          )
        } />
        
        <Route path="/guru/*" element={
          !currentUser ? <Navigate to="/" replace /> :
          (currentUser.role === 'guru' ? 
            <AdminDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onNavigate={() => { setViewMode('main'); navigate('/'); }} 
              onUpdateUser={handleUpdateUser}
            /> : 
            <Navigate to={currentUser.role === 'admin' ? "/admin" : "/"} replace />
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
                  if (mode === 'profile') {
                    navigate('/profile');
                  } else {
                    navigate('/');
                  }
                  if (resetModule) {
                    setActiveGameId(null);
                  }
                }} 
                inDetail={!!currentModuleId} 
              />

              <AnimatePresence mode="wait">
                {viewMode === 'main' && !currentModuleId && !selectedCategoryId && (
                  <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <CategorySelectionView 
                      categories={filteredCategories} 
                      onSelectCategory={(id) => navigate(`/category/${id}`)} 
                    />
                  </motion.div>
                )}
                {viewMode === 'main' && !currentModuleId && selectedCategoryId && !selectedSubjectId && (
                  <motion.div key="subjects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <SubjectSelectionView 
                      subjects={filteredSubjects} 
                      onSelectSubject={(id) => navigate(`/category/${selectedCategoryId}/subject/${id}`)} 
                      onBack={filteredCategories.length > 1 ? () => navigate('/') : undefined}
                    />
                  </motion.div>
                )}
                {viewMode === 'main' && !currentModuleId && selectedSubjectId && (
                  <motion.div key="modules" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <ModulesView 
                      modules={computedModules.filter(m => m.subject_id === selectedSubjectId && m.category_id === selectedCategoryId)} 
                      onOpenModule={handleOpenModule} 
                      lastModuleId={lastModuleId}
                      onBack={filteredSubjects.length > 1 ? () => navigate(`/category/${selectedCategoryId}`) : undefined}
                    />
                  </motion.div>
                )}
                {viewMode === 'main' && currentModuleId && currentModule && (
                  <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <DetailView 
                      module={currentModule}
                      onBack={() => {
                        setActiveGameId(null);
                        navigate(`/category/${selectedCategoryId}/subject/${selectedSubjectId}`);
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
                     <ProfileView user={currentUser} completedModuleIds={completedModuleIds} modules={appModules} subjects={appSubjects} setUser={handleUpdateUser} reflections={reflections} />
                  </motion.div>
                )}
              </AnimatePresence>
      <ToastContainer />
            </>
        } />
        <Route path="/error/:code" element={<ErrorView />} />
        <Route path="*" element={<ErrorView code={404} />} />
      </Routes>
      </Suspense>

      <AnimatePresence>
        {completedModulePopup && (
          <motion.div 
            key="completedModulePopup"
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
              style={{ background: 'white', padding: '36px', borderRadius: '20px', maxWidth: '420px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}
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
            key="showAllDoneModal"
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
              style={{ background: 'white', padding: '36px', borderRadius: '20px', maxWidth: '420px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }}><i className="ti ti-circle-check-filled"></i></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--success)', marginBottom: '12px' }}>Modul Terselesaikan!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.5 }}>Selamat! Kamu telah menyelesaikan seluruh modul pada Literasi Sains ini. Terus pertahankan semangat belajarmu untuk masa depan yang gemilang!</p>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowAllDoneModal(false)}>
                Tutup &amp; Lihat Progres
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer />

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            key="showLogoutConfirm"
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
              style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}
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
      <ToastContainer />

    </>
  );
}
