import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Module, User } from '../../types';
import { PdfReportModal } from '../components/PdfReportModal';

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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

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
    if (isSubmitted) return;
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
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

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

  const studentName = user?.name || 'Siswa Pembelajar';
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // --- JIKA TIDAK ADA SOAL DI MODUL (REFLEKSI MANDIRI SAJA) ---
  if (!questions || questions.length === 0) {
    return (
      <div style={{ padding: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>
            <i className="ti ti-notes"></i>
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Refleksi Pembelajaran Mandiri
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Modul ini berbasis eksperimen virtual. Tuliskan pemahaman yang Anda dapatkan setelah mencoba simulasi laboratorium.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
            Catatan Refleksi Siswa:
          </label>
          <textarea 
            className="form-input" 
            rows={4} 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Tuliskan konsep sains yang Anda pahami setelah mencoba simulasi..."
            style={{ width: '100%', resize: 'vertical', borderRadius: '10px', padding: '12px 14px', fontSize: '13.5px', lineHeight: '1.5' }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => onComplete(reflection)} 
          disabled={!reflection.trim()}
          style={{ width: '100%', justifyContent: 'center', height: '44px', fontWeight: 700, fontSize: '14px', borderRadius: '10px' }}
        >
          <i className="ti ti-circle-check"></i> Selesaikan Modul
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── MODE 1: LEMBAR PENGERJAAN SOAL EVALUASI ── */}
      {!isSubmitted ? (
        <div>
          {/* Header Progress Pengerjaan */}
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            padding: '16px', 
            borderRadius: '14px', 
            marginBottom: '20px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="ti ti-checklist" style={{ color: '#d97706' }}></i> Progress Soal Evaluasi
              </span>
              <span style={{ 
                background: answeredCount === questions.length ? '#dcfce7' : '#eff6ff', 
                color: answeredCount === questions.length ? '#15803d' : '#1d4ed8', 
                padding: '3px 10px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: 700 
              }}>
                {answeredCount} / {questions.length} Terjawab ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar Line */}
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: answeredCount === questions.length ? '#10b981' : '#2563eb', 
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }} 
              />
            </div>
            
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
              Jawab seluruh pertanyaan di bawah ini dengan teliti. Klik <strong>Kirim & Periksa Jawaban</strong> setelah selesai.
            </p>
          </div>

          {/* Daftar Butir Soal */}
          <div className="questions-card-container">
            {questions.map((q, idx) => {
              const qType = q.type || 'multiple_choice';
              const isAnswered = isQuestionAnswered(idx);

              return (
                <div 
                  key={idx} 
                  id={`question-item-${idx}`}
                  className={`question-box ${isAnswered ? 'is-answered' : ''}`}
                >
                  <div className="question-meta-row">
                    <div className="question-number-tag">
                      <div className="number-chip" style={{ background: isAnswered ? '#2563eb' : '#0f172a' }}>
                        {idx + 1}
                      </div>
                      <span className="type-pill">
                        {qType === 'multiple_choice' ? 'Pilihan Ganda' :
                         qType === 'multiple_select' ? 'Pilihan Ganda Kompleks' :
                         qType === 'true_false' ? 'Benar / Salah' :
                         qType === 'short_answer' ? 'Isian Singkat' :
                         qType === 'essay' ? 'Uraian Singkat' :
                         qType === 'matching' ? 'Menjodohkan' : 'Mengurutkan'}
                      </span>
                    </div>

                    {isAnswered ? (
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="ti ti-circle-check"></i> Terjawab
                      </span>
                    ) : (
                      <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>
                        Belum Diisi
                      </span>
                    )}
                  </div>

                  <h4 className="question-prompt-text">
                    {q.text}
                  </h4>

                  {/* Pilihan Ganda (Single Select) */}
                  {qType === 'multiple_choice' && (
                    <div>
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isSelected = answers[idx] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelect(idx, optIdx)}
                            className={`option-tile ${isSelected ? 'selected' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <div className="letter-circle">
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span style={{ lineHeight: 1.4 }}>{opt}</span>
                            </div>
                            {isSelected && <i className="ti ti-check" style={{ color: '#2563eb', fontSize: '18px', flexShrink: 0 }}></i>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pilihan Ganda Kompleks (Multi Select) */}
                  {qType === 'multiple_select' && (
                    <div>
                      <p style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic', marginBottom: '10px' }}>
                        *Pilih satu atau lebih opsi yang sesuai.
                      </p>
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isSelected = (answers[idx] || []).includes(optIdx);
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelect(idx, optIdx)}
                            className={`option-tile ${isSelected ? 'selected' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <i className={`ti ${isSelected ? 'ti-square-check-filled' : 'ti-square'}`} style={{ color: isSelected ? '#2563eb' : '#94a3b8', fontSize: '20px' }}></i>
                              <span style={{ lineHeight: 1.4 }}>{opt}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Benar / Salah */}
                  {qType === 'true_false' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[true, false].map((val, bIdx) => {
                        const isSelected = answers[idx] === val;
                        return (
                          <div
                            key={bIdx}
                            onClick={() => handleSelect(idx, val)}
                            className={`option-tile ${isSelected ? 'selected' : ''}`}
                            style={{ 
                              justifyContent: 'center', 
                              textAlign: 'center',
                              padding: '14px',
                              background: isSelected ? (val ? '#f0fdf4' : '#fff1f2') : '#ffffff',
                              borderColor: isSelected ? (val ? '#16a34a' : '#e11d48') : '#e2e8f0',
                              color: isSelected ? (val ? '#16a34a' : '#e11d48') : '#1e293b'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                              <i className={`ti ${val ? 'ti-thumb-up' : 'ti-thumb-down'}`}></i>
                              <span>{val ? 'Benar' : 'Salah'}</span>
                            </div>
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
                          placeholder="Ketik uraian jawaban sains Anda di sini..." 
                          value={answers[idx] || ''} 
                          onChange={e => handleSelect(idx, e.target.value)} 
                          style={{ width: '100%', padding: '12px', minHeight: '90px', resize: 'vertical', fontSize: '13.5px', borderRadius: '10px' }}
                        />
                      ) : (
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ketik jawaban singkat..." 
                          value={answers[idx] || ''} 
                          onChange={e => handleSelect(idx, e.target.value)} 
                          style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', borderRadius: '10px' }}
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
                          <div key={pIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{pair.left}</span>
                            <select 
                              className="form-input" 
                              style={{ width: '100%', padding: '8px 12px', fontSize: '13px', margin: 0, borderRadius: '8px', background: '#ffffff' }}
                              value={currentVal}
                              onChange={e => {
                                const newAns = { ...(answers[idx] || {}) };
                                newAns[pair.left] = e.target.value;
                                handleSelect(idx, newAns);
                              }}
                            >
                              <option value="" disabled>-- Pilih Pasangan yang Sesuai --</option>
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
                        <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button 
                              type="button"
                              disabled={oIdx === 0} 
                              onClick={() => {
                                const newArr = [...answers[idx]];
                                [newArr[oIdx - 1], newArr[oIdx]] = [newArr[oIdx], newArr[oIdx - 1]];
                                handleSelect(idx, newArr);
                              }} 
                              style={{ cursor: oIdx === 0 ? 'not-allowed' : 'pointer', opacity: oIdx === 0 ? 0.3 : 1, padding: 0, color: '#2563eb', border: 'none', background: 'none' }}
                            >
                              <i className="ti ti-chevron-up" style={{ fontSize: '16px' }}></i>
                            </button>
                            <button 
                              type="button"
                              disabled={oIdx === answers[idx].length - 1} 
                              onClick={() => {
                                const newArr = [...answers[idx]];
                                [newArr[oIdx + 1], newArr[oIdx]] = [newArr[oIdx], newArr[oIdx + 1]];
                                handleSelect(idx, newArr);
                              }} 
                              style={{ cursor: oIdx === answers[idx].length - 1 ? 'not-allowed' : 'pointer', opacity: oIdx === answers[idx].length - 1 ? 0.3 : 1, padding: 0, color: '#2563eb', border: 'none', background: 'none' }}
                            >
                              <i className="ti ti-chevron-down" style={{ fontSize: '16px' }}></i>
                            </button>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '13px', color: '#2563eb', width: '20px' }}>{oIdx + 1}.</span>
                          <span style={{ flex: 1, fontSize: '13.5px', color: '#334155' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tombol Submit Semua Jawaban */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            {answeredCount < questions.length && (
              <p style={{ fontSize: '12.5px', color: '#d97706', marginBottom: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <i className="ti ti-alert-triangle"></i> Anda baru menjawab {answeredCount} dari {questions.length} butir soal.
              </p>
            )}

            <button 
              className="btn btn-primary"
              onClick={() => {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ width: '100%', height: '48px', justifyContent: 'center', fontSize: '14.5px', fontWeight: 700, borderRadius: '12px' }}
            >
              <i className="ti ti-send"></i> Kirim & Periksa Jawaban Evaluasi
            </button>
          </div>
        </div>
      ) : (
        /* ── MODE 2: SKOR HASIL, KUNCI JAWABAN & PEMBAHASAN LENGKAP ── */
        <div>
          {/* Dashboard Skor Evaluasi */}
          <div className="score-hero-dashboard">
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: score >= 70 ? '#dcfce7' : '#fef3c7', 
              color: score >= 70 ? '#15803d' : '#b45309',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              <i className={score >= 70 ? 'ti ti-rosette-discount-check' : 'ti ti-refresh'}></i>
              {score >= 70 ? 'KOMPETENSI TUNTAS (MEMENUHI SYARAT)' : 'PERLU PENGAYAAN & LATIHAN ULANG'}
            </span>

            {/* Circular Score Badge */}
            <div className={`score-circular-badge ${score >= 70 ? 'passed' : 'failed'}`}>
              <span style={{ fontSize: '34px', fontWeight: 900, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Nilai</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              {score >= 70 ? 'Pencapaian Belajar Sangat Baik!' : 'Tetap Semangat! Pelajari Kembali Modul Ini'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Menjawab benar <strong>{correctCount}</strong> dari <strong>{questions.length}</strong> butir pertanyaan evaluasi.
            </p>

            {/* Stat Cards Grid */}
            <div className="score-stats-grid">
              <div className="score-stat-card">
                <div className="score-stat-val" style={{ color: '#16a34a' }}>{correctCount}</div>
                <div className="score-stat-lbl">Jawaban Benar</div>
              </div>
              <div className="score-stat-card">
                <div className="score-stat-val" style={{ color: '#e11d48' }}>{questions.length - correctCount}</div>
                <div className="score-stat-lbl">Perlu Dibenahi</div>
              </div>
              <div className="score-stat-card">
                <div className="score-stat-val" style={{ color: '#2563eb' }}>{score}%</div>
                <div className="score-stat-lbl">Tingkat Akurasi</div>
              </div>
            </div>

            {/* Action Buttons: Print PDF & Ulangi */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
              <button 
                id="btn-open-pdf-modal"
                className="btn btn-outline"
                onClick={() => setIsPdfModalOpen(true)}
                style={{ 
                  background: '#ffffff', 
                  border: '1.5px solid #0d47a1', 
                  color: '#0d47a1', 
                  fontWeight: 700, 
                  fontSize: '13px', 
                  padding: '9px 18px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(13, 71, 161, 0.08)'
                }}
              >
                <i className="ti ti-printer" style={{ fontSize: '17px' }}></i> Pratinjau & Unduh PDF / Cetak A4
              </button>

              <button 
                id="btn-retry-eval"
                className="btn btn-ghost"
                onClick={handleRetry}
                style={{ 
                  border: '1.5px solid #cbd5e1', 
                  color: '#475569', 
                  fontWeight: 600, 
                  fontSize: '13px', 
                  padding: '9px 18px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="ti ti-rotate-clockwise" style={{ fontSize: '17px' }}></i> Ulangi Evaluasi
              </button>
            </div>
          </div>

          {/* Pembahasan & Pembenaran Soal */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <i className="ti ti-file-check" style={{ color: '#2563eb', fontSize: '20px' }}></i>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Analisis Kunci Jawaban & Pembenaran Konsep
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, i) => {
                const ans = answers[i];
                const isCorrect = checkIsCorrect(q, ans);
                return (
                  <div key={i} style={{ 
                    border: `1.5px solid ${isCorrect ? '#86efac' : '#fca5a5'}`, 
                    borderRadius: '14px', 
                    padding: '18px',
                    background: isCorrect ? '#fafffc' : '#fffbfa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isCorrect ? '#16a34a' : '#e11d48', color: '#ffffff',
                        fontSize: '13px', fontWeight: 800
                      }}>
                        {i + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                          {q.text}
                        </p>
                        
                        <div style={{ fontSize: '13px', marginBottom: '6px', lineHeight: 1.4 }}>
                          <span style={{ color: '#64748b' }}>Jawaban Anda: </span>
                          <strong style={{ color: isCorrect ? '#16a34a' : '#e11d48' }}>
                            {getUserAnswerLabel(q, ans)} {isCorrect ? '✓ (Benar)' : '✗ (Kurang Tepat)'}
                          </strong>
                        </div>

                        {!isCorrect && (
                          <div style={{ fontSize: '13px', marginBottom: '6px', lineHeight: 1.4 }}>
                            <span style={{ color: '#64748b' }}>Kunci Jawaban Resmi: </span>
                            <strong style={{ color: '#16a34a' }}>
                              {getCorrectAnswerLabel(q)}
                            </strong>
                          </div>
                        )}

                        {q.explanation && (
                          <div style={{ 
                            marginTop: '12px', 
                            padding: '12px 14px', 
                            background: '#ffffff', 
                            borderRadius: '10px', 
                            border: '1px solid #e2e8f0',
                            fontSize: '13px', 
                            color: '#334155',
                            lineHeight: 1.55
                          }}>
                            <strong style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <i className="ti ti-bulb"></i> Penjelasan Konsep Ilmiah:
                            </strong>
                            <span>{q.explanation}</span>
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
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-notebook" style={{ color: '#2563eb' }}></i> Catatan Refleksi Pembelajaran
            </h4>
            <p style={{ color: '#64748b', fontSize: '12.5px', marginBottom: '12px', lineHeight: 1.45 }}>
              Tuliskan pemahaman atau hal baru yang Anda peroleh dari kombinasi materi, simulasi laboratorium, dan evaluasi ini.
            </p>
            <textarea 
              className="form-input" 
              rows={3} 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Contoh: Saya memahami bagaimana perubahan nilai variabel berpengaruh langsung terhadap hasil eksperimen..."
              style={{ 
                width: '100%', 
                resize: 'vertical', 
                background: '#ffffff', 
                borderRadius: '10px', 
                border: '1.5px solid #cbd5e1', 
                padding: '12px 14px', 
                fontSize: '13.5px', 
                minHeight: '85px'
              }}
            />
          </div>

          {/* Tombol Simpan & Selesaikan Modul */}
          <button 
            className="btn btn-primary" 
            onClick={() => onComplete(reflection)} 
            style={{ width: '100%', justifyContent: 'center', height: '48px', fontWeight: 800, fontSize: '15px', borderRadius: '12px' }}
          >
            <i className="ti ti-circle-check"></i> Simpan Hasil & Selesaikan Modul
          </button>
        </div>
      )}

      {/* ── MODAL PRATINJAU DOKUMEN RESMI PDF & CETAK A4 ── */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        module={module}
        user={user}
        questions={questions}
        answers={answers}
        score={score}
        correctCount={correctCount}
        reflection={reflection}
        checkIsCorrect={checkIsCorrect}
        getUserAnswerLabel={getUserAnswerLabel}
        getCorrectAnswerLabel={getCorrectAnswerLabel}
      />
    </div>
  );
}
