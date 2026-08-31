import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Module, User } from '../../types';

export function QuestionsView({ 
  questions = [], 
  module,
  user,
  onComplete,
  allPlayed = true
}: { 
  questions: any[];
  module?: Module;
  user?: User | null;
  onComplete: (reflection: string) => void;
  allPlayed?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [shuffledRights, setShuffledRights] = useState<Record<number, string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  useEffect(() => {
    const rights: Record<number, string[]> = {};
    const initialAns: Record<number, any> = {};
    questions.forEach((q, i) => {
      if (q.type === 'matching') {
        rights[i] = [...(q.pairs || [])].map((p: any) => p.right).sort(() => Math.random() - 0.5);
        initialAns[i] = {};
      } else if (q.type === 'ordering') {
        initialAns[i] = [...(q.options || [])].sort(() => Math.random() - 0.5);
      }
    });
    setShuffledRights(rights);
    setAnswers(initialAns);
    setIsSubmitted(false);
  }, [questions]);

  const handleSelect = (qIndex: number, answer: any) => {
    if (isSubmitted) return; // Kunci input jika sudah submit
    const q = questions[qIndex];
    if (q.type === 'multiple_select') {
      const currentAnswers = answers[qIndex] || [];
      if (currentAnswers.includes(answer)) {
        setAnswers({ ...answers, [qIndex]: currentAnswers.filter((a: any) => a !== answer) });
      } else {
        setAnswers({ ...answers, [qIndex]: [...currentAnswers, answer] });
      }
    } else {
      setAnswers({ ...answers, [qIndex]: answer });
    }
  };

  const handleRetry = () => {
    const initialAns: Record<number, any> = {};
    questions.forEach((q, i) => {
      if (q.type === 'matching') {
        initialAns[i] = {};
      } else if (q.type === 'ordering') {
        initialAns[i] = [...(q.options || [])].sort(() => Math.random() - 0.5);
      }
    });
    setAnswers(initialAns);
    setIsSubmitted(false);
    setConfirmSubmitOpen(false);
  };

  const checkIsCorrect = (q: any, ans: any) => {
    if (ans === undefined || ans === null) return false;
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') return ans === q.correctAnswerIndex;
    if (type === 'true_false') return ans === q.correctAnswer;
    if (type === 'short_answer') return String(ans).toLowerCase().trim() === String(q.correctAnswerText || '').toLowerCase().trim();
    if (type === 'essay') return typeof ans === 'string' && ans.trim().length > 0;
    if (type === 'multiple_select') {
      if (!Array.isArray(ans)) return false;
      const correct = q.correctAnswers || [];
      if (ans.length !== correct.length) return false;
      return correct.every((c: any) => ans.includes(c));
    }
    if (type === 'ordering') {
      if (!Array.isArray(ans)) return false;
      const correct = q.options || [];
      if (ans.length !== correct.length) return false;
      return correct.every((c: any, i: number) => c === ans[i]);
    }
    if (type === 'matching') {
      if (typeof ans !== 'object') return false;
      const pairs = q.pairs || [];
      for (const p of pairs) {
        if (ans[p.left] !== p.right) return false;
      }
      return true;
    }
    return false;
  };

  const isQuestionAnswered = (qIndex: number) => {
    const q = questions[qIndex];
    if (!q) return false;
    const ans = answers[qIndex];
    if (ans === undefined || ans === null) return false;
    const type = q.type || 'multiple_choice';
    if (type === 'short_answer' || type === 'essay') return typeof ans === 'string' && ans.trim().length > 0;
    if (type === 'multiple_select') return Array.isArray(ans) && ans.length > 0;
    if (type === 'matching') {
      const pairs = q.pairs || [];
      if (pairs.length === 0) return false;
      return typeof ans === 'object' && pairs.every((p: any) => Boolean(ans[p.left]));
    }
    if (type === 'ordering') return Array.isArray(ans) && ans.length > 0;
    return ans !== undefined && ans !== null;
  };

  const answeredCount = questions.filter((_, i) => isQuestionAnswered(i)).length;
  const correctCount = questions.filter((q, i) => checkIsCorrect(q, answers[i])).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;

  const getCorrectAnswerLabel = (q: any) => {
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') return q.options?.[q.correctAnswerIndex] || '-';
    if (type === 'true_false') return q.correctAnswer ? 'Benar' : 'Salah';
    if (type === 'short_answer') return q.correctAnswerText || '-';
    if (type === 'essay') return '(Sesuai dengan konsep materi sains yang telah dipelajari)';
    if (type === 'multiple_select') return (q.correctAnswers || []).map((i: number) => q.options?.[i]).join(', ');
    if (type === 'ordering') return (q.options || []).join(' → ');
    if (type === 'matching') return (q.pairs || []).map((p: any) => `${p.left} ➔ ${p.right}`).join('; ');
    return '-';
  };

  const getUserAnswerLabel = (q: any, ans: any) => {
    if (ans === undefined || ans === null || ans === '') return '(Tidak dijawab)';
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') return q.options?.[ans] || '-';
    if (type === 'true_false') return ans ? 'Benar' : 'Salah';
    if (type === 'short_answer') return String(ans);
    if (type === 'essay') return String(ans);
    if (type === 'multiple_select') {
      if (!Array.isArray(ans) || ans.length === 0) return '(Tidak dijawab)';
      return ans.map((i: number) => q.options?.[i]).join(', ');
    }
    if (type === 'ordering') return Array.isArray(ans) ? ans.join(' → ') : '-';
    if (type === 'matching') {
      if (typeof ans !== 'object') return '-';
      const items = Object.entries(ans).map(([k, v]) => `${k} ➔ ${v}`);
      return items.length > 0 ? items.join('; ') : '(Tidak dijawab)';
    }
    return String(ans);
  };

  const handlePrint = () => {
    window.print();
  };

  const studentName = user?.name || 'Siswa';
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // --- JIKA TIDAK ADA SOAL DI MODUL (HANYA REFLEKSI) ---
  if (!questions || questions.length === 0) {
    return (
      <div className="questions-container">
        <div style={{ padding: '24px', background: 'var(--white)', borderRadius: '14px', border: '1.5px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>
              <i className="ti ti-notes"></i>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>
              Refleksi Pembelajaran
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              Modul ini berbasis eksperimen interaktif. Tuliskan pemahaman yang Anda dapatkan setelah mencoba simulasi ini.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
              Catatan Refleksi Mandiri:
            </label>
            <textarea 
              className="form-input" 
              rows={4} 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Contoh: Dari simulasi ini saya memahami bagaimana variabel massa memengaruhi gravitasi..."
              style={{ width: '100%', resize: 'vertical', borderRadius: '10px', padding: '14px', fontSize: '14px', lineHeight: '1.5', minHeight: '100px' }}
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={() => onComplete(reflection)} 
            disabled={!reflection.trim()}
            style={{ width: '100%', justifyContent: 'center', height: '44px', fontWeight: 700, fontSize: '14px' }}
          >
            <i className="ti ti-circle-check"></i> Selesaikan Modul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-view-container">
      {/* ── MODE 1: LEMBAR PENGERJAAN SOAL (SEMUA SOAL TERLEBIH DAHULU) ── */}
      {!isSubmitted ? (
        <div>
          {/* Header Status Pengerjaan */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1d4ed8 0%, #0d47a1 100%)', 
            color: 'white', 
            padding: '16px 20px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(13, 71, 161, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-edit" style={{ fontSize: '18px' }}></i>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>Lembar Soal Evaluasi</span>
              </div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
                {answeredCount} dari {questions.length} Dijawab
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
              Kerjakan semua pertanyaan di bawah ini secara teliti. Setelah selesai, klik tombol <strong>Kirim & Periksa Jawaban</strong> untuk melihat skor dan pembenaran.
            </p>
          </div>

          {/* Daftar Semua Butir Soal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {questions.map((q, idx) => {
              const qType = q.type || 'multiple_choice';
              const isAnswered = isQuestionAnswered(idx);

              return (
                <div 
                  key={idx} 
                  id={`question-item-${idx}`}
                  style={{ 
                    background: 'var(--white)', 
                    border: `1.5px solid ${isAnswered ? 'var(--border-dark)' : 'var(--border)'}`, 
                    borderRadius: '14px', 
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '8px', 
                        background: isAnswered ? 'var(--primary)' : 'var(--surface-2)', 
                        color: isAnswered ? 'white' : 'var(--text-muted)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700, 
                        fontSize: '13px' 
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {qType === 'multiple_choice' ? 'Pilihan Ganda' :
                         qType === 'multiple_select' ? 'Pilihan Ganda Kompleks' :
                         qType === 'true_false' ? 'Benar / Salah' :
                         qType === 'short_answer' ? 'Isian Singkat' :
                         qType === 'essay' ? 'Uraian' :
                         qType === 'matching' ? 'Menjodohkan' : 'Mengurutkan'}
                      </span>
                    </div>

                    {isAnswered ? (
                      <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="ti ti-circle-check"></i> Terjawab
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>
                        Belum dijawab
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {q.text}
                  </h4>

                  {qType === 'multiple_select' && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                      *Pilih semua opsi yang benar (bisa lebih dari satu).
                    </p>
                  )}
                  {qType === 'matching' && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                      *Pilih pasangan yang sesuai untuk setiap item di sebelah kiri.
                    </p>
                  )}
                  {qType === 'ordering' && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                      *Gunakan tombol panah untuk menyusun urutan dari awal hingga akhir.
                    </p>
                  )}

                  {/* Opsi Pilihan Ganda */}
                  {qType === 'multiple_choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isSelected = answers[idx] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelect(idx, optIdx)}
                            style={{
                              padding: '12px 14px',
                              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(13, 71, 161, 0.06)' : 'var(--white)',
                              color: isSelected ? 'var(--primary)' : 'var(--text)',
                              fontWeight: isSelected ? 600 : 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '13.5px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ 
                                width: '22px', 
                                height: '22px', 
                                borderRadius: '50%', 
                                border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-dark)'}`, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '11px', 
                                fontWeight: 700,
                                background: isSelected ? 'var(--primary)' : 'transparent',
                                color: isSelected ? 'white' : 'var(--text-muted)'
                              }}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isSelected && <i className="ti ti-check" style={{ color: 'var(--primary)', fontSize: '16px' }}></i>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pilihan Ganda Kompleks */}
                  {qType === 'multiple_select' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isSelected = (answers[idx] || []).includes(optIdx);
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelect(idx, optIdx)}
                            style={{
                              padding: '12px 14px',
                              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(13, 71, 161, 0.06)' : 'var(--white)',
                              color: isSelected ? 'var(--primary)' : 'var(--text)',
                              fontWeight: isSelected ? 600 : 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '13.5px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <i className={`ti ${isSelected ? 'ti-square-check-filled' : 'ti-square'}`} style={{ color: isSelected ? 'var(--primary)' : 'var(--border-dark)', fontSize: '18px' }}></i>
                              <span>{opt}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Benar / Salah */}
                  {qType === 'true_false' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[true, false].map((val, bIdx) => {
                        const isSelected = answers[idx] === val;
                        return (
                          <div
                            key={bIdx}
                            onClick={() => handleSelect(idx, val)}
                            style={{
                              padding: '12px',
                              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(13, 71, 161, 0.06)' : 'var(--white)',
                              color: isSelected ? 'var(--primary)' : 'var(--text)',
                              fontWeight: isSelected ? 700 : 500,
                              textAlign: 'center',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <i className={`ti ${val ? 'ti-check' : 'ti-x'}`} style={{ color: isSelected ? 'var(--primary)' : 'inherit' }}></i>
                            {val ? 'Benar' : 'Salah'}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Isian Singkat & Essay */}
                  {(qType === 'short_answer' || qType === 'essay') && (
                    <div>
                      {qType === 'essay' ? (
                        <textarea 
                          className="form-input" 
                          placeholder="Tuliskan uraian jawaban Anda di sini..." 
                          value={answers[idx] || ''} 
                          onChange={e => handleSelect(idx, e.target.value)} 
                          style={{ width: '100%', padding: '12px', minHeight: '90px', resize: 'vertical', fontSize: '13.5px' }}
                        />
                      ) : (
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ketik jawaban singkat Anda..." 
                          value={answers[idx] || ''} 
                          onChange={e => handleSelect(idx, e.target.value)} 
                          style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px' }}
                        />
                      )}
                    </div>
                  )}

                  {/* Menjodohkan */}
                  {qType === 'matching' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.pairs?.map((pair: any, pIdx: number) => {
                        const currentVal = (answers[idx] || {})[pair.left] || '';
                        return (
                          <div key={pIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--surface-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{pair.left}</span>
                            <select 
                              className="form-input" 
                              style={{ width: '100%', padding: '8px 12px', fontSize: '13px', margin: 0 }}
                              value={currentVal}
                              onChange={e => {
                                const newAns = { ...(answers[idx] || {}) };
                                newAns[pair.left] = e.target.value;
                                handleSelect(idx, newAns);
                              }}
                            >
                              <option value="" disabled>-- Pilih Pasangan Jawaban --</option>
                              {(shuffledRights[idx] || []).map((r: string, rIdx: number) => (
                                <option key={rIdx} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Mengurutkan */}
                  {qType === 'ordering' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(answers[idx] || []).map((item: string, oIdx: number) => (
                        <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button 
                              type="button"
                              disabled={oIdx === 0} 
                              onClick={() => {
                                const newArr = [...answers[idx]];
                                [newArr[oIdx - 1], newArr[oIdx]] = [newArr[oIdx], newArr[oIdx - 1]];
                                handleSelect(idx, newArr);
                              }} 
                              style={{ cursor: oIdx === 0 ? 'not-allowed' : 'pointer', opacity: oIdx === 0 ? 0.3 : 1, padding: 0, color: 'var(--primary)' }}
                            >
                              <i className="ti ti-chevron-up"></i>
                            </button>
                            <button 
                              type="button"
                              disabled={oIdx === answers[idx].length - 1} 
                              onClick={() => {
                                const newArr = [...answers[idx]];
                                [newArr[oIdx + 1], newArr[oIdx]] = [newArr[oIdx], newArr[oIdx + 1]];
                                handleSelect(idx, newArr);
                              }} 
                              style={{ cursor: oIdx === answers[idx].length - 1 ? 'not-allowed' : 'pointer', opacity: oIdx === answers[idx].length - 1 ? 0.3 : 1, padding: 0, color: 'var(--primary)' }}
                            >
                              <i className="ti ti-chevron-down"></i>
                            </button>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)', width: '20px' }}>{oIdx + 1}.</span>
                          <span style={{ flex: 1, fontSize: '13.5px' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tombol Submit Semua Jawaban */}
          <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
            {answeredCount < questions.length && (
              <p style={{ fontSize: '13px', color: '#b45309', marginBottom: '12px', fontWeight: 500 }}>
                <i className="ti ti-alert-circle"></i> Anda telah menjawab {answeredCount} dari {questions.length} soal. Pastikan semua soal terjawab sebelum mengumpulkan.
              </p>
            )}

            <button 
              className="btn btn-primary"
              onClick={() => {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ width: '100%', height: '48px', justifyContent: 'center', fontSize: '15px', fontWeight: 700 }}
            >
              <i className="ti ti-send"></i> Kirim & Periksa Jawaban
            </button>
          </div>
        </div>
      ) : (
        /* ── MODE 2: HASIL EVALUASI, SKOR, & PEMBAHASAN LENGKAP ── */
        <div>
          {/* Banner Skor & Status */}
          <div style={{ 
            background: 'var(--white)', 
            border: '1.5px solid var(--border)', 
            borderRadius: '16px', 
            padding: '24px 20px', 
            textAlign: 'center',
            marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(13, 71, 161, 0.06)'
          }}>
            <span className="badge" style={{ 
              background: score >= 70 ? 'var(--success-light)' : 'var(--warning-light)', 
              color: score >= 70 ? 'var(--success)' : 'var(--warning)',
              border: 'none',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              {score >= 70 ? 'KOMPETENSI TUNTAS' : 'PERLU PERBAIKAN & PENGAYAAN'}
            </span>

            <div style={{ 
              width: '96px', 
              height: '96px', 
              borderRadius: '50%', 
              background: score >= 70 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
              color: '#ffffff', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nilai</span>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
              {score >= 70 ? 'Selamat! Anda Berhasil Menyelesaikan Evaluasi' : 'Tetap Semangat! Pelajari Kembali Materi'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 18px 0' }}>
              Berhasil menjawab benar <strong style={{ color: 'var(--primary)' }}>{correctCount}</strong> dari <strong>{questions.length}</strong> soal evaluasi.
            </p>

            {/* Action Buttons: Print PDF & Ulangi */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-outline"
                onClick={handlePrint}
                style={{ 
                  background: 'var(--surface-2)', 
                  border: '1.5px solid var(--border-dark)', 
                  color: 'var(--text)', 
                  fontWeight: 600, 
                  fontSize: '13px', 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="ti ti-printer" style={{ fontSize: '16px', color: 'var(--primary)' }}></i> Cetak Hasil / Unduh PDF (A4)
              </button>

              <button 
                className="btn btn-ghost"
                onClick={handleRetry}
                style={{ 
                  border: '1.5px solid var(--primary)', 
                  color: 'var(--primary)', 
                  fontWeight: 600, 
                  fontSize: '13px', 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="ti ti-rotate-clockwise" style={{ fontSize: '16px' }}></i> Ulangi Evaluasi
              </button>
            </div>
          </div>

          {/* Pembahasan & Pembenaran Soal */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <i className="ti ti-file-check" style={{ color: 'var(--primary)', fontSize: '20px' }}></i>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-display)' }}>
                Pembahasan & Pembenaran Soal
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, i) => {
                const ans = answers[i];
                const isCorrect = checkIsCorrect(q, ans);
                return (
                  <div key={i} style={{ 
                    border: `1.5px solid ${isCorrect ? 'var(--success)' : 'var(--accent)'}`, 
                    borderRadius: '12px', 
                    padding: '16px',
                    background: isCorrect ? 'rgba(46, 125, 50, 0.04)' : 'rgba(229, 57, 53, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ 
                        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isCorrect ? 'var(--success)' : 'var(--accent)', color: 'white',
                        fontSize: '13px', fontWeight: 700
                      }}>
                        {i + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>
                          {q.text}
                        </p>
                        
                        <div style={{ fontSize: '13px', marginBottom: '6px', lineHeight: 1.4 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Jawaban Anda: </span>
                          <strong style={{ color: isCorrect ? 'var(--success)' : 'var(--accent)' }}>
                            {getUserAnswerLabel(q, ans)} {isCorrect ? '✓ (Benar)' : '✗ (Salah)'}
                          </strong>
                        </div>

                        {!isCorrect && (
                          <div style={{ fontSize: '13px', marginBottom: '6px', lineHeight: 1.4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Kunci Jawaban Benar: </span>
                            <strong style={{ color: 'var(--success)' }}>
                              {getCorrectAnswerLabel(q)}
                            </strong>
                          </div>
                        )}

                        {q.explanation && (
                          <div style={{ 
                            marginTop: '10px', 
                            padding: '10px 12px', 
                            background: 'var(--white)', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border)',
                            fontSize: '12.5px', 
                            color: 'var(--text)',
                            lineHeight: 1.5
                          }}>
                            <strong style={{ color: 'var(--primary)' }}><i className="ti ti-bulb"></i> Pembenaran & Penjelasan:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Refleksi Pembelajaran */}
          <div style={{ 
            background: 'var(--surface)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-notebook" style={{ color: 'var(--primary)' }}></i> Refleksi Pembelajaran Siswa
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginBottom: '12px', lineHeight: 1.4 }}>
              Tuliskan pemahaman penting yang Anda dapatkan dari modul ini untuk melengkapi catatan pembelajaran Anda.
            </p>
            <textarea 
              className="form-input" 
              rows={3} 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Tulis refleksi pemahaman materi di sini..."
              style={{ 
                width: '100%', 
                resize: 'vertical', 
                background: 'white', 
                borderRadius: '8px', 
                border: '1.5px solid var(--border)', 
                padding: '10px 12px', 
                fontSize: '13.5px', 
                minHeight: '80px'
              }}
            />
          </div>

          {/* Tombol Simpan & Selesaikan Modul */}
          <button 
            className="btn btn-primary" 
            onClick={() => onComplete(reflection)} 
            style={{ width: '100%', justifyContent: 'center', height: '48px', fontWeight: 700, fontSize: '15px' }}
          >
            <i className="ti ti-circle-check"></i> Simpan & Selesaikan Modul
          </button>
        </div>
      )}

      {/* ── PRINT SHEET KHUSUS KERTAS A4 DENGAN KOP KEMENDIKDASMEN ── */}
      <div id="printable-sheet" style={{ display: 'none' }}>
        {/* KOP Resmi Kemendikdasmen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '12px', borderBottom: '3px double #000000', marginBottom: '16px' }}>
          <img 
            src="/tutwurihandayani_Icon.png" 
            alt="Logo Kemendikdasmen" 
            style={{ width: '75px', height: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={{ fontSize: '15pt', fontWeight: 900, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
            </h2>
            <h3 style={{ fontSize: '12pt', fontWeight: 700, margin: '0 0 2px 0', textTransform: 'uppercase' }}>
              DIREKTORAT JENDERAL PENDIDIKAN DASAR DAN MENENGAH
            </h3>
            <p style={{ fontSize: '9pt', margin: 0, fontStyle: 'italic', color: '#333' }}>
              Platform Digital Literasi & Laboratorium Simulasi Sains Interaktif
            </p>
          </div>
        </div>

        {/* Judul Lembar Hasil */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '13pt', fontWeight: 800, textDecoration: 'underline', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
            LEMBAR HASIL EVALUASI PEMBELAJARAN SISWA
          </h1>
          <p style={{ fontSize: '9.5pt', margin: 0, color: '#444' }}>
            Tahun Ajaran 2025/2026
          </p>
        </div>

        {/* Identitas Siswa & Modul */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '10pt' }}>
          <tbody>
            <tr>
              <td style={{ width: '140px', padding: '4px 0', fontWeight: 600 }}>Nama Siswa</td>
              <td style={{ width: '10px' }}>:</td>
              <td style={{ fontWeight: 700, textTransform: 'uppercase' }}>{studentName}</td>
              <td style={{ width: '140px', padding: '4px 0', fontWeight: 600 }}>Tanggal Pengerjaan</td>
              <td style={{ width: '10px' }}>:</td>
              <td>{currentDate}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 600 }}>Judul Modul</td>
              <td>:</td>
              <td style={{ fontWeight: 600 }}>{module?.title || 'Modul Sains'}</td>
              <td style={{ padding: '4px 0', fontWeight: 600 }}>Jenjang / Tingkat</td>
              <td>:</td>
              <td>{module?.level || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 600 }}>Nilai Akhir (Skor)</td>
              <td>:</td>
              <td>
                <span style={{ fontSize: '12pt', fontWeight: 900 }}>{score} / 100</span>
                {' '}({score >= 70 ? 'TUNTAS' : 'PERLU BIMBINGAN'})
              </td>
              <td style={{ padding: '4px 0', fontWeight: 600 }}>Hasil Jawaban</td>
              <td>:</td>
              <td><strong>{correctCount} Benar</strong> dari {questions.length} Soal</td>
            </tr>
          </tbody>
        </table>

        {/* Tabel Analisis Soal, Jawaban & Pembenaran */}
        <h4 style={{ fontSize: '10.5pt', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
          A. Analisis Butir Soal dan Kunci Pembenaran
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {questions.map((q, idx) => {
            const ans = answers[idx];
            const isCorrect = checkIsCorrect(q, ans);

            return (
              <div key={idx} style={{ 
                border: '1px solid #777', 
                borderRadius: '4px', 
                padding: '8px 10px',
                fontSize: '9.5pt',
                pageBreakInside: 'avoid'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span>Soal No. {idx + 1}</span>
                  <span style={{ color: isCorrect ? '#000' : '#000', fontWeight: 800 }}>
                    Status: {isCorrect ? '[ BENAR (✓) ]' : '[ SALAH (✗) ]'}
                  </span>
                </div>
                <div style={{ marginBottom: '4px', lineHeight: 1.35 }}>
                  <strong>Pertanyaan:</strong> {q.text}
                </div>
                <div style={{ marginBottom: '2px' }}>
                  <strong>Jawaban Siswa:</strong> {getUserAnswerLabel(q, ans)}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Kunci Jawaban Benar:</strong> {getCorrectAnswerLabel(q)}
                </div>
                {q.explanation && (
                  <div style={{ background: '#f5f5f5', padding: '4px 6px', borderLeft: '3px solid #333', fontSize: '9pt', marginTop: '4px' }}>
                    <strong>Pembenaran / Pembahasan:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Refleksi Siswa */}
        {reflection && (
          <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
            <h4 style={{ fontSize: '10.5pt', fontWeight: 700, marginBottom: '6px', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
              B. Catatan Refleksi Pembelajaran Siswa
            </h4>
            <div style={{ border: '1px solid #777', padding: '8px 10px', borderRadius: '4px', fontSize: '9.5pt', fontStyle: 'italic', background: '#fafafa' }}>
              "{reflection}"
            </div>
          </div>
        )}

        {/* Tanda Tangan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', pageBreakInside: 'avoid', fontSize: '10pt' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div>Siswa yang Bersangkutan,</div>
            <div style={{ height: '55px' }}></div>
            <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{studentName}</div>
            <div style={{ fontSize: '9pt', color: '#555' }}>Siswa Literasi Sains</div>
          </div>

          <div style={{ textAlign: 'center', width: '220px' }}>
            <div>Guru Pembimbing / Penguji,</div>
            <div style={{ height: '55px' }}></div>
            <div style={{ fontWeight: 700, textDecoration: 'underline' }}>( ........................................ )</div>
            <div style={{ fontSize: '9pt', color: '#555' }}>NIP. .....................................</div>
          </div>
        </div>
      </div>
    </div>
  );
}
