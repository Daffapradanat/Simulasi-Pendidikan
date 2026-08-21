import { toast } from '../components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { Module, Category, Subject } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import React, { useState, useEffect, Suspense, lazy } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import { fetchAuth } from '../lib/fetchAuth';
const ProfileView = lazy(() => import('./views/ProfileView'));
const TeachersView = lazy(() => import('./views/TeachersView'));
const StudentsView = lazy(() => import('./views/StudentsView'));
const ModulesAddEditView = lazy(() => import('./views/ModulesAddEditView'));
const ModulesView = lazy(() => import('./views/ModulesView'));
const DashboardView = lazy(() => import('./views/DashboardView'));
const AuditView = lazy(() => import('./views/AuditView'));
const CategoriesSubjectsView = lazy(() => import('./views/CategoriesSubjectsView'));
const SchoolsView = lazy(() => import('./views/SchoolsView'));


// Types for Admin
type AdminViewMode = 'dashboard' | 'modules' | 'modules_add_edit' | 'students' | 'teachers' | 'profile' | 'audit' | 'categories_subjects' | 'schools';

export default function AdminDashboard({ user, onLogout, onNavigate, onUpdateUser }: { user: any, onLogout: () => void, onNavigate: (v: 'main' | 'profile') => void, onUpdateUser?: (u: any) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<AdminViewMode>(() => {
    const path = location.pathname.split("/").pop() as AdminViewMode;
    const validPaths: AdminViewMode[] = ["dashboard", "modules", "modules_add_edit", "students", "teachers", "profile", "audit", "categories_subjects", "schools"];
    return validPaths.includes(path) ? path : "dashboard";
  });


  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetchAuth('/api/auth/me');
        if (!res.ok) {
          onLogout();
        }
      } catch (e) {
        // ignore network errors
      }
    };
    
    checkSession();
  }, [onLogout]);

  useEffect(() => {
    const path = location.pathname.split("/").pop() as AdminViewMode;
    const validPaths: AdminViewMode[] = ["dashboard", "modules", "modules_add_edit", "students", "teachers", "profile", "audit", "categories_subjects", "schools"];
    if (validPaths.includes(path) && view !== path) {
      setView(path);
    }
  }, [location.pathname]);

  const handleSetView = (newView: AdminViewMode) => {
    setView(newView);
    const basePath = user?.role === "admin" ? "/admin" : "/guru";
    navigate(`${basePath}/${newView}`);
  };
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // States for data
  const [modules, setModules] = useState<Module[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const displayedModules = React.useMemo(() => {
    if (user?.role === 'guru') {
      const guruCatIds = user.category_ids || [];
      const guruSubIds = user.subject_ids || [];
      if (guruCatIds.length === 0 && guruSubIds.length === 0) return modules; // If no spec, see nothing
      return modules.filter(m => guruCatIds.includes(m.category_id) || guruSubIds.includes(m.subject_id));
    }
    return modules;
  }, [modules, user]);
  
  // States for CRUD
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ 
    title: '', desc: '', level: categories.length > 0 ? categories[0].name : '', duration: '', 
    category_id: 1, subject_id: 1,
    objectives: '', theory: '', keyTerms: [] as {term: string, def: string}[], banner_url: '' 
  });
  const [studentForm, setStudentForm] = useState<any>({ name: '', email: '', nisn: '', school_id: '' });
  const [teacherForm, setTeacherForm] = useState<any>({ name: '', nip: '', email: '', subject_ids: [] as number[], school_id: '' });
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [moduleGameFiles, setModuleGameFiles] = useState<{file: File | null, title: string, desc: string, id?: number, path?: string}[]>([]);
  const [moduleQuestions, setModuleQuestions] = useState<any[]>([]);

  // Search states
  const [moduleSearch, setModuleSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Modals & Delete
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  // Password visibility states
  const [showTeacherPw, setShowTeacherPw] = useState(false);
  const [showTeacherConfirmPw, setShowTeacherConfirmPw] = useState(false);
  const [showStudentPw, setShowStudentPw] = useState(false);
  const [showStudentConfirmPw, setShowStudentConfirmPw] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{type: 'module'|'student'|'teacher'|'category'|'subject', id: number} | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  useEffect(() => {
    if (showTeacherModal || showStudentModal || showLogoutConfirm || confirmDelete || showClearAllConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showTeacherModal, showStudentModal, showLogoutConfirm, confirmDelete, showClearAllConfirm]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [modRes, stuRes, teachRes, catRes, subRes, schRes] = await Promise.all([
          fetchAuth('/api/modules').then(r => r.ok ? r.json() : null),
          fetchAuth('/api/students').then(r => r.ok ? r.json() : null),
          fetchAuth('/api/teachers').then(r => r.ok ? r.json() : null),
          fetchAuth('/api/categories').then(r => r.ok ? r.json() : null),
          fetchAuth('/api/subjects').then(r => r.ok ? r.json() : null),
          fetchAuth('/api/schools').then(r => r.ok ? r.json() : null)
        ]);
        
        if (Array.isArray(modRes)) setModules(modRes);
        if (Array.isArray(stuRes)) setStudents(stuRes);
        if (Array.isArray(teachRes)) setTeachers(teachRes);
        if (Array.isArray(catRes)) setCategories(catRes);
        if (Array.isArray(subRes)) setSubjects(subRes);
        if (Array.isArray(schRes)) setSchools(schRes);
      } catch (err) {
        // Quiet error handling
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const [isSavingModule, setIsSavingModule] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingModule) return;
    setIsSavingModule(true);
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
      formData.append('category_id', moduleForm.category_id.toString());
      formData.append('subject_id', moduleForm.subject_id.toString());
      formData.append('duration', moduleForm.duration);
      formData.append('banner_url', moduleForm.banner_url || '');
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
        const res = await fetchAuth(`/api/modules/${editingModule.id}`, {
          method: 'PUT',
          body: formData
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setModules(modules.map(m => m.id === editingModule.id ? data.module : m));
      } else {
        const res = await fetchAuth('/api/modules', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setModules([...modules, data.module]);
        
        await fetchAuth(`/api/modules/${data.module.id}/questions`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ questions: moduleQuestions })
        });
      }
      
      if (editingModule) {
        await fetchAuth(`/api/modules/${editingModule.id}/questions`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ questions: moduleQuestions })
        });
      }
      setView('modules');
      setEditingModule(null);
      setModuleForm({ title: '', desc: '', level: categories.length > 0 ? categories[0].name : '', duration: '', category_id: 1, subject_id: 1, objectives: '', theory: '', keyTerms: [], banner_url: '' });
      setModuleGameFiles([]);
                setModuleQuestions([]);
    } catch (err: any) {
      toast.error(`Error saving module: ${err.message}`);
      console.error(err);
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleDeleteModule = (id: number) => {
    setConfirmDelete({ type: 'module', id });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingStudent) return;
    setIsSavingStudent(true);
    if (studentForm.password !== studentForm.confirm_password) {
      toast.error("Password dan Konfirmasi Password tidak cocok!");
      setIsSavingStudent(false);
      return;
    }
    try {
      if (editingStudent) {
        const res = await fetchAuth(`/api/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan data siswa");
        setStudents(students.map(s => s.id === editingStudent.id ? data.student : s));
      } else {
        const res = await fetchAuth('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambah siswa");
        setStudents([...students, data.student]);
      }
      setShowStudentModal(false);
      setShowStudentPw(false);
      setShowStudentConfirmPw(false);
      setEditingStudent(null);
      setStudentForm({ name: '', email: '', nisn: '', school_id: '', password: '', confirm_password: '' });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleDeleteStudent = (id: number) => {
    setConfirmDelete({ type: 'student', id });
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingTeacher) return;
    setIsSavingTeacher(true);
    if (teacherForm.password !== teacherForm.confirm_password) {
      toast.error("Password dan Konfirmasi Password tidak cocok!");
      setIsSavingTeacher(false);
      return;
    }
    try {
      if (editingTeacher) {
        const res = await fetchAuth(`/api/teachers/${editingTeacher.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teacherForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan data guru");
        setTeachers(teachers.map(t => t.id === editingTeacher.id ? data.teacher : t));
      } else {
        const res = await fetchAuth('/api/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teacherForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambah guru");
        setTeachers([...teachers, data.teacher]);
      }
      setShowTeacherModal(false);
      setShowTeacherPw(false);
      setShowTeacherConfirmPw(false);
      setEditingTeacher(null);
      setTeacherForm({ name: '', nip: '', email: '', subject_ids: [], school_id: '', password: '', confirm_password: '' });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      console.error(err);
      if (err.message === '401') {
         onLogout();
      }
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const handleDeleteTeacher = (id: number) => {
    setConfirmDelete({ type: 'teacher', id });
  };

  const handleRestoreModule = async (id: number) => {
    try {
      const res = await fetchAuth(`/api/modules/${id}/restore`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memulihkan');
      setModules(modules.map(m => m.id === id ? { ...m, isDeleted: false } : m));
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    }
  };

  const handleRestoreStudent = async (id: number) => {
    try {
      const res = await fetchAuth(`/api/students/${id}/restore`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memulihkan');
      setStudents(students.map(s => s.id === id ? { ...s, isDeleted: false } : s));
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    }
  };

  const handleRestoreTeacher = async (id: number) => {
    try {
      const res = await fetchAuth(`/api/teachers/${id}/restore`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memulihkan');
      setTeachers(teachers.map(t => t.id === id ? { ...t, isDeleted: false } : t));
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    try {
      if (type === 'module') {
        await fetchAuth(`/api/modules/${id}`, { method: 'DELETE' });
        setModules(modules.filter(m => m.id !== id));
      } else if (type === 'student') {
        await fetchAuth(`/api/students/${id}`, { method: 'DELETE' });
        setStudents(students.map(s => s.id === id ? { ...s, isDeleted: true } : s));
      } else if (type === 'teacher') {
        await fetchAuth(`/api/teachers/${id}`, { method: 'DELETE' });
        setTeachers(teachers.map(t => t.id === id ? { ...t, isDeleted: true } : t));
      } else if (type === 'category') {
        await fetchAuth(`/api/categories/${id}`, { method: 'DELETE' });
        setCategories(categories.filter(c => c.id !== id));
      } else if (type === 'subject') {
        await fetchAuth(`/api/subjects/${id}`, { method: 'DELETE' });
        setSubjects(subjects.filter(c => c.id !== id));
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
      'Asal Sekolah': schools.find((sch: any) => sch.id === s.school_id)?.name || '-',
      'Progres Belajar (%)': s.progress,
      'Status': s.isDeleted ? 'Nonaktif' : (s.progress === 100 ? 'Lulus' : s.progress > 0 ? 'Aktif' : 'Belum Mulai')
    }));
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
      XLSX.writeFile(workbook, "laporan_progres_siswa.xlsx");
    });
  };

  const exportTeacherExcel = () => {
    const data = teachers.map(t => ({
      ID: t.id,
      NIP: t.nip || '-',
      'Nama Guru': t.name,
      'Spesialisasi Mata Pelajaran': (t.subject_ids || []).map((id: number) => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', '),
      'Status': t.isDeleted ? 'Nonaktif' : 'Aktif'
    }));
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Guru");
      XLSX.writeFile(workbook, "laporan_guru.xlsx");
    });
  };

  const renderContent = () => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;

    switch (view) {
      case 'dashboard':
        return <DashboardView modules={displayedModules} students={students} teachers={teachers} user={user} setView={handleSetView as any} />;
      case 'modules':
        return <ModulesView setModuleQuestions={setModuleQuestions} 
          modules={displayedModules} setView={handleSetView} setEditingModule={setEditingModule} 
          setModuleForm={setModuleForm} moduleSearch={moduleSearch} setModuleSearch={setModuleSearch} setModuleGameFiles={setModuleGameFiles} 
          handleRestoreModule={handleRestoreModule} handleDeleteModule={handleDeleteModule} 
          categories={categories}
        />;
      case 'modules_add_edit':
        return <ModulesAddEditView
          moduleQuestions={moduleQuestions}
          setModuleQuestions={setModuleQuestions} 
          editingModule={editingModule} moduleForm={moduleForm} setModuleForm={setModuleForm}
          setView={handleSetView} handleSaveModule={handleSaveModule}
          moduleGameFiles={moduleGameFiles} setModuleGameFiles={setModuleGameFiles}
          isSaving={isSavingModule}
          categories={categories} subjects={subjects}
        />;

      case 'categories_subjects':
        return <CategoriesSubjectsView 
          categories={categories}
          subjects={subjects}
          onAddCategory={async (name, icon) => {
            const res = await fetchAuth('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, icon }) });
            const data = await res.json();
            setCategories([...categories, data.category]);
          }}
          onEditCategory={async (id, name, icon) => {
            const res = await fetchAuth(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, icon }) });
            const data = await res.json();
            setCategories(categories.map(c => c.id === id ? data.category : c));
          }}
          onDeleteCategory={(id) => setConfirmDelete({ type: 'category', id })}
          onReorderCategories={async (orderIds) => {
            const res = await fetchAuth('/api/categories/reorder', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderIds }) });
            if (res.ok) {
              const data = await res.json();
              setCategories(data.categories);
            }
          }}
          onAddSubject={async (name, icon) => {
            const res = await fetchAuth('/api/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, icon }) });
            const data = await res.json();
            setSubjects([...subjects, data.subject]);
          }}
          onEditSubject={async (id, name, icon) => {
            const res = await fetchAuth(`/api/subjects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, icon }) });
            const data = await res.json();
            setSubjects(subjects.map(s => s.id === id ? data.subject : s));
          }}
          onDeleteSubject={(id) => setConfirmDelete({ type: 'subject', id })}
          onReorderSubjects={async (orderIds) => {
            const res = await fetchAuth('/api/subjects/reorder', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderIds }) });
            if (res.ok) {
              const data = await res.json();
              setSubjects(data.subjects);
            }
          }}
        />;
      case 'audit':

        return <AuditView modules={displayedModules} />;
      case 'students':
        return <StudentsView 
          students={students} studentSearch={studentSearch} setStudentSearch={setStudentSearch}
          setShowStudentModal={setShowStudentModal} setEditingStudent={setEditingStudent} setStudentForm={setStudentForm}
          handleRestoreStudent={handleRestoreStudent} handleDeleteStudent={handleDeleteStudent} exportToExcel={exportToExcel}
          readOnly={user?.role === 'guru'}
          modules={modules} schools={schools} />;
      case 'teachers':
        return <TeachersView 
          teachers={teachers} teacherSearch={teacherSearch} setTeacherSearch={setTeacherSearch}
          setShowTeacherModal={setShowTeacherModal} setEditingTeacher={setEditingTeacher}
          setTeacherForm={setTeacherForm} handleRestoreTeacher={handleRestoreTeacher}
          handleDeleteTeacher={handleDeleteTeacher} exportTeacherExcel={exportTeacherExcel}
          categories={categories}
          subjects={subjects}
          schools={schools}
         readOnly={user?.role === 'guru'} />;
      case 'schools':
        return <SchoolsView 
          schools={schools}
          setSchools={setSchools}
          categories={categories}
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
      <Sidebar user={user} view={view} setView={(v: any) => handleSetView(v as AdminViewMode)} onLogout={() => setShowLogoutConfirm(true)} onNavigate={onNavigate as any}  />
      <div className="admin-main">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '64px' }}><div className="loading-spinner"></div></div>}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        <ConfirmModal
          isOpen={showLogoutConfirm}
          title="Konfirmasi Keluar"
          message="Apakah Anda yakin ingin keluar dari sesi ini? Anda harus login kembali untuk mengakses dashboard administrator."
          confirmText="Ya, Keluar"
          isDanger={true}
          onConfirm={onLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        <ConfirmModal
          isOpen={!!confirmDelete}
          title="Konfirmasi Penghapusan"
          message={
            confirmDelete?.type === 'category' || confirmDelete?.type === 'subject' || confirmDelete?.type === 'module'
              ? 'Apakah Anda yakin ingin menghapus data ini secara permanen? Peringatan: Menghapus data ini juga akan menghapus atau memengaruhi data lain yang terkait.'
              : 'Apakah Anda yakin ingin menonaktifkan data ini? Data yang dinonaktifkan tidak akan terlihat oleh pengguna, namun dapat direstore kembali.'
          }
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
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
              style={{ background: 'var(--surface)', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}
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
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Password {editingTeacher && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Kosongkan jika tidak ingin mengubah)</span>}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showTeacherPw ? "text" : "password"} style={{ paddingRight: '40px' }} className="form-input" required={!editingTeacher} value={teacherForm.password || ''} onChange={e => setTeacherForm({...teacherForm, password: e.target.value})} placeholder={editingTeacher ? "Kosongkan untuk tetap menggunakan password lama" : "Masukkan password baru..."} minLength={4} />
                    <button type="button" onClick={() => setShowTeacherPw(!showTeacherPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <i className={showTeacherPw ? "ti ti-eye-off" : "ti ti-eye"}></i>
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Konfirmasi Password {editingTeacher && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Kosongkan jika tidak ingin mengubah)</span>}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showTeacherConfirmPw ? "text" : "password"} style={{ paddingRight: '40px' }} className="form-input" required={!editingTeacher || !!teacherForm.password} value={teacherForm.confirm_password || ''} onChange={e => setTeacherForm({...teacherForm, confirm_password: e.target.value})} placeholder="Konfirmasi password..." minLength={4} />
                    <button type="button" onClick={() => setShowTeacherConfirmPw(!showTeacherConfirmPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <i className={showTeacherConfirmPw ? "ti ti-eye-off" : "ti ti-eye"}></i>
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Asal Sekolah</label>
                  <select 
                    className="form-input" 
                    value={teacherForm.school_id || ''} 
                    onChange={e => setTeacherForm({...teacherForm, school_id: Number(e.target.value)})}
                  >
                    <option value="">Pilih Sekolah (Opsional)</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Mata Pelajaran (Spesialisasi)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {subjects.map(s => {
                      const isSelected = (teacherForm.subject_ids || []).includes(s.id);
                      return (
                      <label key={s.id} style={{ 
                         display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer',
                         padding: '6px 12px', borderRadius: '100px', border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                         background: isSelected ? 'var(--primary)' : 'transparent', color: isSelected ? '#ffffff' : 'var(--text)',
                         fontWeight: isSelected ? 600 : 500, transition: 'all 0.2s'
                      }}>
                        <input type="checkbox" style={{ display: 'none' }} checked={isSelected} onChange={(e) => {
                          if (e.target.checked) setTeacherForm({...teacherForm, subject_ids: [...(teacherForm.subject_ids||[]), s.id]});
                          else setTeacherForm({...teacherForm, subject_ids: (teacherForm.subject_ids||[]).filter((id: number) => id !== s.id)});
                        }} /> {s.name}
                      </label>
                    )})}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => {
                    setShowTeacherModal(false);
                    setShowTeacherPw(false);
                    setShowTeacherConfirmPw(false);
                  }}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={isSavingTeacher}>{isSavingTeacher ? 'Menyimpan...' : (editingTeacher ? 'Simpan' : 'Tambah Guru')}</button>
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
              style={{ background: 'var(--surface)', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}
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
                  <select 
                    className="form-input" 
                    required 
                    value={studentForm.school_id || ''} 
                    onChange={e => setStudentForm({...studentForm, school_id: Number(e.target.value)})}
                  >
                    <option value="" disabled>Pilih Sekolah</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Email</label>
                  <input type="email" className="form-input" required value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} placeholder="siswa@sekolah.sch.id" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Password {editingStudent && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Kosongkan jika tidak ingin mengubah)</span>}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showStudentPw ? "text" : "password"} style={{ paddingRight: '40px' }} className="form-input" required={!editingStudent} value={studentForm.password || ''} onChange={e => setStudentForm({...studentForm, password: e.target.value})} placeholder={editingStudent ? "Kosongkan untuk tetap menggunakan password lama" : "Masukkan password baru..."} minLength={4} />
                    <button type="button" onClick={() => setShowStudentPw(!showStudentPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <i className={showStudentPw ? "ti ti-eye-off" : "ti ti-eye"}></i>
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Konfirmasi Password {editingStudent && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Kosongkan jika tidak ingin mengubah)</span>}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showStudentConfirmPw ? "text" : "password"} style={{ paddingRight: '40px' }} className="form-input" required={!editingStudent || !!studentForm.password} value={studentForm.confirm_password || ''} onChange={e => setStudentForm({...studentForm, confirm_password: e.target.value})} placeholder="Konfirmasi password..." minLength={4} />
                    <button type="button" onClick={() => setShowStudentConfirmPw(!showStudentConfirmPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <i className={showStudentConfirmPw ? "ti ti-eye-off" : "ti ti-eye"}></i>
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => {
                    setShowStudentModal(false);
                    setShowStudentPw(false);
                    setShowStudentConfirmPw(false);
                  }}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={isSavingStudent}>{isSavingStudent ? 'Menyimpan...' : (editingStudent ? 'Simpan' : 'Simpan Siswa')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
