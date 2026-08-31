import React, { useRef } from 'react';
import { Module, User } from '../../types';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  module?: Module;
  user?: User | null;
  questions: any[];
  answers: Record<number, any>;
  score: number;
  correctCount: number;
  reflection: string;
  checkIsCorrect: (q: any, ans: any) => boolean;
  getUserAnswerLabel: (q: any, ans: any) => string;
  getCorrectAnswerLabel: (q: any) => string;
}

export function PdfReportModal({
  isOpen,
  onClose,
  module,
  user,
  questions,
  answers,
  score,
  correctCount,
  reflection,
  checkIsCorrect,
  getUserAnswerLabel,
  getCorrectAnswerLabel
}: PdfReportModalProps) {
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const studentName = user?.name || 'Siswa Pembelajar';
  const currentDate迷 = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const subjectTitle = module?.subject ? `${module.subject} - ${module.title}` : (module?.title || 'Modul Evaluasi Sains');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pdf-modal-backdrop" onClick={onClose}>
      <div 
        className="pdf-modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOOLBAR ATAS MODAL (TIDAK IKUT DICETAK) ── */}
        <div className="pdf-modal-toolbar no-print">
          <div className="pdf-toolbar-info">
            <i className="ti ti-file-text" style={{ fontSize: '20px', color: '#0d47a1' }}></i>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                Pratinjau Lembar Soal & Nilai Evaluasi (A4 / PDF)
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Format bersih & siap cetak langsung / Simpan sebagai PDF
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              id="btn-print-pdf-direct"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{
                background: '#0d47a1',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <i className="ti ti-printer" style={{ fontSize: '17px' }}></i> Cetak / Simpan PDF
            </button>

            <button 
              id="btn-close-pdf-modal"
              className="btn btn-ghost"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <i className="ti ti-x" style={{ fontSize: '16px' }}></i> Tutup
            </button>
          </div>
        </div>

        {/* ── VIEWPORT DOKUMEN CETAK A4 ── */}
        <div className="pdf-modal-viewport">
          <div 
            ref={printContainerRef}
            id="printable-sheet" 
            className="a4-clean-sheet"
          >
            {/* ── KOP RESMI SEDERHANA KEMENDIKDASMEN ── */}
            <div className="clean-kop-wrapper">
              <img 
                src="/tutwurihandayani_Icon.png" 
                alt="Logo Kemendikdasmen" 
                className="clean-kop-logo"
              />
              <div className="clean-kop-text">
                <div className="clean-kop-title">KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</div>
                <div className="clean-kop-subtitle">LEMBAR HASIL EVALUASI PEMBELAJARAN SISWA</div>
              </div>
            </div>

            <div className="clean-kop-divider"></div>

            {/* ── TABEL INFO SISWA & NILAI (RINGKAS & JELAS) ── */}
            <table className="clean-info-table">
              <tbody>
                <tr>
                  <td style={{ width: '130px', fontWeight: 'bold' }}>Nama Siswa</td>
                  <td style={{ width: '10px' }}>:</td>
                  <td style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{studentName}</td>
                  <td style={{ width: '110px', fontWeight: 'bold' }}>Tanggal</td>
                  <td style={{ width: '10px' }}>:</td>
                  <td>{currentDate迷}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Mata Pelajaran</td>
                  <td>:</td>
                  <td>{subjectTitle}</td>
                  <td style={{ fontWeight: 'bold' }}>Nilai / Skor</td>
                  <td>:</td>
                  <td>
                    <span className="clean-score-pill">
                      {score} / 100
                    </span>
                    <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 600 }}>
                      ({correctCount} Benar dari {questions.length} Soal)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="clean-section-divider"></div>

            {/* ── DAFTAR SELURUH SOAL & JAWABAN ── */}
            <div className="clean-questions-list">
              <div className="clean-list-heading">DAFTAR SOAL & HASIL JAWABAN:</div>

              {questions.map((q, idx) => {
                const ans迷 = answers[idx];
                const isCorrect = checkIsCorrect(q, ans迷);
                const qType = q.type || 'multiple_choice';
                const typeLabel = qType === 'multiple_choice' ? 'Pilihan Ganda' :
                                  qType === 'multiple_select' ? 'Pilihan Ganda Kompleks' :
                                  qType === 'true_false' ? 'Benar / Salah' :
                                  qType === 'short_answer' ? 'Isian Singkat' :
                                  qType === 'essay' ? 'Uraian Singkat' :
                                  qType === 'matching' ? 'Menjodohkan' : 'Mengurutkan';

                return (
                  <div key={idx} className="clean-q-item print-avoid-break">
                    <div className="clean-q-header">
                      <span className="clean-q-num">Soal No. {idx + 1} ({typeLabel})</span>
                      <span className={`clean-status-tag ${isCorrect ? 'status-correct' : 'status-wrong'}`}>
                        {isCorrect ? '[ BENAR ✓ ]' : '[ SALAH ✗ ]'}
                      </span>
                    </div>

                    <div className="clean-q-prompt">
                      {q.text}
                    </div>

                    <div className="clean-ans-block">
                      <div className="clean-ans-row">
                        <span className="clean-ans-label">Jawaban Siswa:</span>
                        <span className={`clean-ans-value ${isCorrect ? 'ans-correct-txt' : 'ans-wrong-txt'}`}>
                          {getUserAnswerLabel(q, ans迷)}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="clean-ans-row">
                          <span className="clean-ans-label">Kunci Jawaban Benar:</span>
                          <span className="clean-ans-value ans-key-txt">
                            {getCorrectAnswerLabel(q)}
                          </span>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="clean-explanation">
                          <strong>Pembahasan: </strong>{q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── CATATAN REFLEKSI SISWA (JIKA ADA) ── */}
            {reflection && (
              <div className="clean-reflection-box print-avoid-break">
                <div className="clean-reflection-title">Catatan Refleksi Siswa:</div>
                <div className="clean-reflection-text">
                  "{reflection}"
                </div>
              </div>
            )}

            {/* Footer Lembar Dokumen */}
            <div className="clean-sheet-footer print-avoid-break">
              <span>Platform Laboratorium Digital & Sains Terbuka Kemendikdasmen RI</span>
              <span>Halaman 1 dari 1</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
