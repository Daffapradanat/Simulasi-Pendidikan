import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function ModulesAddEditView({ 
  editingModule, moduleForm, setModuleForm, setView, handleSaveModule, moduleGameFiles, setModuleGameFiles, isSaving, categories, subjects, moduleQuestions, setModuleQuestions
}: any) {
  return (
          <div className="admin-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                  <textarea className="form-input" required value={moduleForm.desc} onChange={e => setModuleForm({...moduleForm, desc: e.target.value})} placeholder="Deskripsi singkat modul..." rows={2}></textarea>
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
                    {moduleForm.keyTerms.map((item, index) => (
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
                      setModuleGameFiles(prev => [...prev, ...files.map(f => ({ file: f, title: f.name.replace('.zip', ''), desc: '' }))]);
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
                       {moduleGameFiles.map((gf, i) => (
                         <div key={i} style={{ display: 'flex', gap: '16px', background: 'white', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, marginTop: '12px' }}>
                             {i + 1}
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}><i className="ti ti-file-zip" style={{ marginRight: '6px' }}></i>{gf.file ? gf.file.name : 'File Game Tersimpan'} {gf.file && gf.file.size ? `(${(gf.file.size / 1024 / 1024).toFixed(2)} MB)` : ''}</span>
                               <button type="button" className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => setModuleGameFiles(prev => prev.filter((_, idx) => idx !== i))}>
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
                  <label style={{ display: 'block', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}><i className="ti ti-notes"></i> Soal</label>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Tambahkan soal-soal pilihan ganda yang akan dikerjakan siswa setelah menyelesaikan semua simulasi di modul ini.</p>
                  
                  {moduleQuestions && moduleQuestions.map((q: any, qIndex: number) => (
                     <div key={qIndex} style={{ background: 'white', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 600 }}>Soal #{qIndex + 1}</span>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                             const nq = [...moduleQuestions];
                             nq.splice(qIndex, 1);
                             setModuleQuestions(nq);
                          }}><i className="ti ti-trash"></i></button>
                        </div>
                        <input type="text" className="form-input" placeholder="Pertanyaan..." required value={q.text} onChange={e => {
                           const nq = [...moduleQuestions];
                           nq[qIndex].text = e.target.value;
                           setModuleQuestions(nq);
                        }} />
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>Pilihan Jawaban:</label>
                          {q.options.map((opt: string, oIndex: number) => (
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
                             </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>Penjelasan Jawaban:</label>
                          <textarea className="form-input" placeholder="Penjelasan kenapa jawaban tersebut benar..." value={q.explanation || ''} onChange={e => {
                             const nq = [...moduleQuestions];
                             nq[qIndex].explanation = e.target.value;
                             setModuleQuestions(nq);
                          }}></textarea>
                        </div>
                     </div>
                  ))}
                  
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                     setModuleQuestions([...(moduleQuestions || []), { text: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }]);
                  }}>
                    <i className="ti ti-plus"></i> Tambah Soal
                  </button>
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
