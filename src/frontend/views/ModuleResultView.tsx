import React, { useEffect, useState } from 'react';
import { Module, User } from '../../types';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAuth } from '../../lib/fetchAuth';

export function ModuleResultView({ 
  module: propModule, 
  moduleId: propModuleId,
  user 
}: { 
  module?: Module; 
  moduleId?: number;
  user?: User | null; 
}) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [activeModule, setActiveModule] = useState<Module | undefined>(propModule);
  const [answers, setAnswers] = useState<Record<string | number, any>>({});
  const [reflection, setReflection] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveModuleId = propModule?.id || propModuleId || (params.id ? parseInt(params.id) : null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (propModule) {
      setActiveModule(propModule);
    } else if (effectiveModuleId) {
      fetchAuth('/api/modules')
        .then(r => r.ok ? r.json() : [])
        .then((mods: Module[]) => {
          const found = mods.find(m => m.id === effectiveModuleId);
          if (found) setActiveModule(found);
        })
        .catch(console.error);
    }
  }, [propModule, effectiveModuleId]);

  useEffect(() => {
    if (!effectiveModuleId) return;

    // Load answers from localStorage
    if (user) {
      const storageKey = `draft_answers_${user.id}_${effectiveModuleId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          setAnswers(data.answers || {});
          setReflection(data.reflection || '');
          if (data.submittedAt) setSubmittedAt(data.submittedAt);
        }
      } catch (e) {
        console.error('Error reading saved answers', e);
      }
    }

    // Fetch questions
    setIsLoading(true);
    fetchAuth(`/api/modules/${effectiveModuleId}/questions`)
      .then(r => r.ok ? r.json() : { questions: [] })
      .then(d => {
        setQuestions(d.questions || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching questions', err);
        setIsLoading(false);
      });
  }, [effectiveModuleId, user]);

  const checkIsCorrect = (q: any, ans: any) => {
    if (ans === undefined || ans === null) return false;
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') {
      if (typeof q.correctAnswerIndex === 'number') return ans === q.correctAnswerIndex;
      if (typeof q.correct_answer === 'string') return q.options?.[ans] === q.correct_answer;
      if (typeof q.correct_answer === 'number') return ans === q.correct_answer;
      return ans === q.correctAnswerIndex;
    }
    if (type === 'true_false') {
      const correctVal = q.correctAnswer !== undefined ? q.correctAnswer : (q.correct_answer === 'Benar' || q.correct_answer === true);
      return ans === correctVal;
    }
    if (type === 'short_answer') {
      const correctText = q.correctAnswerText || q.correct_answer || '';
      return String(ans).toLowerCase().trim() === String(correctText).toLowerCase().trim();
    }
    if (type === 'essay') {
      return typeof ans === 'string' && ans.trim().length > 0;
    }
    if (type === 'multiple_select') {
      if (!Array.isArray(ans)) return false;
      const correct = q.correctAnswers || q.correct_answer || [];
      if (ans.length !== correct.length) return false;
      return correct.every((c: any) => ans.includes(c));
    }
    if (type === 'ordering') {
      if (!ans || !Array.isArray(ans)) return false;
      const options = q.options || [];
      if (ans.length !== options.length) return false;
      return options.every((c: any, i: number) => c === ans[i]);
    }
    if (type === 'matching') {
      if (!ans || typeof ans !== 'object') return false;
      const pairs = q.pairs || [];
      for (const p of pairs) {
        if (ans[p.left] !== p.right) return false;
      }
      return true;
    }
    return false;
  };

  const getCorrectAnswerLabel = (q: any) => {
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') {
      if (typeof q.correctAnswerIndex === 'number' && q.options?.[q.correctAnswerIndex]) return q.options[q.correctAnswerIndex];
      if (q.correct_answer) return String(q.correct_answer);
      return q.options?.[0] || '-';
    }
    if (type === 'true_false') {
      const isTrue = q.correctAnswer !== undefined ? q.correctAnswer : (q.correct_answer === 'Benar' || q.correct_answer === true);
      return isTrue ? 'Benar' : 'Salah';
    }
    if (type === 'short_answer') return q.correctAnswerText || q.correct_answer || '-';
    if (type === 'essay') return '(Sesuai dengan pemahaman konsep sains pada materi modul)';
    if (type === 'multiple_select') {
      const correct = q.correctAnswers || q.correct_answer || [];
      if (Array.isArray(correct)) {
        return correct.map((i: any) => typeof i === 'number' ? q.options?.[i] : i).filter(Boolean).join(', ');
      }
      return '-';
    }
    if (type === 'ordering') return (q.options || []).join(' → ');
    if (type === 'matching') return (q.pairs || []).map((p: any) => `${p.left} ➔ ${p.right}`).join('; ');
    return '-';
  };

  const getUserAnswerLabel = (q: any, ans: any) => {
    if (ans === undefined || ans === null || ans === '') return '(Tidak dijawab)';
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') return typeof ans === 'number' ? (q.options?.[ans] || String(ans)) : String(ans);
    if (type === 'true_false') return ans ? 'Benar' : 'Salah';
    if (type === 'short_answer') return String(ans);
    if (type === 'essay') return String(ans);
    if (type === 'multiple_select') {
      if (!Array.isArray(ans) || ans.length === 0) return '(Tidak dijawab)';
      return ans.map((i: any) => typeof i === 'number' ? (q.options?.[i] || String(i)) : String(i)).join(', ');
    }
    if (type === 'ordering') return Array.isArray(ans) ? ans.join(' → ') : '-';
    if (type === 'matching') {
      if (typeof ans !== 'object') return '-';
      const items = Object.entries(ans).map(([k, v]) => `${k} ➔ ${v}`);
      return items.length > 0 ? items.join('; ') : '(Tidak dijawab)';
    }
    return String(ans);
  };

  const formattedDate = submittedAt 
    ? new Date(submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (isLoading && !activeModule) {
    return (
      <div className="page active" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ color: '#64748b' }}>Memuat hasil evaluasi modul…</p>
      </div>
    );
  }

  if (!activeModule) {
    return (
      <div className="page active" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }}><i className="ti ti-alert-circle"></i></div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Modul Tidak Ditemukan</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Modul pembelajaran yang Anda cari tidak tersedia atau telah dihapus.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <i className="ti ti-arrow-left"></i> Kembali ke Daftar Modul
        </button>
      </div>
    );
  }

  const correctCount = questions.filter((q: any, i: number) => {
    const userAns = answers[i] !== undefined ? answers[i] : answers[String(i)];
    return checkIsCorrect(q, userAns);
  }).length;

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
  const isPassed = score >= 70;

  return (
    <div className="page active" style={{ paddingBottom: '60px', paddingTop: '24px' }}>
      <div className="main-wrapper">
        
        {/* ── ACTION BAR (HANYA DI LAYAR, DISEMBUNYIKAN SAAT PRINT) ── */}
        <div className="no-print" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '24px', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}>
          <nav aria-label="Breadcrumb" className="breadcrumb" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
            <button 
              onClick={() => navigate('/')}
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="ti ti-layout-grid"></i><span>Daftar Modul</span>
            </button>
            <span style={{ color: '#94a3b8' }}>›</span>
            <button 
              onClick={() => navigate(`/module/${activeModule.id}`)}
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}
            >
              {activeModule.title}
            </button>
            <span style={{ color: '#94a3b8' }}>›</span>
            <span style={{ color: '#475569', fontWeight: 700 }}>Hasil Evaluasi</span>
          </nav>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate(`/module/${activeModule.id}`)}
              style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <i className="ti ti-arrow-left"></i> Kembali ke Modul
            </button>
            
            {/* TOMBOL UTAMA CETAK HASIL (WINDOW.PRINT) */}
            <button 
              id="btn-print-module-result"
              className="btn btn-primary" 
              onClick={() => window.print()}
              style={{ 
                padding: '9px 18px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontWeight: 700,
                background: '#0d47a1',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(13, 71, 161, 0.25)',
                cursor: 'pointer'
              }}
            >
              <i className="ti ti-printer" style={{ fontSize: '18px' }}></i> Cetak Hasil Evaluasi (PDF)
            </button>
          </div>
        </div>

        {/* ── PRINT AREA: LEMBAR HASIL EVALUASI PEMBELAJARAN ── */}
        <div className="print-area">

          {/* HEADER DOKUMEN (LAYAR & CETAK) */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              Laporan Hasil Evaluasi Pembelajaran
            </h1>
            <p style={{ fontSize: '15px', color: '#475569', margin: 0, fontWeight: 600 }}>
              Modul: <span style={{ color: '#0d47a1' }}>{activeModule.title}</span>
            </p>
          </div>

          {/* TABEL IDENTITAS PESERTA DIDIK & MODUL */}
          <div style={{ 
            background: '#ffffff', 
            border: '1.5px solid #e2e8f0', 
            borderRadius: '12px', 
            padding: '16px 20px', 
            marginBottom: '24px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px 24px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Nama Siswa:</span>
                <strong style={{ color: '#0f172a', fontSize: '15px' }}>{user?.name || 'Siswa'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Tanggal Selesai:</span>
                <strong style={{ color: '#0f172a' }}>{formattedDate}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Status Pemahaman:</span>
                <strong style={{ color: isPassed ? '#15803d' : '#b45309' }}>
                  {isPassed ? 'Paham dengan Baik' : 'Perlu Pendalaman Materi'}
                </strong>
              </div>
            </div>
          </div>

          {/* RINGKASAN SKOR & NILAI AKHIR */}
          <div className="print-card-break" style={{ 
            background: '#ffffff', 
            borderRadius: '14px', 
            padding: '28px', 
            marginBottom: '24px',
            border: `1.5px solid ${isPassed ? '#86efac' : '#fde68a'}`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isPassed ? '#dcfce7' : '#fef3c7', 
              color: isPassed ? '#15803d' : '#b45309',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              <i className={isPassed ? 'ti ti-circle-check-filled' : 'ti ti-alert-triangle-filled'}></i>
              {isPassed ? 'Pemahaman Sangat Baik' : 'Ayo Pelajari Lagi'}
            </div>

            <div style={{ 
              width: '110px', 
              height: '110px', 
              borderRadius: '50%', 
              background: isPassed ? '#15803d' : '#d97706',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: '40px', fontWeight: 900, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Nilai Akhir</span>
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              {isPassed ? 'Keren! Kamu Berhasil Menyelesaikan Modul Ini' : 'Tetap Semangat, Yuk Asah Lagi Konsep Ini!'}
            </h3>
            
            <p style={{ fontSize: '14.5px', color: '#64748b', margin: 0, maxWidth: '540px', lineHeight: 1.5 }}>
              {isPassed ? (
                <>Menjawab benar <strong>{correctCount}</strong> dari <strong>{questions.length}</strong> butir soal ({score}% akurasi). Konsep materi sains pada modul ini berhasil kamu pahami dengan baik!</>
              ) : (
                <>Menjawab benar <strong>{correctCount}</strong> dari <strong>{questions.length}</strong> butir soal ({score}% akurasi). Jangan berkecil hati, kamu bisa coba ulangi simulasi dan pelajari penjelasannya lagi ya!</>
              )}
            </p>
          </div>

          {/* ANALISIS DAN RINCIAN BUTIR SOAL */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-list-check" style={{ color: 'var(--primary)' }}></i> Rincian &amp; Analisis Butir Soal
            </h3>
            
            {questions.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                Modul ini berbasis eksperimen mandiri tanpa lembar soal evaluasi tertulis.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {questions.map((q: any, i: number) => {
                  const userAns = answers[i] !== undefined ? answers[i] : answers[String(i)];
                  const isCorrect = checkIsCorrect(q, userAns);
                  const isEssay = q.type === 'essay';

                  return (
                    <div 
                      key={i} 
                      className="print-card-break"
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: `1.5px solid ${isEssay ? '#e2e8f0' : (isCorrect ? '#bbf7d0' : '#fecaca')}`,
                        background: isEssay ? '#f8fafc' : (isCorrect ? '#f0fdf4' : '#fef2f2')
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ 
                          width: '26px', 
                          height: '26px', 
                          borderRadius: '50%', 
                          background: isEssay ? '#64748b' : (isCorrect ? '#22c55e' : '#ef4444'),
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '12px',
                          flexShrink: 0
                        }}>
                          {i + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          {/* Pertanyaan */}
                          <div style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: 700, marginBottom: '10px', lineHeight: 1.5 }}>
                            {q.text || q.question || ''}
                          </div>
                          
                          {/* Data Jawaban */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <span style={{ color: '#64748b', width: '90px', flexShrink: 0, fontWeight: 600 }}>Jawabanmu:</span>
                              <strong style={{ color: isEssay ? '#1e293b' : (isCorrect ? '#15803d' : '#b91c1c') }}>
                                {getUserAnswerLabel(q, userAns)}
                              </strong>
                            </div>

                            {!isCorrect && !isEssay && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <span style={{ color: '#64748b', width: '90px', flexShrink: 0, fontWeight: 600 }}>Kunci:</span>
                                <strong style={{ color: '#15803d' }}>
                                  {getCorrectAnswerLabel(q)}
                                </strong>
                              </div>
                            )}

                            {/* Pembahasan Konsep Sains */}
                            {q.explanation && (
                              <div style={{ 
                                marginTop: '8px', 
                                padding: '10px 14px', 
                                background: 'rgba(255,255,255,0.85)', 
                                borderRadius: '8px', 
                                fontSize: '13px', 
                                color: '#334155', 
                                border: '1px solid rgba(0,0,0,0.06)' 
                              }}>
                                <strong style={{ display: 'block', marginBottom: '3px', color: '#0f172a', fontSize: '12px', textTransform: 'uppercase' }}>
                                  Pembahasan Konsep:
                                </strong>
                                <span>{q.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Label */}
                        <div style={{ 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          background: isEssay ? '#f1f5f9' : (isCorrect ? '#dcfce7' : '#fee2e2'), 
                          color: isEssay ? '#475569' : (isCorrect ? '#15803d' : '#b91c1c'),
                          fontSize: '12px',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {isEssay ? 'Uraian' : (isCorrect ? 'Benar' : 'Salah')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* CATATAN REFLEKSI SISWA */}
          {reflection && (
            <div className="print-card-break" style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '22px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-bulb" style={{ color: '#d97706' }}></i> Catatan Refleksi Belajar Siswa
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.6, padding: '14px 16px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0d47a1' }}>
                "{reflection}"
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
