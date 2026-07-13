import React, { useState } from 'react';
import { motion } from 'motion/react';

export function QuestionsView({ questions, onComplete }: { questions: any[], onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [hasChecked, setHasChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);

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

  if (showResult) {
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length;
    return (
      <div style={{ padding: '32px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Hasil Evaluasi</h2>
        <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
          {Math.round((correctCount / questions.length) * 100)}
        </div>
        <div style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Benar {correctCount} dari {questions.length} soal
        </div>

        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Refleksi Pembelajaran</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>Tuliskan secara singkat apa yang telah Anda pelajari dari modul ini.</p>
          <textarea 
            className="input" 
            rows={4} 
            placeholder="Tulis refleksi Anda di sini..."
            style={{ width: '100%', resize: 'vertical' }}
          ></textarea>
        </div>

        <button className="btn btn-primary" onClick={onComplete} style={{ width: '100%', justifyContent: 'center' }}>Selesaikan Modul</button>
      </div>
    );
  }

  const q = questions[currentIndex];
  
  if (!q) return null;

  return (
    <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Soal {currentIndex + 1} dari {questions.length}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>{q.text}</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {q.options.map((opt: string, i: number) => {
          const isSelected = answers[currentIndex] === i;
          const isCorrect = hasChecked && q.correctAnswerIndex === i;
          const isWrong = hasChecked && isSelected && q.correctAnswerIndex !== i;
          
          let bgColor = isSelected ? 'var(--primary-light)' : 'transparent';
          let borderColor = isSelected ? 'var(--primary)' : 'var(--border)';
          let textColor = isSelected ? 'white' : 'inherit';
          
          if (hasChecked) {
             if (isCorrect) {
                bgColor = 'var(--success)';
                borderColor = 'var(--success)';
                textColor = 'white';
             } else if (isWrong) {
                bgColor = 'var(--danger)';
                borderColor = 'var(--danger)';
                textColor = 'white';
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
                 padding: '16px', 
                 border: `2px solid ${borderColor}`, 
                 borderRadius: '8px', 
                 cursor: hasChecked ? 'default' : 'pointer',
                 background: bgColor,
                 color: textColor,
                 fontWeight: isSelected || isCorrect ? 600 : 400,
                 transition: 'all 0.2s ease'
              }}
            >
              {String.fromCharCode(65 + i)}. {opt}
              {isCorrect && <i className="ti ti-check" style={{ float: 'right', fontSize: '18px' }}></i>}
              {isWrong && <i className="ti ti-x" style={{ float: 'right', fontSize: '18px' }}></i>}
            </div>
          )
        })}
      </div>
      
      {hasChecked && q.explanation && (
        <div style={{ padding: '16px', background: '#F8F9FA', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid var(--accent)' }}>
           <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Penjelasan:</h4>
           <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{q.explanation}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!hasChecked ? (
          <button 
            className="btn btn-primary" 
            disabled={answers[currentIndex] === undefined} 
            onClick={handleCheck}
          >
            Cek Jawaban
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
          >
            {currentIndex < questions.length - 1 ? 'Selanjutnya' : 'Selesai'}
          </button>
        )}
      </div>
    </div>
  );
}
