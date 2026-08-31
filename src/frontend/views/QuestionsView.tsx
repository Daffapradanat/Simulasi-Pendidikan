import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [shuffledRights, setShuffledRights] = useState<Record<number, string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

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
    setCurrentIdx(0);
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
    setCurrentIdx(0);
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

  const currentQ = questions[currentIdx];
  const isCurrentAnswered = isQuestionAnswered(currentIdx);

  // --- JIKA TIDAK ADA SOAL DI MODUL ---
  if (!questions || questions.length === 0) {
    return (
      <div style={{ padding: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#0d47a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>
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
      {/* ── MODE 1: PENGERJAAN SATU PER SATU DENGAN NAVIGASI NOMOR SOAL ── */}
      {!isSubmitted ? (
        <div>
          {/* Header Status Bar Pengerjaan */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            padding: '14px 18px', 
            borderRadius: '12px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                background: '#0d47a1', 
                color: '#ffffff', 
                fontWeight: 900, 
                fontSize: '14px', 
                padding: '4px 12px', 
                borderRadius: '8px' 
              }}>
                Soal {currentIdx + 1} dari {questions.length}
              </div>
              <span style={{ 
                background: '#f1f5f9', 
                color: '#334155', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '12px', 
                fontWeight: 700 
              }}>
                {currentQ?.type === 'multiple_choice' ? 'Pilihan Ganda' :
                 currentQ?.type === 'multiple_select' ? 'Pilihan Ganda Kompleks' :
                 currentQ?.type === 'true_false' ? 'Benar / Salah' :
                 currentQ?.type === 'short_answer' ? 'Isian Singkat' :
                 currentQ?.type === 'essay' ? 'Uraian Singkat' :
                 currentQ?.type === 'matching' ? 'Menjodohkan' : 'Mengurutkan'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '12.5px', 
                fontWeight: 700,
                color: isCurrentAnswered ? '#15803d' : '#b45309',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className={isCurrentAnswered ? 'ti ti-circle-check' : 'ti ti-alert-circle'}></i>
                {isCurrentAnswered ? 'Sudah Dijawab' : 'Belum Dijawab'}
              </span>

              <span style={{ 
                background: '#eff6ff', 
                color: '#0d47a1', 
                padding: '4px 10px', 
                borderRadius: '8px', 
                fontSize: '12px', 
                fontWeight: 700 
              }}>
                {answeredCount} / {questions.length} Terjawab ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* ── CARD SATU SOAL YANG SEDANG AKTIF ── */}
          {currentQ && (
            <div 
              id={`active-question-card-${currentIdx}`}
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '14px',
                padding: '22px 24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                marginBottom: '16px'
              }}
            >
              {/* Teks Pertanyaan */}
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: '#0f172a', 
                lineHeight: 1.55,
                marginBottom: '20px'
              }}>
                {currentQ.text}
              </div>

              {/* Opsi: Pilihan Ganda (Single Select) */}
              {currentQ.type === 'multiple_choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.options?.map((opt: string, optIdx: number) => {
                    const isSelected = answers[currentIdx] === optIdx;
                    return (
                      <div
                        key={optIdx}
                        id={`option-${currentIdx}-${optIdx}`}
                        onClick={() => handleSelect(currentIdx, optIdx)}
                        className={`option-tile ${isSelected ? 'selected' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          border: isSelected ? '2px solid #0d47a1' : '1.5px solid #e2e8f0',
                          borderRadius: '10px',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: isSelected ? '#0d47a1' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#334155',
                            fontWeight: 800,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span style={{ fontSize: '14.5px', color: isSelected ? '#0d47a1' : '#1e293b', fontWeight: isSelected ? 700 : 500, lineHeight: 1.4 }}>
                            {opt}
                          </span>
                        </div>
                        {isSelected && (
                          <i className="ti ti-check" style={{ color: '#0d47a1', fontSize: '19px', fontWeight: 'bold' }}></i>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Opsi: Pilihan Ganda Kompleks (Multi Select) */}
              {currentQ.type === 'multiple_select' && (
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginBottom: '12px' }}>
                    *Pilih satu atau beberapa jawaban yang benar:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentQ.options?.map((opt: string, optIdx: number) => {
                      const isSelected = (answers[currentIdx] || []).includes(optIdx);
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelect(currentIdx, optIdx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            border: isSelected ? '2px solid #0d47a1' : '1.5px solid #e2e8f0',
                            borderRadius: '10px',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          <i className={`ti ${isSelected ? 'ti-square-check-filled' : 'ti-square'}`} style={{ color: isSelected ? '#0d47a1' : '#94a3b8', fontSize: '22px' }}></i>
                          <span style={{ fontSize: '14.5px', color: isSelected ? '#0d47a1' : '#1e293b', fontWeight: isSelected ? 700 : 500, lineHeight: 1.4 }}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Opsi: Benar / Salah */}
              {currentQ.type === 'true_false' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[true, false].map((val, bIdx) => {
                    const isSelected = answers[currentIdx] === val;
                    return (
                      <div
                        key={bIdx}
                        onClick={() => handleSelect(currentIdx, val)}
                        style={{ 
                          textAlign: 'center',
                          padding: '16px',
                          borderRadius: '10px',
                          border: isSelected ? (val ? '2px solid #15803d' : '2px solid #be123c') : '1.5px solid #e2e8f0',
                          background: isSelected ? (val ? '#f0fdf4' : '#fff1f2') : '#ffffff',
                          color: isSelected ? (val ? '#15803d' : '#be123c') : '#1e293b',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <i className={`ti ${val ? 'ti-thumb-up' : 'ti-thumb-down'}`}></i>
                        <span>{val ? 'Benar' : 'Salah'}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Opsi: Isian Singkat & Essay */}
              {(currentQ.type === 'short_answer' || currentQ.type === 'essay') && (
                <div>
                  {currentQ.type === 'essay' ? (
                    <textarea 
                      className="form-input" 
                      placeholder="Ketik uraian penjelasan konsep Anda di sini..." 
                      value={answers[currentIdx] || ''} 
                      onChange={e => handleSelect(currentIdx, e.target.value)} 
                      style={{ width: '100%', padding: '14px', minHeight: '110px', resize: 'vertical', fontSize: '14px', borderRadius: '10px' }}
                    />
                  ) : (
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ketik jawaban singkat Anda di sini..." 
                      value={answers[currentIdx] || ''} 
                      onChange={e => handleSelect(currentIdx, e.target.value)} 
                      style={{ width: '100%', padding: '12px 16px', fontSize: '14.5px', borderRadius: '10px' }}
                    />
                  )}
                </div>
              )}

              {/* Opsi: Menjodohkan */}
              {currentQ.type === 'matching' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQ.pairs?.map((pair: any, pIdx: number) => {
                    const currentVal = (answers[currentIdx] || {})[pair.left] || '';
                    return (
                      <div key={pIdx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', marginBottom: '6px' }}>
                          {pair.left}
                        </div>
                        <select 
                          className="form-input" 
                          style={{ width: '100%', padding: '9px 12px', fontSize: '13.5px', margin: 0, borderRadius: '8px', background: '#ffffff' }}
                          value={currentVal}
                          onChange={e => {
                            const newAns = { ...(answers[currentIdx] || {}) };
                            newAns[pair.left] = e.target.value;
                            handleSelect(currentIdx, newAns);
                          }}
                        >
                          <option value="" disabled>-- Pilih Pasangan yang Sesuai --</option>
                          {(shuffledRights[currentIdx] || []).map((r: string, rIdx: number) => (
                            <option key={rIdx} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Opsi: Mengurutkan */}
              {currentQ.type === 'ordering' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(answers[currentIdx] || []).map((item: string, oIdx: number) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button 
                          type="button"
                          disabled={oIdx === 0} 
                          onClick={() => {
                            const newArr = [...answers[currentIdx]];
                            [newArr[oIdx - 1], newArr[oIdx]] = [newArr[oIdx], newArr[oIdx - 1]];
                            handleSelect(currentIdx, newArr);
                          }} 
                          style={{ cursor: oIdx === 0 ? 'not-allowed' : 'pointer', opacity: oIdx === 0 ? 0.3 : 1, padding: 0, color: '#0d47a1', border: 'none', background: 'none' }}
                        >
                          <i className="ti ti-chevron-up" style={{ fontSize: '16px' }}></i>
                        </button>
                        <button 
                          type="button"
                          disabled={oIdx === answers[currentIdx].length - 1} 
                          onClick={() => {
                            const newArr = [...answers[currentIdx]];
                            [newArr[oIdx + 1], newArr[oIdx]] = [newArr[oIdx], newArr[oIdx + 1]];
                            handleSelect(currentIdx, newArr);
                          }} 
                          style={{ cursor: oIdx === answers[currentIdx].length - 1 ? 'not-allowed' : 'pointer', opacity: oIdx === answers[currentIdx].length - 1 ? 0.3 : 1, padding: 0, color: '#0d47a1', border: 'none', background: 'none' }}
                        >
                          <i className="ti ti-chevron-down" style={{ fontSize: '16px' }}></i>
                        </button>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0d47a1', width: '24px' }}>{oIdx + 1}.</span>
                      <span style={{ flex: 1, fontSize: '14px', color: '#334155' }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TOMBOL NAVIGASI SOAL SEBELUMNYA / BERIKUTNYA ── */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px'
          }}>
            <button
              id="btn-prev-question"
              className="btn btn-ghost"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: currentIdx === 0 ? '#94a3b8' : '#1e293b',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <i className="ti ti-arrow-left"></i> Soal Sebelumnya
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                id="btn-next-question"
                className="btn btn-primary"
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                style={{
                  background: '#0d47a1',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                Soal Berikutnya <i className="ti ti-arrow-right"></i>
              </button>
            ) : (
              <button
                id="btn-finish-exam-direct"
                className="btn btn-primary"
                onClick={() => setShowConfirmSubmit(true)}
                style={{
                  background: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="ti ti-check"></i> Selesai & Kumpulkan Jawaban
              </button>
            )}
          </div>

          {/* ── UI NAVIGASI & PEMILIH NOMOR SOAL (GRID DI BAWAH) ── */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-grid-dots" style={{ color: '#0d47a1', fontSize: '18px' }}></i>
                Pilih Nomor Soal yang Ingin Dikerjakan:
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Klik nomor untuk langsung berpindah soal
              </div>
            </div>

            {/* Grid Kotak Nomor Soal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
              gap: '10px',
              marginBottom: '16px'
            }}>
              {questions.map((_, qIdx) => {
                const isCurrent = qIdx === currentIdx;
                const isAns = isQuestionAnswered(qIdx);

                let bg = '#ffffff';
                let color = '#334155';
                let border = '1.5px solid #cbd5e1';

                if (isCurrent) {
                  bg = '#0d47a1';
                  color = '#ffffff';
                  border = '2px solid #0d47a1';
                } else if (isAns) {
                  bg = '#dcfce7';
                  color = '#15803d';
                  border = '1.5px solid #86efac';
                }

                return (
                  <button
                    key={qIdx}
                    id={`nav-num-btn-${qIdx}`}
                    type="button"
                    onClick={() => setCurrentIdx(qIdx)}
                    style={{
                      height: '42px',
                      background: bg,
                      color: color,
                      border: border,
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isCurrent ? '0 2px 8px rgba(13, 71, 161, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {qIdx + 1}
                    {isAns && !isCurrent && (
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '3px',
                        fontSize: '9px',
                        color: '#15803d',
                        fontWeight: 900
                      }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Keterangan Warna / Legend */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              fontSize: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
              color: '#475569'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#0d47a1', display: 'inline-block' }}></span>
                <span>Sedang Dibuka</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#dcfce7', border: '1px solid #86efac', display: 'inline-block' }}></span>
                <span>Sudah Dijawab ({answeredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-block' }}></span>
                <span>Belum Dijawab ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>

          {/* Tombol Utama Kirim & Selesaikan Evaluasi */}
          <div style={{ textAlign: 'center' }}>
            <button 
              id="btn-submit-exam"
              className="btn btn-primary"
              onClick={() => setShowConfirmSubmit(true)}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '46px',
                justifyContent: 'center',
                fontSize: '14.5px',
                fontWeight: 800,
                borderRadius: '10px',
                background: '#0d47a1',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i className="ti ti-send"></i> Kumpulkan & Periksa Jawaban
            </button>
          </div>

          {/* Modal Konfirmasi Pengumpulan Jawaban */}
          {showConfirmSubmit && (
            <div className="pdf-modal-backdrop" onClick={() => setShowConfirmSubmit(false)}>
              <div 
                className="card" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '420px', width: '100%', padding: '24px', textAlign: 'center', borderRadius: '14px', background: '#ffffff' }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#eff6ff', color: '#0d47a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 12px' }}>
                  <i className="ti ti-help-circle"></i>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Kumpulkan Jawaban Evaluasi?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Anda telah menjawab <strong>{answeredCount}</strong> dari <strong>{questions.length}</strong> butir soal.
                  {answeredCount < questions.length && (
                    <span style={{ display: 'block', color: '#be123c', fontWeight: 700, marginTop: '4px' }}>
                      Peringatan: Masih ada {questions.length - answeredCount} butir soal yang belum dijawab.
                    </span>
                  )}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    className="btn btn-ghost"
                    onClick={() => setShowConfirmSubmit(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                  >
                    Periksa Lagi
                  </button>
                  <button 
                    id="btn-confirm-submit-yes"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowConfirmSubmit(false);
                      setIsSubmitted(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#0d47a1', color: '#ffffff', border: 'none', fontWeight: 700 }}
                  >
                    Ya, Kumpulkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── MODE 2: HASIL EVALUASI & DAFTAR SELURUH PEMBAHASAN ── */
        <div>
          {/* Dashboard Skor Evaluasi Bersih */}
          <div className="score-hero-dashboard">
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: score >= 70 ? '#dcfce7' : '#fef3c7', 
              color: score >= 70 ? '#15803d' : '#b45309',
              padding: '5px 14px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '14px'
            }}>
              <i className={score >= 70 ? 'ti ti-check' : 'ti ti-refresh'}></i>
              {score >= 70 ? 'KOMPETENSI TUNTAS' : 'PERLU LATIHAN ULANG'}
            </span>

            {/* Circular Score Badge */}
            <div className={`score-circular-badge ${score >= 70 ? 'passed' : 'failed'}`}>
              <span style={{ fontSize: '34px', fontWeight: 900, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Nilai</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {score >= 70 ? 'Pencapaian Belajar Sangat Baik' : 'Tetap Semangat! Pelajari Kembali Modul Ini'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Menjawab benar <strong>{correctCount}</strong> dari <strong>{questions.length}</strong> butir soal.
            </p>

            {/* Tombol Cetak PDF & Ulangi */}
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
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="ti ti-printer" style={{ fontSize: '17px' }}></i> Cetak / Simpan PDF (Lembar Soal & Nilai)
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
                  borderRadius: '8px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <i className="ti ti-list-check" style={{ color: '#0d47a1', fontSize: '20px' }}></i>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Daftar Analisis Jawaban & Pembahasan
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {questions.map((q, i) => {
                const ans = answers[i];
                const isCorrect = checkIsCorrect(q, ans);
                return (
                  <div key={i} style={{ 
                    border: `1.5px solid ${isCorrect ? '#86efac' : '#fca5a5'}`, 
                    borderRadius: '12px', 
                    padding: '16px 18px',
                    background: isCorrect ? '#fafffc' : '#fffbfa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ 
                        width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isCorrect ? '#15803d' : '#be123c', color: '#ffffff',
                        fontSize: '13px', fontWeight: 800
                      }}>
                        {i + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                          {q.text}
                        </p>
                        
                        <div style={{ fontSize: '13px', marginBottom: '4px', lineHeight: 1.4 }}>
                          <span style={{ color: '#64748b' }}>Jawaban Anda: </span>
                          <strong style={{ color: isCorrect ? '#15803d' : '#be123c' }}>
                            {getUserAnswerLabel(q, ans)} {isCorrect ? '✓ (Benar)' : '✗ (Salah)'}
                          </strong>
                        </div>

                        {!isCorrect && (
                          <div style={{ fontSize: '13px', marginBottom: '4px', lineHeight: 1.4 }}>
                            <span style={{ color: '#64748b' }}>Kunci Jawaban Benar: </span>
                            <strong style={{ color: '#15803d' }}>
                              {getCorrectAnswerLabel(q)}
                            </strong>
                          </div>
                        )}

                        {q.explanation && (
                          <div style={{ 
                            marginTop: '10px', 
                            padding: '10px 12px', 
                            background: '#ffffff', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            fontSize: '13px', 
                            color: '#334155',
                            lineHeight: 1.5
                          }}>
                            <strong style={{ color: '#0d47a1', display: 'block', marginBottom: '2px' }}>
                              Pembahasan Konsep:
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
            padding: '18px 20px', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-notebook" style={{ color: '#0d47a1' }}></i> Catatan Refleksi Siswa
            </h4>
            <p style={{ color: '#64748b', fontSize: '12.5px', marginBottom: '10px', lineHeight: 1.45 }}>
              Tuliskan kesimpulan atau pemahaman sains yang Anda dapatkan setelah menyelesaikan modul ini.
            </p>
            <textarea 
              className="form-input" 
              rows={3} 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Contoh: Saya memahami prinsip kerja dan variabel yang mempengaruhi eksperimen..."
              style={{ 
                width: '100%', 
                resize: 'vertical', 
                background: '#ffffff', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                padding: '10px 12px', 
                fontSize: '13.5px', 
                minHeight: '75px'
              }}
            />
          </div>

          {/* Tombol Simpan & Selesaikan Modul */}
          <button 
            id="btn-finish-module"
            className="btn btn-primary" 
            onClick={() => onComplete(reflection)} 
            style={{ width: '100%', justifyContent: 'center', height: '46px', fontWeight: 800, fontSize: '14.5px', borderRadius: '10px', background: '#0d47a1', color: '#ffffff', border: 'none' }}
          >
            <i className="ti ti-circle-check"></i> Simpan Hasil & Selesaikan Modul
          </button>
        </div>
      )}

      {/* ── MODAL PRATINJAU DOKUMEN PDF (LEMBAR SOAL & NILAI) ── */}
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
