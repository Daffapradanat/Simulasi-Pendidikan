import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function QuestionsView({ questions = [], onComplete }: { questions: any[], onComplete: (reflection: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [shuffledRights, setShuffledRights] = useState<Record<number, string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [reflection, setReflection] = useState('');

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
  }, [questions]);

  const handleSelect = (qIndex: number, answer: any) => {
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

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    const initialAns: Record<number, any> = {};
    questions.forEach((q, i) => {
      if (q.type === 'matching') {
         initialAns[i] = {};
      } else if (q.type === 'ordering') {
         initialAns[i] = [...(q.options || [])].sort(() => Math.random() - 0.5);
      }
    });
    setAnswers(initialAns);
    setShowResult(false);
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

  const getCorrectAnswerLabel = (q: any) => {
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') return q.options[q.correctAnswerIndex];
    if (type === 'true_false') return q.correctAnswer ? 'Benar' : 'Salah';
    if (type === 'short_answer') return q.correctAnswerText;
    if (type === 'essay') return '(Penilaian manual berdasarkan penjelasan guru)';
    if (type === 'multiple_select') return (q.correctAnswers || []).map((i: number) => q.options[i]).join(', ');
    if (type === 'ordering') return (q.options || []).join(' → ');
    if (type === 'matching') return (q.pairs || []).map((p: any) => `${p.left} = ${p.right}`).join(', ');
    return '';
  };

  const getUserAnswerLabel = (q: any, ans: any) => {
    if (ans === undefined || ans === null) return '-';
    const type = q.type || 'multiple_choice';
    if (type === 'multiple_choice') return q.options[ans];
    if (type === 'true_false') return ans ? 'Benar' : 'Salah';
    if (type === 'short_answer') return String(ans);
    if (type === 'essay') return String(ans);
    if (type === 'multiple_select') {
      if (!Array.isArray(ans) || ans.length === 0) return '-';
      return ans.map((i: number) => q.options[i]).join(', ');
    }
    if (type === 'ordering') return Array.isArray(ans) ? ans.join(' → ') : '-';
    if (type === 'matching') {
       if (typeof ans !== 'object') return '-';
       return Object.entries(ans).map(([k, v]) => `${k} = ${v}`).join(', ');
    }
    return String(ans);
  };

  // --- FLOW A: NO QUESTIONS IN MODULE ---
  if (!questions || questions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          padding: '32px 24px', 
          background: 'var(--white)', 
          borderRadius: '16px', 
          border: '1.5px solid var(--border)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '28px', 
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
          }}>
            <i className="ti ti-notes"></i>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>Refleksi Pembelajaran</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Tuliskan secara singkat pemahaman atau pengalaman menarik yang Anda dapatkan setelah mencoba simulasi ini.
          </p>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <textarea 
            className="form-input" 
            rows={5} 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Contoh: Saya memahami bahwa massa benda memengaruhi gaya gravitasi..."
            style={{ 
              width: '100%', 
              resize: 'none', 
              borderRadius: '12px', 
              border: '1.5px solid var(--border)', 
              padding: '16px', 
              fontSize: '14px', 
              lineHeight: '1.6', 
              transition: 'all 0.3s ease',
              outline: 'none',
              backgroundColor: '#F8FAFC',
              minHeight: '120px'
            }}
          ></textarea>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => onComplete(reflection)} 
          disabled={!reflection.trim()}
          style={{ width: '100%', justifyContent: 'center', height: '46px', fontWeight: 600, fontSize: '15px' }}
        >
          Selesaikan Modul & Buka Berikutnya
        </button>
      </motion.div>
    );
  }

  // --- FLOW B: EVALUATION RESULT ---
  if (showResult) {
    const correctCount = questions.filter((q, i) => checkIsCorrect(q, answers[i])).length;
    const score = Math.round((correctCount / questions.length) * 100);
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          padding: '36px 28px', 
          background: 'var(--white)', 
          borderRadius: '16px', 
          border: '1.5px solid var(--border)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Hasil Evaluasi</h2>
          
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: score >= 70 ? 'var(--success)' : 'var(--primary)', 
              color: '#ffffff', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 6px 16px -4px rgba(0,0,0,0.15)'
            }}>
              <span style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1, color: '#ffffff' }}>{score}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', opacity: 1, marginTop: '4px' }}>Skor</span>
            </div>
          </div>
          
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Benar <span style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: 700 }}>{correctCount}</span> dari <span style={{ fontWeight: 700 }}>{questions.length}</span> soal
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Pembahasan Soal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, i) => {
              const ans = answers[i];
              const isCorrect = checkIsCorrect(q, ans);
              return (
                <div key={i} style={{ 
                  border: `1.5px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`, 
                  borderRadius: '12px', 
                  padding: '16px',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCorrect ? 'var(--success)' : 'var(--danger)', color: 'white',
                      fontSize: '14px', fontWeight: 700
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{q.text}</p>
                      
                      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Jawaban Anda: </span>
                        <strong style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                          {getUserAnswerLabel(q, ans)}
                        </strong>
                      </div>

                      {!isCorrect && (
                        <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Jawaban Benar: </span>
                          <strong style={{ color: 'var(--success)' }}>
                            {getCorrectAnswerLabel(q)}
                          </strong>
                        </div>
                      )}

                      {q.explanation && (
                        <div style={{ 
                          marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.03)', 
                          borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)',
                          lineHeight: 1.5
                        }}>
                          <strong>Penjelasan:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ 
          background: '#F8FAFC', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          marginBottom: '28px' 
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-notebook" style={{ color: 'var(--primary)', fontSize: '18px' }}></i> Refleksi Pembelajaran
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>
            Tuliskan secara singkat apa yang telah Anda pelajari atau pemahaman baru yang Anda dapatkan dari modul ini.
          </p>
          <textarea 
            className="form-input" 
            rows={4} 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Tulis refleksi Anda di sini..."
            style={{ 
              width: '100%', 
              resize: 'none', 
              background: 'white', 
              borderRadius: '10px', 
              border: '1.5px solid var(--border)', 
              padding: '12px 14px', 
              fontSize: '14px', 
              lineHeight: '1.5',
              transition: 'all 0.2s',
              outline: 'none',
              minHeight: '90px'
            }}
          ></textarea>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => onComplete(reflection)} 
            disabled={!reflection.trim()}
            style={{ width: '100%', justifyContent: 'center', height: '46px', fontWeight: 600, fontSize: '15px' }}
          >
            Selesaikan Modul
          </button>
          
          <button 
            className="btn btn-ghost" 
            onClick={handleRetry} 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              height: '44px', 
              border: '1px solid var(--primary)', 
              color: 'var(--primary)',
              fontWeight: 600,
              background: 'transparent',
              fontSize: '14px',
              borderRadius: '8px'
            }}
          >
            <i className="ti ti-rotate-clockwise" style={{ marginRight: '6px', fontSize: '16px' }}></i> Ulangi Soal Evaluasi
          </button>
        </div>
      </motion.div>
    );
  }

  // --- FLOW C: ACTIVE QUIZ STEPS ---
  const q = questions[currentIndex];
  if (!q) return null;
  const qType = q.type || 'multiple_choice';

  const isNextDisabled = () => {
     const ans = answers[currentIndex];
     if (qType === 'short_answer' || qType === 'essay') return !ans;
     if (qType === 'multiple_select') return !ans || ans.length === 0;
     if (qType === 'matching') {
        const pairs = q.pairs || [];
        for (const p of pairs) {
           if (!ans || !ans[p.left]) return true;
        }
        return false;
     }
     if (qType === 'ordering') return !ans || ans.length === 0;
     return ans === undefined;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        padding: '28px 24px', 
        background: 'var(--white)', 
        borderRadius: '16px', 
        border: '1.5px solid var(--border)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Soal {currentIndex + 1} dari {questions.length}
        </span>
        <span className="badge badge-primary" style={{ fontSize: '11px', padding: '4px 8px' }}>Evaluasi</span>
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '20px', lineHeight: 1.5, color: 'var(--text)' }}>
        {q.text}
      </h3>
      {qType === 'multiple_select' && (
         <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
           *Pilih semua jawaban yang benar (bisa lebih dari satu).
         </p>
      )}
      {qType === 'matching' && (
         <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
           *Pilih pasangan yang tepat untuk setiap item di sebelah kiri.
         </p>
      )}
      {qType === 'ordering' && (
         <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
           *Gunakan tombol panah atas/bawah untuk mengatur item ke dalam urutan yang benar.
         </p>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {qType === 'multiple_choice' && q.options?.map((opt: string, i: number) => {
          const isSelected = answers[currentIndex] === i;
          let bgColor = 'transparent';
          let borderColor = 'var(--border)';
          let textColor = 'var(--text)';
          
          if (isSelected) {
            bgColor = 'rgba(59, 130, 246, 0.08)';
            borderColor = 'var(--primary)';
            textColor = 'var(--primary-dark)';
          }

          return (
            <div 
              key={i}
              onClick={() => handleSelect(currentIndex, i)}
              style={{
                 padding: '14px 16px',
                 border: `2px solid ${borderColor}`,
                 borderRadius: '10px',
                 cursor: 'pointer',
                 background: bgColor,
                 color: textColor,
                 fontWeight: isSelected ? 600 : 500,
                 transition: 'all 0.2s ease',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 fontSize: '14px'
              }}
              className="hover-scale-subtle"
            >
              <span style={{ flex: 1, paddingRight: '8px' }}>
                <strong style={{ marginRight: '6px', opacity: 0.8 }}>{String.fromCharCode(65 + i)}.</strong> {opt}
              </span>
              {isSelected && <i className="ti ti-circle-check-filled" style={{ fontSize: '18px', color: 'var(--primary)' }}></i>}
            </div>
          )
        })}

        {qType === 'multiple_select' && q.options?.map((opt: string, i: number) => {
          const isSelected = (answers[currentIndex] || []).includes(i);
          let bgColor = 'transparent';
          let borderColor = 'var(--border)';
          let textColor = 'var(--text)';
          
          if (isSelected) {
            bgColor = 'rgba(59, 130, 246, 0.08)';
            borderColor = 'var(--primary)';
            textColor = 'var(--primary-dark)';
          }

          return (
            <div 
              key={i}
              onClick={() => handleSelect(currentIndex, i)}
              style={{
                 padding: '14px 16px',
                 border: `2px solid ${borderColor}`,
                 borderRadius: '10px',
                 cursor: 'pointer',
                 background: bgColor,
                 color: textColor,
                 fontWeight: isSelected ? 600 : 500,
                 transition: 'all 0.2s ease',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 fontSize: '14px'
              }}
              className="hover-scale-subtle"
            >
              <span style={{ flex: 1, paddingRight: '8px' }}>
                <strong style={{ marginRight: '6px', opacity: 0.8 }}>{String.fromCharCode(65 + i)}.</strong> {opt}
              </span>
              {isSelected ? <i className="ti ti-square-check-filled" style={{ fontSize: '18px', color: 'var(--primary)' }}></i> : <i className="ti ti-square" style={{ fontSize: '18px', color: 'var(--border)' }}></i>}
            </div>
          )
        })}

        {qType === 'true_false' && [true, false].map((val, i) => {
          const isSelected = answers[currentIndex] === val;
          let bgColor = 'transparent';
          let borderColor = 'var(--border)';
          let textColor = 'var(--text)';
          
          if (isSelected) {
            bgColor = 'rgba(59, 130, 246, 0.08)';
            borderColor = 'var(--primary)';
            textColor = 'var(--primary-dark)';
          }

          return (
            <div 
              key={i}
              onClick={() => handleSelect(currentIndex, val)}
              style={{
                 padding: '14px 16px',
                 border: `2px solid ${borderColor}`,
                 borderRadius: '10px',
                 cursor: 'pointer',
                 background: bgColor,
                 color: textColor,
                 fontWeight: isSelected ? 600 : 500,
                 transition: 'all 0.2s ease',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 fontSize: '14px'
              }}
              className="hover-scale-subtle"
            >
              <span style={{ flex: 1, paddingRight: '8px' }}>
                {val ? 'Benar' : 'Salah'}
              </span>
              {isSelected && <i className="ti ti-circle-check-filled" style={{ fontSize: '18px', color: 'var(--primary)' }}></i>}
            </div>
          )
        })}

        {(qType === 'short_answer' || qType === 'essay') && (
           <div>
             {qType === 'essay' ? (
                <textarea className="form-input" placeholder="Ketik jawaban uraian Anda di sini..." 
                  value={answers[currentIndex] || ''} 
                  onChange={e => handleSelect(currentIndex, e.target.value)} 
                  style={{ width: '100%', padding: '12px', minHeight: '100px', resize: 'none' }}
                />
             ) : (
                <input type="text" className="form-input" placeholder="Ketik jawaban Anda di sini..." 
                  value={answers[currentIndex] || ''} 
                  onChange={e => handleSelect(currentIndex, e.target.value)} 
                  style={{ width: '100%', padding: '12px' }}
                />
             )}
           </div>
        )}

        {qType === 'matching' && q.pairs?.map((pair: any, i: number) => {
           const currentAns = (answers[currentIndex] || {})[pair.left] || '';
           return (
             <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
               <span style={{ flex: 1, fontWeight: 500, fontSize: '14px' }}>{pair.left}</span>
               <i className="ti ti-arrow-right" style={{ color: 'var(--text-muted)' }}></i>
               <select 
                 className="form-input" 
                 style={{ flex: 1, margin: 0, padding: '10px' }}
                 value={currentAns}
                 onChange={e => {
                    const newAns = { ...(answers[currentIndex] || {}) };
                    newAns[pair.left] = e.target.value;
                    handleSelect(currentIndex, newAns);
                 }}
               >
                 <option value="" disabled>-- Pilih Pasangan --</option>
                 {(shuffledRights[currentIndex] || []).map((r: string, rIdx: number) => (
                    <option key={rIdx} value={r}>{r}</option>
                 ))}
               </select>
             </div>
           );
        })}

        {qType === 'ordering' && (answers[currentIndex] || []).map((item: string, i: number) => (
           <div key={item + i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button disabled={i === 0} onClick={() => {
                   const newArr = [...answers[currentIndex]];
                   [newArr[i-1], newArr[i]] = [newArr[i], newArr[i-1]];
                   handleSelect(currentIndex, newArr);
                }} style={{ cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.3 : 1, background: 'none', border: 'none', padding: 0, color: 'var(--text)' }}><i className="ti ti-chevron-up"></i></button>
                <button disabled={i === answers[currentIndex].length - 1} onClick={() => {
                   const newArr = [...answers[currentIndex]];
                   [newArr[i+1], newArr[i]] = [newArr[i], newArr[i+1]];
                   handleSelect(currentIndex, newArr);
                }} style={{ cursor: i === answers[currentIndex].length - 1 ? 'not-allowed' : 'pointer', opacity: i === answers[currentIndex].length - 1 ? 0.3 : 1, background: 'none', border: 'none', padding: 0, color: 'var(--text)' }}><i className="ti ti-chevron-down"></i></button>
             </div>
             <span style={{ fontWeight: 600, fontSize: '14px', width: '20px' }}>{i + 1}.</span>
             <span style={{ flex: 1 }}>{item}</span>
           </div>
        ))}

      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-primary" 
          disabled={isNextDisabled()} 
          onClick={handleNext}
          style={{ minWidth: '130px', height: '40px', fontWeight: 600 }}
        >
          {currentIndex < questions.length - 1 ? (
            <>Selanjutnya <i className="ti ti-arrow-right" style={{ marginLeft: '4px' }}></i></>
          ) : (
            'Lihat Hasil'
          )}
        </button>
      </div>
    </motion.div>
  );
}
