import { getBaseUrl } from '../../lib/basePath';
import { toast } from '../../components/Toast';
import React, { useState, useRef, useEffect } from 'react';
import { ConfirmModal } from '../../components/ConfirmModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { fetchAuth } from '../../lib/fetchAuth';

const DEFAULT_QUESTION_TYPES = [
  { code: 'multiple_choice', name: 'Pilihan Ganda', description: 'Pilihan ganda biasa (satu jawaban benar)' },
  { code: 'multiple_select', name: 'Pilihan Ganda Kompleks', description: 'Pilihan ganda kompleks (lebih dari satu jawaban benar)' },
  { code: 'true_false', name: 'Benar / Salah', description: 'Pernyataan benar atau salah' },
  { code: 'short_answer', name: 'Isian Singkat', description: 'Jawaban teks / kata singkat' },
  { code: 'essay', name: 'Uraian / Essay', description: 'Pertanyaan uraian / jawaban terbuka' },
  { code: 'matching', name: 'Menjodohkan', description: 'Mencocokkan pasangan konsep' },
  { code: 'ordering', name: 'Mengurutkan', description: 'Mengurutkan tahapan atau proses' }
];

export default function ModulesAddEditView({ 
  editingModule, moduleForm, setModuleForm, setView, handleSaveModule, moduleGameFiles, setModuleGameFiles, isSaving, categories, subjects, moduleQuestions, setModuleQuestions
}: any) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [questionTypes, setQuestionTypes] = useState<any[]>(DEFAULT_QUESTION_TYPES);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState('');

  useEffect(() => {
    fetchAuth('/api/question_types')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setQuestionTypes(data);
      })
      .catch(() => {});
  }, []);

  const handleAddQuestion = (code: string) => {
     let newQ: any = { type: code, text: '', explanation: '' };
     if (code === 'multiple_choice') newQ = { ...newQ, options: ['', '', '', ''], correctAnswerIndex: 0 };
     else if (code === 'multiple_select') newQ = { ...newQ, options: ['', '', '', ''], correctAnswers: [] };
     else if (code === 'true_false') newQ = { ...newQ, correctAnswer: true };
     else if (code === 'short_answer') newQ = { ...newQ, correctAnswerText: '' };
     else if (code === 'essay') newQ = { ...newQ, explanation: 'Jawaban uraian akan dinilai berdasarkan kata kunci yang relevan oleh guru.' };
     else if (code === 'matching') newQ = { ...newQ, pairs: [{left: '', right: ''}, {left: '', right: ''}] };
     else if (code === 'ordering') newQ = { ...newQ, options: ['', '', ''] };
     
     setModuleQuestions([...(moduleQuestions || []), newQ]);
     setShowAddMenu(false);
  };


    const handleBannerUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Harap gunakan PNG, JPG, atau JPEG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }
    
    // Set local preview
    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);
    setIsUploadingBanner(true);
    
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetchAuth('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setModuleForm({...moduleForm, banner_url: data.url});
      } else {
        toast.error(data.error || 'Gagal mengupload gambar');
        setBannerPreview(''); // revert
      }
    } catch (err) {
      toast.error('Gagal mengupload gambar');
      setBannerPreview(''); // revert
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
          <div className="admin-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <ConfirmModal
        isOpen={questionToDelete !== null}
        title="Hapus Soal"
        message="Apakah Anda yakin ingin menghapus soal ini?"
        onConfirm={() => {
          if (questionToDelete !== null) {
            const nq = [...(moduleQuestions || [])];
            nq.splice(questionToDelete, 1);
            setModuleQuestions(nq);
            setQuestionToDelete(null);
          }
        }}
        onCancel={() => setQuestionToDelete(null)}
      />
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <button className="btn btn-ghost" onClick={() => setView('modules')}>
                <i className="ti ti-arrow-left"></i> Kembali
              </button>
              <h2 className="page-title" style={{ marginBottom: 0 }}>{editingModule ? 'Edit Modul' : 'Tambah Modul Baru'}</h2>
            </div>
            <div className="section-card">
              <form onSubmit={handleSaveModule}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Judul Modul</label>
                  <input type="text" className="form-input" required value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} placeholder="Contoh: Modul 3: Evaluasi" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Kategori (Jenjang)</label>
                    <select className="form-input" required value={moduleForm.category_id} onChange={e => {
                        const cat = categories.find((c: any) => c.id === parseInt(e.target.value));
                        setModuleForm({...moduleForm, category_id: parseInt(e.target.value), level: cat ? cat.name : moduleForm.level});
                      }}>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Mata Pelajaran</label>
                    <select className="form-input" required value={moduleForm.subject_id} onChange={e => setModuleForm({...moduleForm, subject_id: parseInt(e.target.value)})}>
                      {subjects.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Estimasi Waktu</label>
                    <input type="text" className="form-input" placeholder="Contoh: 45 Menit" required value={moduleForm.duration} onChange={e => setModuleForm({...moduleForm, duration: e.target.value})} />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Deskripsi Singkat</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '-4px 0 8px 0' }}>Penjelasan singkat materi, akan ditampilkan di kartu daftar modul di halaman utama siswa.</p>
                  <textarea className="form-input" required value={moduleForm.desc} onChange={e => setModuleForm({...moduleForm, desc: e.target.value})} placeholder="Deskripsi singkat modul..." rows={2}></textarea>
                </div>
                
                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <div style={{
                      width: '40px', 
                      height: '24px', 
                      borderRadius: '12px', 
                      background: moduleForm.is_restricted ? 'var(--primary)' : 'var(--border)', 
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        background: 'white', 
                        position: 'absolute', 
                        top: '2px', 
                        left: moduleForm.is_restricted ? '18px' : '2px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <input 
                      type="checkbox" 
                      style={{ display: 'none' }} 
                      checked={moduleForm.is_restricted || false} 
                      onChange={e => setModuleForm({...moduleForm, is_restricted: e.target.checked})} 
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Modul Terbatas (Gembok)</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Siswa Guest harus login dengan akun terdaftar untuk mengakses modul ini.</div>
                    </div>
                  </label>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Gambar Banner Modul (Opsional)</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '-4px 0 12px 0' }}>Banner akan ditampilkan di halaman daftar modul. Akan dikompres secara otomatis.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(moduleForm.banner_url || bannerPreview) ? (
                      <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-alt)' }}>
                        <img src={bannerPreview || ((moduleForm.banner_url || "").startsWith("/") ? `${getBaseUrl()}${(moduleForm.banner_url).substring(1)}` : moduleForm.banner_url)} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUploadingBanner ? 0.5 : 1, transition: 'opacity 0.2s' }} />
                        {isUploadingBanner && (
                           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                             <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                           </div>
                        )}
                        {!isUploadingBanner && (
                          <button type="button" className="btn btn-danger btn-sm" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onClick={() => { setModuleForm({...moduleForm, banner_url: ''}); setBannerPreview(''); }}>
                            <i className="ti ti-trash"></i> Hapus Banner
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', background: 'var(--bg-alt)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }} 
                           onClick={() => document.getElementById('banner-upload')?.click()}
                           onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                           onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-alt)'; }}
                           onDrop={async (e) => {
                             e.preventDefault();
                             e.currentTarget.style.borderColor = 'var(--border)';
                             e.currentTarget.style.background = 'var(--bg-alt)';
                             if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                               await handleBannerUpload(e.dataTransfer.files[0]);
                             }
                           }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                          <i className="ti ti-cloud-upload"></i>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>Klik atau Drag & Drop banner kesini</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>PNG, JPG, JPEG (Maks. 10MB)</p>
                      </div>
                    )}
                    <input id="banner-upload" type="file" accept="image/png, image/jpeg, image/jpg" style={{ display: 'none' }} onChange={async e => {
                      if (e.target.files && e.target.files.length > 0) {
                        await handleBannerUpload(e.target.files[0]);
                        e.target.value = ''; // Reset input
                      }
                    }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Tujuan Pembelajaran</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '-4px 0 8px 0' }}>Satu tujuan per baris.</p>
                  <textarea className="form-input" required value={moduleForm.objectives} onChange={e => setModuleForm({...moduleForm, objectives: e.target.value})} placeholder="Contoh: Memahami konsep ..." rows={3}></textarea>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Istilah Kunci</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '-4px 0 12px 0' }}>Tambahkan istilah dan definisi.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {moduleForm.keyTerms.map((item: { term: string; def: string }, index: number) => (
                      <div key={index} style={{ display: 'flex', gap: '12px' }}>
                        <input type="text" className="form-input" style={{ width: '30%', margin: 0 }} placeholder="Istilah" value={item.term} onChange={e => {
                          const newTerms = [...moduleForm.keyTerms];
                          newTerms[index].term = e.target.value;
                          setModuleForm({...moduleForm, keyTerms: newTerms});
                        }} required />
                        <input type="text" className="form-input" style={{ flex: 1, margin: 0 }} placeholder="Definisi" value={item.def} onChange={e => {
                          const newTerms = [...moduleForm.keyTerms];
                          newTerms[index].def = e.target.value;
                          setModuleForm({...moduleForm, keyTerms: newTerms});
                        }} required />
                        <button type="button" className="btn btn-danger" style={{ padding: '8px' }} onClick={() => {
                          const newTerms = [...moduleForm.keyTerms];
                          newTerms.splice(index, 1);
                          setModuleForm({...moduleForm, keyTerms: newTerms});
                        }}>
                          <i className="ti ti-x"></i>
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--primary)' }} onClick={() => setModuleForm({...moduleForm, keyTerms: [...moduleForm.keyTerms, { term: '', def: '' }]})}>
                      <i className="ti ti-plus"></i> Tambah Istilah Kunci
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: '40px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Materi Pembelajaran</label>
                  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                     <ReactQuill 
                       theme="snow" 
                       value={moduleForm.theory} 
                       onChange={val => setModuleForm({...moduleForm, theory: val})} 
                       style={{ marginBottom: '60px' }} 
                       modules={{
                         toolbar: [
                           [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                           ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                           [{ 'color': [] }, { 'background': [] }],
                           [{ 'script': 'sub'}, { 'script': 'super' }],
                           [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                           [{ 'align': [] }],
                           ['link', 'image', 'video'],
                           ['clean']
                         ],
                       }}
                     />
                  </div>
                </div>
                <div style={{ marginBottom: '24px', padding: '24px', background: 'var(--surface-2)', borderRadius: '12px', border: '2px dashed var(--border)' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}><i className="ti ti-file-zip"></i> Upload Game</label>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Upload file ZIP. Multiple file didukung.</p>
                  
                  <div style={{ position: 'relative', overflow: 'hidden', marginBottom: '16px' }}>
                    <input type="file" multiple accept=".zip" onChange={e => {
                      const files = Array.from(e.target.files || []) as File[];
                      setModuleGameFiles((prev: any[]) => [...prev, ...files.map(f => ({ file: f, title: f.name.replace('.zip', ''), desc: '' }))]);
                      e.target.value = '';
                    }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                    <div style={{ padding: '32px', textAlign: 'center', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-upload" style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '12px' }}></i>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>Klik atau seret file ZIP kesini</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Maksimal 100MB per file</div>
                    </div>
                  </div>

                  {moduleGameFiles.length > 0 && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       {moduleGameFiles.map((gf: any, i: number) => (
                         <div key={i} style={{ display: 'flex', gap: '16px', background: 'white', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, marginTop: '12px' }}>
                             {i + 1}
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}><i className="ti ti-file-zip" style={{ marginRight: '6px' }}></i>{gf.file ? gf.file.name : 'File Game Tersimpan'} {gf.file && gf.file.size ? `(${(gf.file.size / 1024 / 1024).toFixed(2)} MB)` : ''}</span>
                               <button type="button" className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => setModuleGameFiles((prev: any[]) => prev.filter((_: any, idx: number) => idx !== i))}>
                                 <i className="ti ti-trash"></i>
                               </button>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                               <input type="text" className="form-input" required placeholder="Judul Game..." value={gf.title} onChange={e => {
                                 const updated = [...moduleGameFiles];
                                 updated[i].title = e.target.value;
                                 setModuleGameFiles(updated);
                               }} style={{ margin: 0, fontWeight: 700, fontSize: '15px' }} />
                               <input type="text" className="form-input" required placeholder="Deskripsi Singkat / Objektif Misi..." value={gf.desc} onChange={e => {
                                 const updated = [...moduleGameFiles];
                                 updated[i].desc = e.target.value;
                                 setModuleGameFiles(updated);
                               }} style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }} />
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '40px', padding: '24px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}><i className="ti ti-notes"></i> Soal Evaluasi</label>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Tambahkan soal-soal evaluasi dengan berbagai tipe (Pilihan Ganda, PG Kompleks, Benar/Salah, Isian Singkat, Uraian, Menjodohkan, Mengurutkan).</p>
                  
                  {moduleQuestions && moduleQuestions.map((q: any, qIndex: number) => {
                     const currentType = q.type || 'multiple_choice';
                     const currentTypeObj = questionTypes.find(t => t.code === currentType);
                     const typeLabel = currentTypeObj ? currentTypeObj.name : (
                        currentType === 'multiple_select' ? 'Pilihan Ganda Kompleks' :
                        currentType === 'true_false' ? 'Benar / Salah' :
                        currentType === 'short_answer' ? 'Isian Singkat' :
                        currentType === 'essay' ? 'Uraian / Essay' :
                        currentType === 'matching' ? 'Menjodohkan' :
                        currentType === 'ordering' ? 'Mengurutkan' : 'Pilihan Ganda'
                     );
                     
                     return (
                      <div key={qIndex} style={{ background: 'white', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span style={{ fontWeight: 600, fontSize: '14px' }}>Soal #{qIndex + 1}</span>
                             <span style={{ 
                               fontSize: '11px', 
                               fontWeight: 600, 
                               padding: '2px 8px', 
                               borderRadius: '6px', 
                               background: 'var(--primary-light, #e0f2fe)', 
                               color: 'var(--primary, #0284c7)' 
                             }}>
                               {typeLabel}
                             </span>
                           </div>
                           <button type="button" className="btn btn-danger btn-sm" onClick={() => setQuestionToDelete(qIndex)}>
                             <i className="ti ti-trash"></i> Hapus
                           </button>
                         </div>
                         <input type="text" className="form-input" placeholder="Tuliskan pertanyaan / instruksi soal..." required value={q.text || ''} onChange={e => {
                            const nq = [...moduleQuestions];
                            nq[qIndex].text = e.target.value;
                            setModuleQuestions(nq);
                         }} />
                         <div style={{ marginTop: '12px' }}>
                           {(!q.type || q.type === 'multiple_choice') && (
                             <>
                               <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>Pilihan Jawaban (Pilihan Ganda - pilih 1 radio yang benar):</label>
                               {(q.options || []).map((opt: string, oIndex: number) => (
                                  <div key={oIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                    <input type="radio" name={`correct_${qIndex}`} checked={q.correctAnswerIndex === oIndex} onChange={() => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].correctAnswerIndex = oIndex;
                                       setModuleQuestions(nq);
                                    }} />
                                    <input type="text" className="form-input" style={{ margin: 0 }} placeholder={`Pilihan ${oIndex + 1}`} required value={opt} onChange={e => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].options[oIndex] = e.target.value;
                                       setModuleQuestions(nq);
                                    }} />
                                    {(q.options || []).length > 2 && (
                                      <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                        const nq = [...moduleQuestions];
                                        nq[qIndex].options.splice(oIndex, 1);
                                        if (nq[qIndex].correctAnswerIndex >= nq[qIndex].options.length) {
                                          nq[qIndex].correctAnswerIndex = 0;
                                        }
                                        setModuleQuestions(nq);
                                      }}><i className="ti ti-x"></i></button>
                                    )}
                                  </div>
                               ))}
                               <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                                   const nq = [...moduleQuestions];
                                   if (!nq[qIndex].options) nq[qIndex].options = [];
                                   nq[qIndex].options.push('');
                                   setModuleQuestions(nq);
                               }}><i className="ti ti-plus"></i> Tambah Pilihan</button>
                             </>
                           )}
                           {q.type === 'true_false' && (
                             <>
                               <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>Kunci Jawaban (Benar/Salah):</label>
                               <div style={{ display: 'flex', gap: '16px', padding: '8px 0' }}>
                                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                   <input type="radio" name={`tf_${qIndex}`} checked={q.correctAnswer === true} onChange={() => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].correctAnswer = true;
                                       setModuleQuestions(nq);
                                   }} /> <strong>Benar</strong>
                                 </label>
                                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                   <input type="radio" name={`tf_${qIndex}`} checked={q.correctAnswer === false} onChange={() => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].correctAnswer = false;
                                       setModuleQuestions(nq);
                                   }} /> <strong>Salah</strong>
                                 </label>
                               </div>
                             </>
                           )}
                           {q.type === 'short_answer' && (
                             <>
                               <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>Kunci Jawaban Singkat:</label>
                               <input type="text" className="form-input" required placeholder="Contoh: Fotosintesis" value={q.correctAnswerText || ''} onChange={e => {
                                   const nq = [...moduleQuestions];
                                   nq[qIndex].correctAnswerText = e.target.value;
                                   setModuleQuestions(nq);
                               }} />
                             </>
                           )}
                           {q.type === 'multiple_select' && (
                             <>
                               <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>Pilihan Jawaban (Pilihan Ganda Kompleks):</label>
                               <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Centang semua kotak jawaban yang benar (bisa lebih dari satu).</p>
                               {(q.options || []).map((opt: string, oIndex: number) => (
                                  <div key={oIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                    <input type="checkbox" checked={q.correctAnswers?.includes(oIndex)} onChange={(e) => {
                                       const nq = [...moduleQuestions];
                                       if (!nq[qIndex].correctAnswers) nq[qIndex].correctAnswers = [];
                                       if (e.target.checked) {
                                         nq[qIndex].correctAnswers.push(oIndex);
                                       } else {
                                         nq[qIndex].correctAnswers = nq[qIndex].correctAnswers.filter((id: number) => id !== oIndex);
                                       }
                                       setModuleQuestions(nq);
                                    }} />
                                    <input type="text" className="form-input" style={{ margin: 0 }} placeholder={`Pilihan ${oIndex + 1}`} required value={opt} onChange={e => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].options[oIndex] = e.target.value;
                                       setModuleQuestions(nq);
                                    }} />
                                    {(q.options || []).length > 2 && (
                                      <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                        const nq = [...moduleQuestions];
                                        nq[qIndex].options.splice(oIndex, 1);
                                        nq[qIndex].correctAnswers = (nq[qIndex].correctAnswers || []).filter((id: number) => id !== oIndex).map((id: number) => id > oIndex ? id - 1 : id);
                                        setModuleQuestions(nq);
                                      }}><i className="ti ti-x"></i></button>
                                    )}
                                  </div>
                               ))}
                               <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                                   const nq = [...moduleQuestions];
                                   if (!nq[qIndex].options) nq[qIndex].options = [];
                                   nq[qIndex].options.push('');
                                   setModuleQuestions(nq);
                               }}><i className="ti ti-plus"></i> Tambah Pilihan</button>
                             </>
                           )}
                           {q.type === 'essay' && (
                             <>
                               <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>Kriteria Penilaian Uraian / Essay:</label>
                               <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Soal uraian memungkinkan siswa mengetikkan penjelasan lengkap. Masukkan rubrik atau kriteria di kolom Penjelasan di bawah sebagai panduan koreksi guru.</p>
                             </>
                           )}
                           {q.type === 'matching' && (
                             <>
                               <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>Pasangan (Menjodohkan):</label>
                               <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Tuliskan pasangan yang benar di kiri dan kanan. Sistem akan mengacak urutannya untuk siswa.</p>
                               {(q.pairs || []).map((pair: any, pIndex: number) => (
                                 <div key={pIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                   <input type="text" className="form-input" style={{ margin: 0 }} placeholder="Item Sisi Kiri" required value={pair.left || ''} onChange={e => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].pairs[pIndex].left = e.target.value;
                                       setModuleQuestions(nq);
                                   }} />
                                   <span style={{ color: 'var(--text-muted)' }}><i className="ti ti-arrows-right-left"></i></span>
                                   <input type="text" className="form-input" style={{ margin: 0 }} placeholder="Pasangan Sisi Kanan (Benar)" required value={pair.right || ''} onChange={e => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].pairs[pIndex].right = e.target.value;
                                       setModuleQuestions(nq);
                                   }} />
                                   {(q.pairs || []).length > 2 && (
                                     <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                         const nq = [...moduleQuestions];
                                         nq[qIndex].pairs.splice(pIndex, 1);
                                         setModuleQuestions(nq);
                                     }}><i className="ti ti-x"></i></button>
                                   )}
                                 </div>
                               ))}
                               <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                                   const nq = [...moduleQuestions];
                                   if (!nq[qIndex].pairs) nq[qIndex].pairs = [];
                                   nq[qIndex].pairs.push({left: '', right: ''});
                                   setModuleQuestions(nq);
                               }}><i className="ti ti-plus"></i> Tambah Pasangan</button>
                             </>
                           )}
                           {q.type === 'ordering' && (
                             <>
                               <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>Urutan Benar (Mengurutkan):</label>
                               <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Tuliskan item dalam urutan yang BENAR dari atas ke bawah. Sistem akan mengacaknya untuk siswa saat dikerjakan.</p>
                               {(q.options || []).map((opt: string, oIndex: number) => (
                                 <div key={oIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                   <span style={{ fontWeight: 600, width: '24px' }}>{oIndex + 1}.</span>
                                   <input type="text" className="form-input" style={{ margin: 0 }} placeholder={`Item urutan ke-${oIndex + 1}`} required value={opt} onChange={e => {
                                       const nq = [...moduleQuestions];
                                       nq[qIndex].options[oIndex] = e.target.value;
                                       setModuleQuestions(nq);
                                   }} />
                                   {(q.options || []).length > 2 && (
                                     <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                         const nq = [...moduleQuestions];
                                         nq[qIndex].options.splice(oIndex, 1);
                                         setModuleQuestions(nq);
                                     }}><i className="ti ti-x"></i></button>
                                   )}
                                 </div>
                               ))}
                               <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                                   const nq = [...moduleQuestions];
                                   if (!nq[qIndex].options) nq[qIndex].options = [];
                                   nq[qIndex].options.push('');
                                   setModuleQuestions(nq);
                               }}><i className="ti ti-plus"></i> Tambah Item</button>
                             </>
                           )}
                         </div>
                         <div style={{ marginTop: '12px' }}>
                           <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>Penjelasan Kunci Jawaban / Pembahasan:</label>
                           <textarea className="form-input" placeholder="Penjelasan kenapa jawaban tersebut benar..." value={q.explanation || ''} onChange={e => {
                              const nq = [...moduleQuestions];
                              nq[qIndex].explanation = e.target.value;
                              setModuleQuestions(nq);
                           }}></textarea>
                         </div>
                      </div>
                     );
                  })}
                  
                  {!showAddMenu ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddMenu(true)}>
                      <i className="ti ti-plus"></i> Tambah Soal
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                       <span style={{ width: '100%', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Pilih Tipe Soal:</span>
                       
                       {questionTypes.map(qt => (
                         <button key={qt.code} type="button" className="btn btn-primary btn-sm" title={qt.description} onClick={() => handleAddQuestion(qt.code)}>{qt.name}</button>
                       ))}
                       {questionTypes.length === 0 && (
                         <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Memuat tipe soal...</div>
                       )}

                       <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddMenu(false)}>Batal</button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setView('modules')} disabled={isSaving}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'Menyimpan...' : (editingModule ? 'Simpan Perubahan' : 'Tambah Modul')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
}
