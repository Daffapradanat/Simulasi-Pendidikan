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
  const studentId = (user as any)?.nisn || (user ? `ID-${String(user.id).padStart(5, '0')}` : 'NISN. 0089274192');
  const schoolName = (user as any)?.school || 'SMA / SMK / MA Pembelajar Mandiri';
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const docNumber = `421.1/PUSMENDIK/SIM-SAINS/${new Date().getFullYear()}/${String(module?.id || 1).padStart(4, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  const getPredicate = (s: number) => {
    if (s >= 85) return { grade: 'A', label: 'Sangat Baik (Istimewa)', color: '#15803d', bg: '#dcfce7' };
    if (s >= 70) return { grade: 'B', label: 'Baik (Kompetensi Tuntas)', color: '#1d4ed8', bg: '#eff6ff' };
    if (s >= 55) return { grade: 'C', label: 'Cukup (Perlu Pemantapan)', color: '#b45309', bg: '#fef3c7' };
    return { grade: 'D', label: 'Perlu Bimbingan & Remidi', color: '#be123c', bg: '#ffe4e6' };
  };

  const pred = getPredicate(score);

  return (
    <div className="pdf-modal-backdrop" onClick={onClose}>
      <div 
        className="pdf-modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOOLBAR ATAS MODAL ── */}
        <div className="pdf-modal-toolbar no-print">
          <div className="pdf-toolbar-info">
            <i className="ti ti-file-certificate" style={{ fontSize: '20px', color: '#0d47a1' }}></i>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                Pratinjau Dokumen Resmi PDF (Ukuran Standar A4)
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Kementerian Pendidikan Dasar dan Menengah • Pusat Asesmen Pendidikan
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
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13, 71, 161, 0.25)'
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

        {/* ── SCROLLABLE PREVIEW VIEWPORT ── */}
        <div className="pdf-modal-viewport">
          <div 
            ref={printContainerRef}
            id="printable-sheet" 
            className="a4-sheet-paper"
          >
            {/* ── 1. KOP SURAT RESMI KEMENDIKDASMEN & PUSMENDIK ── */}
            <div className="kemdikdasmen-kop">
              {/* Logo Kiri: Tut Wuri Handayani (Kemendikdasmen) */}
              <div className="kop-logo-box">
                <img 
                  src="/tutwurihandayani_Icon.png" 
                  alt="Logo Tut Wuri Handayani Kemendikdasmen" 
                  className="kop-logo-img"
                  onError={(e) => {
                    // Fallback jika path relative berbeda
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('Pusmendik')) {
                      target.src = '/tutwurihandayani_Icon.png';
                    }
                  }}
                />
              </div>

              {/* Teks Identitas Instansi Resmi */}
              <div className="kop-text-box">
                <h2 className="kop-instansi-1">KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</h2>
                <h3 className="kop-instansi-2">BADAN STANDAR, KURIKULUM, DAN ASESMEN PENDIDIKAN</h3>
                <h4 className="kop-instansi-3">PUSAT ASESMEN PENDIDIKAN (PUSMENDIK)</h4>
                <p className="kop-address">
                  Kompleks Kemendikdasmen Gedung E Lantai 19, Jl. Jenderal Sudirman Senayan, Jakarta Pusat 10270
                </p>
                <p className="kop-contact">
                  Laman Resmi: <u>https://pusmendik.kemdikbud.go.id</u> | Pos-el: pusmendik@kemdikbud.go.id
                </p>
              </div>

              {/* Logo Kanan: Pusmendik */}
              <div className="kop-logo-box right">
                <img 
                  src="/Pusmendik.jpg" 
                  alt="Logo Pusmendik Asesmen Pendidikan" 
                  className="kop-logo-img pusmendik-logo"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/Pusmendik-dashboard.png';
                  }}
                />
              </div>
            </div>

            {/* Garis Ganda Pembatas Kop Surat Resmi (Double Line) */}
            <div className="kop-divider-double"></div>

            {/* ── 2. JUDUL LEMBAR DOKUMEN LAPORAN ── */}
            <div className="pdf-doc-title-section">
              <h1 className="pdf-doc-main-title">
                LEMBAR LAPORAN ASESMEN & EVALUASI PEMBELAJARAN
              </h1>
              <div className="pdf-doc-sub-title">
                Platform Laboratorium Digital & Eksperimen Simulasi Sains Mandiri
              </div>
              <div className="pdf-doc-reg-number">
                Nomor Registrasi: <strong>{docNumber}</strong>
              </div>
            </div>

            {/* ── 3. TABEL IDENTITAS SISWA & METADATA MODUL ── */}
            <div className="pdf-section-box">
              <div className="pdf-section-header">
                I. IDENTITAS PESERTA DIDIK DAN MODUL PEMBELAJARAN
              </div>
              <table className="pdf-table-grid identity-table">
                <tbody>
                  <tr>
                    <td className="meta-lbl" style={{ width: '18%' }}>Nama Lengkap Siswa</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val" style={{ width: '32%', fontWeight: 700, textTransform: 'uppercase' }}>
                      {studentName}
                    </td>
                    <td className="meta-lbl" style={{ width: '18%' }}>Mata Pelajaran</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val" style={{ width: '30%', fontWeight: 600 }}>
                      {module?.subject || 'Fisika / Sains'}
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-lbl">Nomor Induk / NISN</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val">{studentId}</td>
                    <td className="meta-lbl">Judul Modul</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val" style={{ fontWeight: 600 }}>{module?.title || '-'}</td>
                  </tr>
                  <tr>
                    <td className="meta-lbl">Satuan Pendidikan</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val">{schoolName}</td>
                    <td className="meta-lbl">Jenjang / Fase</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val">{module?.level || 'Fase E / Kelas 10'}</td>
                  </tr>
                  <tr>
                    <td className="meta-lbl">Tanggal Pengerjaan</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val">{currentDate}</td>
                    <td className="meta-lbl">Alokasi / Waktu</td>
                    <td className="meta-sep">:</td>
                    <td className="meta-val">{module?.duration || '45 Menit'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── 4. REKAPITULASI HASIL CAPAIAN KOMPETENSI ── */}
            <div className="pdf-section-box">
              <div className="pdf-section-header">
                II. REKAPITULASI CAPAIAN HASIL ASESMEN EVALUASI
              </div>
              <table className="pdf-table-grid score-summary-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Nilai Akhir (Skor)</th>
                    <th style={{ width: '18%' }}>Status Kelulusan</th>
                    <th style={{ width: '16%' }}>Predikat Capaian</th>
                    <th style={{ width: '16%' }}>Jawaban Benar</th>
                    <th style={{ width: '16%' }}>Perlu Dibenahi</th>
                    <th style={{ width: '16%' }}>Tingkat Akurasi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="score-cell-primary">
                      <span className="score-big-number">{score}</span>
                      <span className="score-scale-text"> / 100</span>
                    </td>
                    <td>
                      <span className={`status-badge-pdf ${score >= 70 ? 'tuntas' : 'remidi'}`}>
                        {score >= 70 ? '✓ TUNTAS (MEMENUHI KKTP)' : '⚠ PERLU PENGAYAAN / REMIDI'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      <span style={{ color: pred.color }}>{pred.grade} ({pred.label.split(' ')[0]})</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#15803d' }}>
                      {correctCount} dari {questions.length} Butir
                    </td>
                    <td style={{ fontWeight: 700, color: '#be123c' }}>
                      {questions.length - correctCount} Butir
                    </td>
                    <td style={{ fontWeight: 700, color: '#0d47a1' }}>
                      {score}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── 5. TABEL ANALISIS BUTIR SOAL, JAWABAN & PEMBAHASAN LENGKAP ── */}
            <div className="pdf-section-box print-avoid-break">
              <div className="pdf-section-header">
                III. MATRIKS ANALISIS BUTIR PERTANYAAN & KUNCI PEMBENARAN ILMIAH
              </div>
              
              <table className="pdf-table-grid analysis-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>No.</th>
                    <th style={{ width: '38%' }}>Butir Pertanyaan & Tipe Asesmen</th>
                    <th style={{ width: '22%' }}>Jawaban Peserta Didik</th>
                    <th style={{ width: '22%' }}>Kunci Jawaban Resmi</th>
                    <th style={{ width: '13%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => {
                    const ans = answers[idx];
                    const isCorrect = checkIsCorrect(q, ans);
                    const qType = q.type || 'multiple_choice';
                    const typeLabel = qType === 'multiple_choice' ? 'Pilihan Ganda' :
                                      qType === 'multiple_select' ? 'Pilihan Ganda Kompleks' :
                                      qType === 'true_false' ? 'Benar / Salah' :
                                      qType === 'short_answer' ? 'Isian Singkat' :
                                      qType === 'essay' ? 'Uraian Singkat' :
                                      qType === 'matching' ? 'Menjodohkan' : 'Mengurutkan';

                    return (
                      <React.Fragment key={idx}>
                        <tr className={`question-row ${isCorrect ? 'row-correct' : 'row-incorrect'} print-avoid-break`}>
                          <td style={{ textAlign: 'center', fontWeight: 800, verticalAlign: 'top' }}>
                            {idx + 1}
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            <div className="q-type-badge-pdf">{typeLabel}</div>
                            <div className="q-text-pdf">{q.text}</div>
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            <div className={`user-ans-text ${isCorrect ? 'ans-correct' : 'ans-wrong'}`}>
                              {getUserAnswerLabel(q, ans)}
                            </div>
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            <div className="correct-ans-text">
                              {getCorrectAnswerLabel(q)}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                            <span className={`ans-status-tag ${isCorrect ? 'tag-correct' : 'tag-wrong'}`}>
                              {isCorrect ? '✓ BENAR' : '✗ SALAH'}
                            </span>
                          </td>
                        </tr>
                        {/* Baris Penjelasan Ilmiah jika ada */}
                        {q.explanation && (
                          <tr className="explanation-row print-avoid-break">
                            <td></td>
                            <td colSpan={4} className="explanation-cell">
                              <strong>Pembahasan & Konsep Sains: </strong>
                              <span>{q.explanation}</span>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── 6. CATATAN REFLEKSI BELAJAR SISWA ── */}
            {reflection && (
              <div className="pdf-section-box print-avoid-break">
                <div className="pdf-section-header">
                  IV. CATATAN REFLEKSI PEMBELAJARAN & EKSPERIMEN MANDIRI
                </div>
                <div className="reflection-box-pdf">
                  <div className="reflection-quote-symbol">“</div>
                  <div className="reflection-content-pdf">{reflection}</div>
                </div>
              </div>
            )}

            {/* ── 7. LEMBAR PENGESAHAN & TANDA TANGAN FORMAL ── */}
            <div className="pdf-signature-section print-avoid-break">
              <div className="sig-place-date">
                Diterbitkan secara elektronik pada: <strong>{currentDate}</strong>
              </div>

              <div className="signature-columns-grid">
                {/* Kolom Siswa */}
                <div className="signature-col">
                  <div className="sig-role-title">Peserta Didik Pembelajar,</div>
                  <div className="sig-space">
                    <div className="sig-digital-mark">TERVERIFIKASI SISTEM</div>
                  </div>
                  <div className="sig-person-name">{studentName}</div>
                  <div className="sig-person-id">NISN / ID: {studentId}</div>
                </div>

                {/* Kolom Verifikasi QR Code Resmi */}
                <div className="signature-col qr-col">
                  <div className="qr-box-pdf">
                    <div className="qr-simulated-graphic">
                      <i className="ti ti-qrcode" style={{ fontSize: '42px', color: '#0d47a1' }}></i>
                    </div>
                    <div className="qr-caption">
                      KEASLIAN DOKUMEN TERVERIFIKASI PUSMENDIK KEMENDIKDASMEN
                    </div>
                  </div>
                </div>

                {/* Kolom Guru Pembimbing */}
                <div className="signature-col">
                  <div className="sig-role-title">Guru Pengampu / Kepala Laboratorium,</div>
                  <div className="sig-space"></div>
                  <div className="sig-person-name">( ..................................................... )</div>
                  <div className="sig-person-id">NIP. ....................................................</div>
                </div>
              </div>
            </div>

            {/* ── 8. FOOTER DOKUMEN RESMI ── */}
            <div className="pdf-official-footer print-avoid-break">
              <div className="footer-left">
                Dokumen ini merupakan bukti capaian asesmen berbasis simulasi digital Kemendikdasmen RI.
              </div>
              <div className="footer-right">
                Halaman 1 / 1 • Dicetak Otomatis
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
