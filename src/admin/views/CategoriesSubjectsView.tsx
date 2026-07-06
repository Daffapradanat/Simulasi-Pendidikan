import React, { useState } from 'react';
import { Category, Subject } from '../../types';

export default function CategoriesSubjectsView({
  categories,
  subjects,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddSubject,
  onEditSubject,
  onDeleteSubject
}: {
  categories: Category[];
  subjects: Subject[];
  onAddCategory: (name: string) => void;
  onEditCategory: (id: number, name: string) => void;
  onDeleteCategory: (id: number) => void;
  onAddSubject: (name: string) => void;
  onEditSubject: (id: number, name: string) => void;
  onDeleteSubject: (id: number) => void;
}) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [currentPageCat, setCurrentPageCat] = useState(1);
  const [currentPageSub, setCurrentPageSub] = useState(1);
  const itemsPerPage = 10;
  
  const totalPagesCat = Math.ceil(categories.length / itemsPerPage);
  const displayedCategories = categories.slice((currentPageCat - 1) * itemsPerPage, currentPageCat * itemsPerPage);
  
  const totalPagesSub = Math.ceil(subjects.length / itemsPerPage);
  const displayedSubjects = subjects.slice((currentPageSub - 1) * itemsPerPage, currentPageSub * itemsPerPage);


  return (
    <div className="admin-content">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Categories Section */}
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Manajemen Jenjang</h3>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (editingCategory) {
                onEditCategory(editingCategory.id, categoryName);
                setEditingCategory(null);
              } else {
                onAddCategory(categoryName);
              }
              setCategoryName('');
            }}
            style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}
          >
            <input 
              type="text" 
              className="form-input" 
              placeholder="Nama Jenjang (contoh: SD)" 
              value={categoryName} 
              onChange={e => setCategoryName(e.target.value)} 
              required
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              {editingCategory ? 'Simpan' : 'Tambah'}
            </button>
            {editingCategory && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditingCategory(null); setCategoryName(''); }}>
                Batal
              </button>
            )}
          </form>
          
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
                      Tidak ada jenjang.
                    </td>
                  </tr>
                ) : (
                  displayedCategories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td style={{ textAlign: 'center' }}>{(currentPageCat - 1) * itemsPerPage + index + 1}</td>
                      <td style={{ fontWeight: 500 }}>{cat.name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); }}>
                            <i className="ti ti-edit"></i>
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDeleteCategory(cat.id)}>
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
            {totalPagesSub > 1 && (
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

            {totalPagesCat > 1 && (
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

        {/* Subjects Section */}
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Manajemen Mata Pelajaran</h3>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (editingSubject) {
                onEditSubject(editingSubject.id, subjectName);
                setEditingSubject(null);
              } else {
                onAddSubject(subjectName);
              }
              setSubjectName('');
            }}
            style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}
          >
            <input 
              type="text" 
              className="form-input" 
              placeholder="Nama Mata Pelajaran (contoh: IPA)" 
              value={subjectName} 
              onChange={e => setSubjectName(e.target.value)} 
              required
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              {editingSubject ? 'Simpan' : 'Tambah'}
            </button>
            {editingSubject && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditingSubject(null); setSubjectName(''); }}>
                Batal
              </button>
            )}
          </form>
          
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
                  displayedSubjects.map((sub, index) => (
                    <tr key={sub.id}>
                      <td style={{ textAlign: 'center' }}>{(currentPageSub - 1) * itemsPerPage + index + 1}</td>
                      <td style={{ fontWeight: 500 }}>{sub.name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditingSubject(sub); setSubjectName(sub.name); }}>
                            <i className="ti ti-edit"></i>
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDeleteSubject(sub.id)}>
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
