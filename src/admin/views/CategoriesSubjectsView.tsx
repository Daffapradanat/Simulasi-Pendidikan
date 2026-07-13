import React, { useState, useRef } from 'react';
import { Category, Subject } from '../../types';

// Tabler icons list for selection
const ICONS = [
  'ti-book', 'ti-calculator', 'ti-flask', 'ti-language', 'ti-map', 'ti-bulb', 'ti-code',
  'ti-music', 'ti-palette', 'ti-ball-basketball', 'ti-microscope', 'ti-leaf', 'ti-planet',
  'ti-abacus', 'ti-device-desktop', 'ti-school', 'ti-book-2', 'ti-pencil', 'ti-books', 'ti-brain',
  'ti-rocket', 'ti-compass', 'ti-atom', 'ti-building', 'ti-home', 'ti-chart-bar'
];

function IconPicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className="btn btn-ghost"
        title="Pilih Ikon"
        style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'white' }}
      >
        <i className={`ti ${value}`} style={{ fontSize: '20px' }}></i>
      </button>
      
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)}></div>
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', zIndex: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '260px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {ICONS.map(i => (
              <button 
                key={i} 
                type="button"
                title={i.replace('ti-', '')}
                onClick={() => { onChange(i); setOpen(false); }}
                className={`btn btn-sm ${value === i ? 'btn-primary' : 'btn-ghost'}`}
                style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className={`ti ${i}`} style={{ fontSize: '20px' }}></i>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CategoriesSubjectsView({
  categories,
  subjects,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onReorderCategories,
  onReorderSubjects
}: {
  categories: Category[];
  subjects: Subject[];
  onAddCategory: (name: string, icon?: string) => void;
  onEditCategory: (id: number, name: string, icon?: string) => void;
  onDeleteCategory: (id: number) => void;
  onAddSubject: (name: string, icon?: string) => void;
  onEditSubject: (id: number, name: string, icon?: string) => void;
  onDeleteSubject: (id: number) => void;
  onReorderCategories: (orderIds: number[]) => void;
  onReorderSubjects: (orderIds: number[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<'categories' | 'subjects'>('categories');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('ti-school');
  
  const [subjectName, setSubjectName] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('ti-book');

  const [currentPageCat, setCurrentPageCat] = useState(1);
  const [currentPageSub, setCurrentPageSub] = useState(1);
  const itemsPerPage = 10;

  const [reorderModeCat, setReorderModeCat] = useState(false);
  const [reorderModeSub, setReorderModeSub] = useState(false);

  const dragItemCat = useRef<number | null>(null);
  const dragOverItemCat = useRef<number | null>(null);

  const dragItemSub = useRef<number | null>(null);
  const dragOverItemSub = useRef<number | null>(null);

  const handleSortCat = () => {
    if (dragItemCat.current === null || dragOverItemCat.current === null) return;
    const items = [...categories];
    const draggedItemContent = items.splice(dragItemCat.current, 1)[0];
    items.splice(dragOverItemCat.current, 0, draggedItemContent);
    dragItemCat.current = null;
    dragOverItemCat.current = null;
    onReorderCategories(items.map(i => i.id));
  };

  const handleSortSub = () => {
    if (dragItemSub.current === null || dragOverItemSub.current === null) return;
    const items = [...subjects];
    const draggedItemContent = items.splice(dragItemSub.current, 1)[0];
    items.splice(dragOverItemSub.current, 0, draggedItemContent);
    dragItemSub.current = null;
    dragOverItemSub.current = null;
    onReorderSubjects(items.map(i => i.id));
  };

  const totalPagesCat = Math.ceil(categories.length / itemsPerPage);
  const totalPagesSub = Math.ceil(subjects.length / itemsPerPage);

  const displayedCategories = reorderModeCat ? categories : categories.slice((currentPageCat - 1) * itemsPerPage, currentPageCat * itemsPerPage);
  const displayedSubjects = reorderModeSub ? subjects : subjects.slice((currentPageSub - 1) * itemsPerPage, currentPageSub * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>Jenjang & Mata Pelajaran</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Kelola data jenjang kelas dan mata pelajaran yang tersedia di aplikasi.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', opacity: (reorderModeCat || reorderModeSub) ? 0.5 : 1, pointerEvents: (reorderModeCat || reorderModeSub) ? 'none' : 'auto' }}>
        <button 
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'categories' ? 'none' : '1px solid transparent' }}
          onClick={() => setActiveTab('categories')}
        >
          Jenjang Pendidikan
        </button>
        <button 
          className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'subjects' ? 'none' : '1px solid transparent' }}
          onClick={() => setActiveTab('subjects')}
        >
          Mata Pelajaran
        </button>
      </div>

      {activeTab === 'categories' && (
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Daftar Jenjang</h3>
            {!reorderModeCat && <button className="btn btn-sm btn-ghost" onClick={() => setReorderModeCat(true)}>
              <i className="ti ti-arrows-move-vertical"></i> Urutkan
            </button>}
          </div>

          {!reorderModeCat && <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (editingCategory) {
                onEditCategory(editingCategory.id, categoryName, categoryIcon);
                setEditingCategory(null);
              } else {
                onAddCategory(categoryName, categoryIcon);
              }
              setCategoryName('');
              setCategoryIcon('ti-school');
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <IconPicker value={categoryIcon} onChange={setCategoryIcon} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nama Jenjang (contoh: SD, SMP)" 
                value={categoryName} 
                onChange={e => setCategoryName(e.target.value)} 
                required
                style={{ flex: 1, height: '42px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {editingCategory && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditingCategory(null); setCategoryName(''); setCategoryIcon('ti-school'); }}>
                  Batal
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                {editingCategory ? 'Simpan' : 'Tambah Jenjang'}
              </button>
            </div>
          </form>}
          
          {reorderModeCat && (
            <div style={{ padding: '16px', marginBottom: '24px', background: 'var(--primary)', color: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="ti ti-info-circle" style={{ fontSize: '24px', color: '#ffffff' }}></i>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Mode Urutan Aktif</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#ffffff', opacity: 0.95 }}>Tarik dan lepaskan baris pada tabel di bawah untuk mengatur urutan. Urutan akan tersimpan otomatis.</p>
                </div>
              </div>
              <button className="btn" style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 600, border: 'none', padding: '8px 16px', borderRadius: '8px' }} onClick={() => setReorderModeCat(false)}>Selesai</button>
            </div>
          )}

          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No.</th>
                  <th>Nama Jenjang</th>
                  <th style={{ width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Tidak ada jenjang pendidikan.
                    </td>
                  </tr>
                ) : (
                  displayedCategories.map((cat, index) => {
                    const absIndex = reorderModeCat ? index : (currentPageCat - 1) * itemsPerPage + index;
                    return (
                    <tr 
                      key={cat.id} 
                      draggable={reorderModeCat}
                      onDragStart={(e) => {
                        if (!reorderModeCat) return;
                        dragItemCat.current = absIndex;
                        e.currentTarget.style.opacity = '0.5';
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnter={(e) => {
                        if (!reorderModeCat) return;
                        dragOverItemCat.current = absIndex;
                        e.currentTarget.style.background = 'var(--primary-light)';
                      }}
                      onDragLeave={(e) => {
                        if (!reorderModeCat) return;
                        e.currentTarget.style.background = '';
                      }}
                      onDragEnd={(e) => {
                        if (!reorderModeCat) return;
                        e.currentTarget.style.opacity = '1';
                        const rows = e.currentTarget.parentElement?.children;
                        if (rows) {
                           for (let i=0; i<rows.length; i++) (rows[i] as HTMLElement).style.background = '';
                        }
                        handleSortCat();
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      style={{ cursor: reorderModeCat ? 'grab' : 'default', transition: 'background 0.2s' }}
                    >
                      <td style={{ textAlign: 'center' }}>
                         {reorderModeCat ? <i className="ti ti-grip-vertical" style={{ color: 'var(--text-muted)' }}></i> : absIndex + 1}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           {cat.icon && <i className={`ti ${cat.icon}`} style={{ color: 'var(--primary)', fontSize: '18px' }}></i>}
                           {cat.name}
                         </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setCategoryIcon(cat.icon || 'ti-school'); }} disabled={reorderModeCat}>
                            <i className="ti ti-edit"></i>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => onDeleteCategory(cat.id)} disabled={reorderModeCat}>
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
            
            {totalPagesCat > 1 && !reorderModeCat && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Menampilkan {(currentPageCat - 1) * itemsPerPage + 1} - {Math.min(currentPageCat * itemsPerPage, categories.length)} dari {categories.length}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-ghost btn-sm" disabled={currentPageCat === 1} onClick={() => setCurrentPageCat(p => p - 1)} style={{ padding: '4px 8px' }}><i className="ti ti-chevron-left"></i></button>
                  {Array.from({ length: totalPagesCat }).map((_, i) => (
                    <button key={i} className={`btn btn-sm ${currentPageCat === i + 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCurrentPageCat(i + 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{i + 1}</button>
                  ))}
                  <button className="btn btn-ghost btn-sm" disabled={currentPageCat === totalPagesCat} onClick={() => setCurrentPageCat(p => p + 1)} style={{ padding: '4px 8px' }}><i className="ti ti-chevron-right"></i></button>
                </div>
              </div>
            )}
            

          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Daftar Mata Pelajaran</h3>
            {!reorderModeSub && <button className="btn btn-sm btn-ghost" onClick={() => setReorderModeSub(true)}>
              <i className="ti ti-arrows-move-vertical"></i> Urutkan
            </button>}
          </div>
          
          {!reorderModeSub && <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (editingSubject) {
                onEditSubject(editingSubject.id, subjectName, subjectIcon);
                setEditingSubject(null);
              } else {
                onAddSubject(subjectName, subjectIcon);
              }
              setSubjectName('');
              setSubjectIcon('ti-book');
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <IconPicker value={subjectIcon} onChange={setSubjectIcon} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nama Mata Pelajaran (contoh: Matematika)" 
                value={subjectName} 
                onChange={e => setSubjectName(e.target.value)} 
                required
                style={{ flex: 1, height: '42px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {editingSubject && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditingSubject(null); setSubjectName(''); setSubjectIcon('ti-book'); }}>
                  Batal
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                {editingSubject ? 'Simpan' : 'Tambah Mata Pelajaran'}
              </button>
            </div>
          </form>}
          
          {reorderModeSub && (
            <div style={{ padding: '16px', marginBottom: '24px', background: 'var(--primary)', color: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="ti ti-info-circle" style={{ fontSize: '24px', color: '#ffffff' }}></i>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Mode Urutan Aktif</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#ffffff', opacity: 0.95 }}>Tarik dan lepaskan baris pada tabel di bawah untuk mengatur urutan. Urutan akan tersimpan otomatis.</p>
                </div>
              </div>
              <button className="btn" style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 600, border: 'none', padding: '8px 16px', borderRadius: '8px' }} onClick={() => setReorderModeSub(false)}>Selesai</button>
            </div>
          )}

          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No.</th>
                  <th>Nama Mata Pelajaran</th>
                  <th style={{ width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Tidak ada mata pelajaran.
                    </td>
                  </tr>
                ) : (
                  displayedSubjects.map((sub, index) => {
                    const absIndex = reorderModeSub ? index : (currentPageSub - 1) * itemsPerPage + index;
                    return (
                    <tr 
                      key={sub.id} 
                      draggable={reorderModeSub}
                      onDragStart={(e) => {
                        if (!reorderModeSub) return;
                        dragItemSub.current = absIndex;
                        e.currentTarget.style.opacity = '0.5';
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnter={(e) => {
                        if (!reorderModeSub) return;
                        dragOverItemSub.current = absIndex;
                        e.currentTarget.style.background = 'var(--primary-light)';
                      }}
                      onDragLeave={(e) => {
                        if (!reorderModeSub) return;
                        e.currentTarget.style.background = '';
                      }}
                      onDragEnd={(e) => {
                        if (!reorderModeSub) return;
                        e.currentTarget.style.opacity = '1';
                        const rows = e.currentTarget.parentElement?.children;
                        if (rows) {
                           for (let i=0; i<rows.length; i++) (rows[i] as HTMLElement).style.background = '';
                        }
                        handleSortSub();
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      style={{ cursor: reorderModeSub ? 'grab' : 'default', transition: 'background 0.2s' }}
                    >
                      <td style={{ textAlign: 'center' }}>
                         {reorderModeSub ? <i className="ti ti-grip-vertical" style={{ color: 'var(--text-muted)' }}></i> : absIndex + 1}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           {sub.icon && <i className={`ti ${sub.icon}`} style={{ color: 'var(--primary)', fontSize: '18px' }}></i>}
                           {sub.name}
                         </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => { setEditingSubject(sub); setSubjectName(sub.name); setSubjectIcon(sub.icon || 'ti-book'); }} disabled={reorderModeSub}>
                            <i className="ti ti-edit"></i>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => onDeleteSubject(sub.id)} disabled={reorderModeSub}>
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
            
            {totalPagesSub > 1 && !reorderModeSub && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Menampilkan {(currentPageSub - 1) * itemsPerPage + 1} - {Math.min(currentPageSub * itemsPerPage, subjects.length)} dari {subjects.length}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-ghost btn-sm" disabled={currentPageSub === 1} onClick={() => setCurrentPageSub(p => p - 1)} style={{ padding: '4px 8px' }}><i className="ti ti-chevron-left"></i></button>
                  {Array.from({ length: totalPagesSub }).map((_, i) => (
                    <button key={i} className={`btn btn-sm ${currentPageSub === i + 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCurrentPageSub(i + 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{i + 1}</button>
                  ))}
                  <button className="btn btn-ghost btn-sm" disabled={currentPageSub === totalPagesSub} onClick={() => setCurrentPageSub(p => p + 1)} style={{ padding: '4px 8px' }}><i className="ti ti-chevron-right"></i></button>
                </div>
              </div>
            )}
            

          </div>
        </div>
      )}
    </div>
  );
}
