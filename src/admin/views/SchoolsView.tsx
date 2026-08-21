import { toast } from '../../components/Toast';
import React, { useState } from 'react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';
import { ImportExportMenu } from '../components/ImportExportMenu';
import { fetchAuth } from '../../lib/fetchAuth';

export default function SchoolsView({ schools, setSchools, categories }: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any | null>(null);
  const [schoolForm, setSchoolForm] = useState({ name: '', category_id: '' });
  const [schoolToDelete, setSchoolToDelete] = useState<number | null>(null);
  
  const itemsPerPage = 8;

  const filteredSchools = schools.filter((s: any) => 
    (s.name || '').toLowerCase().includes((schoolSearch || '').toLowerCase())
  );

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const displayedSchools = filteredSchools.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...schoolForm, category_id: Number(schoolForm.category_id) };
      
      let res;
      if (editingSchool) {
        res = await fetchAuth(`/api/schools/${editingSchool.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchAuth('/api/schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      if (editingSchool) {
        setSchools(schools.map((s: any) => s.id === editingSchool.id ? data.school : s));
      } else {
        setSchools([...schools, data.school]);
      }
      
      setShowSchoolModal(false);
      setEditingSchool(null);
      setSchoolForm({ name: '', category_id: '' });
    } catch (err: any) {
      toast.error(`Error saving school: ${err.message}`);
    }
  };

  const executeDeleteSchool = async () => {
    if (schoolToDelete === null) return;
    const id = schoolToDelete;
    try {
      const res = await fetchAuth(`/api/schools/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setSchools(schools.filter((s: any) => s.id !== id));
    } catch (err: any) {
      toast.error(`Error deleting school: ${err.message}`);
    } finally {
      setSchoolToDelete(null);
    }
  };

  const handleDeleteSchool = (id: number) => {
    setSchoolToDelete(id);
  };

  

  return (
    <div className="admin-content">
      <h2 className="page-title">Kelola Sekolah</h2>
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="section-card-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
            <i className="ti ti-building"></i> Daftar Sekolah
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <i className="ti ti-search" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}></i>
              <input type="text" className="form-input" style={{ paddingLeft: '36px', height: '36px', margin: 0 }} placeholder="Cari nama sekolah..." value={schoolSearch} onChange={e => { setSchoolSearch(e.target.value); setCurrentPage(1); }} />
            </div>
            <ImportExportMenu type="schools" />
            <button className="btn btn-primary btn-sm" onClick={() => {
              setEditingSchool(null);
              setSchoolForm({ name: '', category_id: '' });
              setShowSchoolModal(true);
            }}>
              <i className="ti ti-plus"></i> Tambah Sekolah
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div className="table-responsive">
<table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No.</th>
                <th>Nama Sekolah</th>
                <th>Jenjang Pendidikan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "48px 32px", color: "var(--text-muted)" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                      <i className="ti ti-building" style={{ fontSize: "28px", color: "var(--primary)" }}></i>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>Belum Ada Data Sekolah</h3>
                    <p style={{ margin: 0, fontSize: "14px" }}>Silakan tambah data sekolah untuk memulai.</p>
                  </td>
                </tr>
              ) : displayedSchools.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <i className="ti ti-building" style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', color: 'var(--border)' }}></i>
                    Tidak ada sekolah yang sesuai
                  </td>
                </tr>
              ) : (
                displayedSchools.map((s: any, index: number) => (
                <tr key={s.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{categories.find((c: any) => c.id === s.category_id)?.name || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" title="Edit" onClick={() => {
                        setEditingSchool(s);
                        setSchoolForm({ name: s.name, category_id: s.category_id || '' });
                        setShowSchoolModal(true);
                      }}>
                        <i className="ti ti-edit" style={{ fontSize: '18px' }}></i>
                      </button>
                      <button className="btn btn-danger btn-sm" title="Hapus" onClick={() => handleDeleteSchool(s.id)}>
                        <i className="ti ti-trash" style={{ fontSize: '18px' }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
</div>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            <button className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}><i className="ti ti-chevron-left"></i></button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCurrentPage(p)}>{p}</button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}><i className="ti ti-chevron-right"></i></button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSchoolModal && (
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
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', marginBottom: '20px' }}>{editingSchool ? 'Edit Sekolah' : 'Tambah Sekolah'}</h2>
              <form onSubmit={handleSaveSchool}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Nama Sekolah</label>
                  <input type="text" className="form-input" required value={schoolForm.name} onChange={e => setSchoolForm({...schoolForm, name: e.target.value})} placeholder="Masukkan nama sekolah..." />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Jenjang Pendidikan</label>
                  <select className="form-input" required value={schoolForm.category_id} onChange={e => setSchoolForm({...schoolForm, category_id: e.target.value})}>
                    <option value="" disabled>Pilih Jenjang</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowSchoolModal(false); setEditingSchool(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary">{editingSchool ? 'Simpan Perubahan' : 'Tambah Sekolah'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
