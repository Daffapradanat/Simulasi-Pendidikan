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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 500 }}>{cat.name}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); }}>
                    <i className="ti ti-edit"></i>
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDeleteCategory(cat.id)}>
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              </div>
            ))}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {subjects.map(sub => (
              <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 500 }}>{sub.name}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditingSubject(sub); setSubjectName(sub.name); }}>
                    <i className="ti ti-edit"></i>
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDeleteSubject(sub.id)}>
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
