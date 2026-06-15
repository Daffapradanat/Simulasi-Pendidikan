import ProfileView from './admin/views/ProfileView';
import TeachersView from './admin/views/TeachersView';
import StudentsView from './admin/views/StudentsView';
import ModulesAddEditView from './admin/views/ModulesAddEditView';
import ModulesView from './admin/views/ModulesView';
import DashboardView from './admin/views/DashboardView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Module } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

// Types for Admin
type AdminViewMode = 'dashboard' | 'modules' | 'modules_add_edit' | 'students' | 'teachers' | 'profile';

export default function AdminDashboard({ user, onLogout, onNavigate, onUpdateUser }: { user: any, onLogout: () => void, onNavigate: (v: 'main' | 'profile') => void, onUpdateUser?: (u: any) => void }) {
  const navigate = useNavigate();
  const [view, setView] = useState<AdminViewMode>('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // States for data
  const [modules, setModules] = useState<Module[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // States for CRUD
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ 
    title: '', desc: '', level: 'SD', duration: '', 
    objectives: '', theory: '', keyTerms: [] as {term: string, def: string}[] 
  });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', nisn: '', asalSekolah: '' });
  const [teacherForm, setTeacherForm] = useState({ name: '', subject: '', nip: '', email: '' });
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [moduleGameFiles, setModuleGameFiles] = useState<{file: File | null, title: string, desc: string, id?: number, path?: string}[]>([]);

  // Search states
  const [moduleSearch, setModuleSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Modals & Delete
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{type: 'module'|'student'|'teacher', id: number} | null>(null);

  useEffect(() => {
    if (showTeacherModal || showStudentModal || showLogoutConfirm || confirmDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showTeacherModal, showStudentModal, showLogoutConfirm, confirmDelete]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [modRes, stuRes, teachRes] = await Promise.all([
          fetch('/api/modules').then(r => r.json()),
          fetch('/api/students').then(r => r.json()),
          fetch('/api/teachers').then(r => r.json())
        ]);
        setModules(modRes);
        setStudents(stuRes);
        setTeachers(teachRes);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const material = {
        objectives: moduleForm.objectives.split('\n').filter(s => s.trim()),
        theory: moduleForm.theory,
        keyTerms: moduleForm.keyTerms
      };
      const formData = new FormData();
      formData.append('title', moduleForm.title);
      formData.append('desc', moduleForm.desc);
      formData.append('level', moduleForm.level);
      formData.append('duration', moduleForm.duration);
      formData.append('material', JSON.stringify(material));
      
      const gamesMeta = moduleGameFiles.map((gf, idx) => ({ 
        id: gf.id || (Date.now() + idx), 
        title: gf.title, 
        desc: gf.desc,
        path: gf.path,
        hasNewFile: !!gf.file
      }));
      formData.append('gamesMeta', JSON.stringify(gamesMeta));
      
      moduleGameFiles.forEach((gf, idx) => {
        if (gf.file && gf.file.size > 0 && gf.file.name) {
          formData.append('gameFiles', gf.file);
        }
      });
      
      if (editingModule) {
        const res = await fetch(`/api/modules/${editingModule.id}`, {
          method: 'PUT',
          body: formData
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setModules(modules.map(m => m.id === editingModule.id ? data.module : m));
      } else {
        const res = await fetch('/api/modules', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setModules([...modules, data.module]);
      }
      setView('modules');
      setEditingModule(null);
      setModuleForm({ title: '', desc: '', level: 'SD', duration: '', objectives: '', theory: '', keyTerms: [] });
      setModuleGameFiles([]);
    } catch (err: any) {
      alert(`Error saving module: ${err.message}`);
      console.error(err);
    }
  };

  const handleDeleteModule = (id: number) => {
    setConfirmDelete({ type: 'module', id });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        const res = await fetch(`/api/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentForm)
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setStudents(students.map(s => s.id === editingStudent.id ? data.student : s));
      } else {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentForm)
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setStudents([...students, data.student]);
      }
      setShowStudentModal(false);
      setEditingStudent(null);
      setStudentForm({ name: '', email: '', nisn: '', asalSekolah: '' });
    } catch (err: any) {
      alert(`Error saving student: ${err.message}`);
      console.error(err);
    }
  };

  const handleDeleteStudent = (id: number) => {
    setConfirmDelete({ type: 'student', id });
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        const res = await fetch(`/api/teachers/${editingTeacher.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teacherForm)
        });
        const data = await res.json();
        setTeachers(teachers.map(t => t.id === editingTeacher.id ? data.teacher : t));
      } else {
        const res = await fetch('/api/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teacherForm)
        });
        const data = await res.json();
        setTeachers([...teachers, data.teacher]);
      }
      setShowTeacherModal(false);
      setEditingTeacher(null);
      setTeacherForm({ name: '', subject: '', nip: '', email: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeacher = (id: number) => {
    setConfirmDelete({ type: 'teacher', id });
  };

  const handleRestoreModule = async (id: number) => {
    try {
      await fetch(`/api/modules/${id}/restore`, { method: 'PUT' });
      setModules(modules.map(m => m.id === id ? { ...m, isDeleted: false } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreStudent = async (id: number) => {
    try {
      await fetch(`/api/students/${id}/restore`, { method: 'PUT' });
      setStudents(students.map(s => s.id === id ? { ...s, isDeleted: false } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreTeacher = async (id: number) => {
    try {
      await fetch(`/api/teachers/${id}/restore`, { method: 'PUT' });
      setTeachers(teachers.map(t => t.id === id ? { ...t, isDeleted: false } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    try {
      if (type === 'module') {
        await fetch(`/api/modules/${id}`, { method: 'DELETE' });
        setModules(modules.map(m => m.id === id ? { ...m, isDeleted: true } : m));
      } else if (type === 'student') {
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        setStudents(students.map(s => s.id === id ? { ...s, isDeleted: true } : s));
      } else if (type === 'teacher') {
        await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
        setTeachers(teachers.map(t => t.id === id ? { ...t, isDeleted: true } : t));
      }
      setConfirmDelete(null);
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const exportToExcel = () => {
    const data = students.map(s => ({
      ID: s.id,
      NISN: s.nisn || '-',
      'Nama Siswa': s.name,
      'Email': s.email,
      'Asal Sekolah': s.asalSekolah || '-',
      'Progres Belajar (%)': s.progress,
      'Status': s.isDeleted ? 'Nonaktif' : (s.progress === 100 ? 'Lulus' : s.progress > 0 ? 'Aktif' : 'Belum Mulai')
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
    XLSX.writeFile(workbook, "laporan_progres_siswa.xlsx");
  };

  const exportTeacherExcel = () => {
    const data = teachers.map(t => ({
      ID: t.id,
      NIP: t.nip || '-',
      'Nama Guru': t.name,
      'Mata Pelajaran': t.subject,
      'Status': t.isDeleted ? 'Nonaktif' : 'Aktif'
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guru");
    XLSX.writeFile(workbook, "laporan_guru.xlsx");
  };

  const renderContent = () => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;

    switch (view) {
      case 'dashboard':
        return <DashboardView modules={modules} students={students} teachers={teachers} />;
      case 'modules':
        return <ModulesView 
          modules={modules} setView={setView} setEditingModule={setEditingModule} 
          setModuleForm={setModuleForm} moduleSearch={moduleSearch} setModuleSearch={setModuleSearch} setModuleGameFiles={setModuleGameFiles} 
          handleRestoreModule={handleRestoreModule} handleDeleteModule={handleDeleteModule} 
        />;
      case 'modules_add_edit':
        return <ModulesAddEditView 
          editingModule={editingModule} moduleForm={moduleForm} setModuleForm={setModuleForm} 
          setView={setView} handleSaveModule={handleSaveModule} 
          moduleGameFiles={moduleGameFiles} setModuleGameFiles={setModuleGameFiles}
        />;
      case 'students':
        return <StudentsView 
          students={students} studentSearch={studentSearch} setStudentSearch={setStudentSearch}
          setShowStudentModal={setShowStudentModal} setEditingStudent={setEditingStudent} setStudentForm={setStudentForm}
          handleRestoreStudent={handleRestoreStudent} handleDeleteStudent={handleDeleteStudent} exportToExcel={exportToExcel}
        />;
      case 'teachers':
        return <TeachersView 
          teachers={teachers} teacherSearch={teacherSearch} setTeacherSearch={setTeacherSearch}
          setShowTeacherModal={setShowTeacherModal} setEditingTeacher={setEditingTeacher}
          setTeacherForm={setTeacherForm} handleRestoreTeacher={handleRestoreTeacher}
          handleDeleteTeacher={handleDeleteTeacher} exportTeacherExcel={exportTeacherExcel}
        />;
      case 'profile':
        return <ProfileView 
          user={user} isEditingProfile={isEditingProfile} setIsEditingProfile={setIsEditingProfile}
          profileForm={profileForm} setProfileForm={setProfileForm} onUpdateUser={onUpdateUser}
        />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Admin */}
      <div className="admin-sidebar">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <div className="navbar-logo" style={{ marginBottom: 0 }}>
            <img src="/Pusmendik-dashboard.png" className="logo-img" alt="Pusmendik Dashboard Logo" />
          </div>
        </div>
        <div className="admin-sidebar-menu">
          <button className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'dashboard' ? undefined : 'none' }} onClick={() => setView('dashboard')}>
            <i className="ti ti-dashboard"></i> Dashboard
          </button>
          <button className={`btn ${view === 'modules' || view === 'modules_add_edit' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: (view === 'modules' || view === 'modules_add_edit') ? undefined : 'none' }} onClick={() => setView('modules')}>
            <i className="ti ti-books"></i> Manajemen Modul
          </button>
          {user?.role === 'admin' && (
            <>
              <button className={`btn ${view === 'students' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'students' ? undefined : 'none' }} onClick={() => setView('students')}>
                <i className="ti ti-users"></i> Manajemen Siswa
              </button>
              <button className={`btn ${view === 'teachers' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'teachers' ? undefined : 'none' }} onClick={() => setView('teachers')}>
                <i className="ti ti-user-check"></i> Manajemen Guru
              </button>
            </>
          )}
          <button className={`btn ${view === 'profile' ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ justifyContent: 'flex-start', border: view === 'profile' ? undefined : 'none' }} onClick={() => setView('profile')}>
            <i className="ti ti-user"></i> Profil
          </button>
          
          <button className={`btn btn-ghost btn-full`} style={{ justifyContent: 'flex-start', border: 'none', marginTop: '16px', color: 'var(--primary)' }} onClick={() => navigate('/')}>
            <i className="ti ti-arrow-up-right"></i> Akses Frontend
          </button>

          <div className="admin-logout-wrapper">
            <button className="btn btn-danger btn-full" style={{ justifyContent: 'flex-start' }} onClick={handleLogoutClick}>
              <i className="ti ti-logout"></i> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-main">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Logout Warning Modal */}
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
              style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
            >
              <div style={{ fontSize: '48px', color: 'var(--accent)', marginBottom: '16px', lineHeight: 1 }}><i className="ti ti-alert-triangle"></i></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--text)', marginBottom: '12px' }}>Konfirmasi Logout</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>Apakah Anda yakin ingin keluar dari panel admin? Sesi Anda akan berakhir dan Anda harus masuk kembali.</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowLogoutConfirm(false)}>Batal</button>
                <button className="btn btn-danger btn-full" onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}>Ya, Keluar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
            >
              <div style={{ fontSize: '48px', color: 'var(--danger)', marginBottom: '16px', lineHeight: 1 }}><i className="ti ti-trash"></i></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--text)', marginBottom: '12px' }}>Konfirmasi Hapus</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>Apakah Anda yakin ingin menonaktifkan data ini? Data yang dinonaktifkan tidak akan terlihat oleh pengguna, namun dapat direstore kembali.</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost btn-full" onClick={() => setConfirmDelete(null)}>Batal</button>
                <button className="btn btn-danger btn-full" onClick={executeDelete}>Ya, Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher Modal */}
      <AnimatePresence>
        {showTeacherModal && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
           >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              style={{ background: 'var(--surface)', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px' }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', marginBottom: '20px' }}>{editingTeacher ? 'Edit Guru' : 'Tambah Guru'}</h2>
              <form onSubmit={handleSaveTeacher}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>NIP</label>
                  <input type="text" className="form-input" required value={teacherForm.nip} onChange={e => setTeacherForm({...teacherForm, nip: e.target.value})} placeholder="Masukkan NIP..." />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Nama Lengkap</label>
                  <input type="text" className="form-input" required value={teacherForm.name} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} placeholder="Masukkan nama..." />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Email</label>
                  <input type="email" className="form-input" required value={teacherForm.email} onChange={e => setTeacherForm({...teacherForm, email: e.target.value})} placeholder="Masukkan email..." />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Mata Pelajaran</label>
                  <input type="text" className="form-input" required value={teacherForm.subject} onChange={e => setTeacherForm({...teacherForm, subject: e.target.value})} placeholder="Contoh: Matematika" />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowTeacherModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">{editingTeacher ? 'Simpan' : 'Tambah Guru'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Modal */}
      <AnimatePresence>
        {showStudentModal && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              style={{ background: 'var(--surface)', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px' }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', marginBottom: '20px' }}>{editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}</h2>
              <form onSubmit={handleSaveStudent}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>NISN</label>
                  <input type="text" className="form-input" required value={studentForm.nisn} onChange={e => setStudentForm({...studentForm, nisn: e.target.value})} placeholder="Nomor Induk Siswa Nasional..." />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Nama Lengkap</label>
                  <input type="text" className="form-input" required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} placeholder="Masukkan nama..." />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Asal Sekolah</label>
                  <input type="text" className="form-input" required value={studentForm.asalSekolah} onChange={e => setStudentForm({...studentForm, asalSekolah: e.target.value})} placeholder="Misal: SMAN 1 Jakarta" />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Email</label>
                  <input type="email" className="form-input" required value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} placeholder="siswa@sekolah.sch.id" />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowStudentModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">{editingStudent ? 'Simpan' : 'Simpan Siswa'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
