import React, { useState } from 'react';
import { motion } from 'motion/react';

export function QuestionsView({ questions = [], onComplete }: { questions: any[], onComplete: (reflection: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [hasChecked, setHasChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [reflection, setReflection] = useState('');

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (hasChecked) return;
    setAnswers({ ...answers, [qIndex]: oIndex });
  };

  const handleCheck = () => {
    setHasChecked(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHasChecked(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setHasChecked(false);
    setShowResult(false);
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
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length;
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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {q.options.map((opt: string, i: number) => {
          const isSelected = answers[currentIndex] === i;
          const isCorrect = hasChecked && q.correctAnswerIndex === i;
          const isWrong = hasChecked && isSelected && q.correctAnswerIndex !== i;
          
          let bgColor = 'transparent';
          let borderColor = 'var(--border)';
          let textColor = 'var(--text)';
          let cursorStyle = 'pointer';
          let hoverStyle = {};
          
          if (isSelected) {
            bgColor = 'rgba(59, 130, 246, 0.08)';
            borderColor = 'var(--primary)';
            textColor = 'var(--primary-dark)';
          }

          if (hasChecked) {
             cursorStyle = 'default';
             if (isCorrect) {
                bgColor = 'rgba(16, 185, 129, 0.12)';
                borderColor = 'var(--success)';
                textColor = 'var(--success)';
             } else if (isWrong) {
                bgColor = 'rgba(239, 68, 68, 0.12)';
                borderColor = 'var(--danger)';
                textColor = 'var(--danger)';
             } else if (isSelected) {
                // selected but wrong, and not correct option
                bgColor = '#F1F5F9';
                borderColor = '#CBD5E1';
                textColor = '#64748B';
             } else {
                bgColor = 'transparent';
                borderColor = 'var(--border)';
                textColor = 'var(--text-muted)';
             }
          }

          return (
            <div 
              key={i}
              onClick={() => handleSelect(currentIndex, i)}
              style={{ 
                 padding: '14px 16px', 
                 border: `2px solid ${borderColor}`, 
                 borderRadius: '10px', 
                 cursor: cursorStyle,
                 background: bgColor,
                 color: textColor,
                 fontWeight: isSelected || isCorrect ? 600 : 500,
                 transition: 'all 0.2s ease',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 fontSize: '14px'
              }}
              className={!hasChecked ? "hover-scale-subtle" : ""}
            >
              <span style={{ flex: 1, paddingRight: '8px' }}>
                <strong style={{ marginRight: '6px', opacity: 0.8 }}>{String.fromCharCode(65 + i)}.</strong> {opt}
              </span>
              {isCorrect && <i className="ti ti-circle-check-filled" style={{ fontSize: '18px', color: 'var(--success)' }}></i>}
              {isWrong && <i className="ti ti-circle-x-filled" style={{ fontSize: '18px', color: 'var(--danger)' }}></i>}
            </div>
          )
        })}
      </div>
      
      {hasChecked && q.explanation && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            padding: '14px 16px', 
            background: '#F8FAFC', 
            borderRadius: '10px', 
            marginBottom: '24px', 
            borderLeft: '4px solid var(--primary)',
            fontSize: '13px'
          }}
        >
           <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: 'var(--text)' }}>Penjelasan:</h4>
           <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5 }}>{q.explanation}</p>
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!hasChecked ? (
          <button 
            className="btn btn-primary" 
            disabled={answers[currentIndex] === undefined} 
            onClick={handleCheck}
            style={{ minWidth: '130px', height: '40px', fontWeight: 600 }}
          >
            Cek Jawaban
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            style={{ minWidth: '130px', height: '40px', fontWeight: 600 }}
          >
            {currentIndex < questions.length - 1 ? (
              <>Selanjutnya <i className="ti ti-arrow-right" style={{ marginLeft: '4px' }}></i></>
            ) : (
              'Lihat Hasil'
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
