# Rencana Implementasi: Peningkatan Platform Simulasi Sains Pendidikan

Rencana ini merinci perbaikan stabilitas simulasi, persistensi state evaluasi soal, pembaruan alur UX modul, serta standardisasi terminologi dan formulir administrasi.

## User Review & Critical Decisions

> [!IMPORTANT] Ringkasan Keputusan yang Dikonfirmasi
> - **Format Soal Tabel Benar/Salah**: Satu nomor soal menampilkan tabel beberapa baris pernyataan ilmiah dengan dua kolom pilihan radio (*Benar* dan *Salah*) untuk setiap baris pernyataan.
> - **Akses Materi & Sistem Kunci**: Semua materi pada kartu modul dapat dibuka dan dibaca bebas oleh siswa sejak awal (*Materi & Glosarium* terbuka), namun akses evaluasi/kuis dan kelulusan modul tetap mengikuti sistem prasyarat berurutan.
> - **Field Urutan Modul**: Admin dan Guru dapat menginputkan angka urutan modul secara manual di formulir tambah/edit modul, dan modul diurutkan berdasarkan angka tersebut.

---

## 1. Overview & Core Concept

- **Tujuan Utama**: Meningkatkan keandalan pemutaran simulasi interaktif sains (Unity/WebGL), mencegah hilangnya progres pengerjaan soal saat siswa berpindah tab/simulasi, serta menghadirkan antarmuka pengelolaan modul yang intuitif dan terstandardisasi.
- **Sasaran Pengguna**: Siswa sekolah (jenjang SD/SMP/SMA/SMK) yang mempelajari modul sains interaktif, serta Guru dan Administrator Pusmendik yang menyusun konten pembelajaran.
- **Nilai Edukatif**: Memastikan simulasi sains berjalan stabil tanpa interupsi reload yang merusak proses eksperimen, serta menjaga integritas asesmen siswa.

---

## 2. User Experience & Visual Design

### A. Alur Modul & Kartu Siswa
1. **Pelepasan Banner Atas & Penambahan Badge Kartu Oranye**:
   - Banner besar *"Lanjutkan Sesi Terakhir"* di bagian atas dihilangkan.
   - Kartu modul yang sedang aktif dipelajari mendapatkan indikator visual berstatus:
     `Sedang Berjalan` dengan warna oranye (`#f97316` / `bg-orange-500`) dan ikon `ti ti-player-play`.
2. **Keterbukaan Materi Modul**:
   - Siswa dapat mengklik kartu modul mana saja untuk membaca konten *Materi Pembelajaran* & *Glosarium*.
   - Jika modul berstatus prasyarat belum tercapai, bagian evaluasi/kuis menampilkan penanda kunci yang jelas dan ramah.
3. **Terminologi Simulasi**:
   - Seluruh teks label *"Game"* diganti menjadi *"Simulasi"* (misal: `1 Simulasi`, `Simulasi Interaktif`, `Upload Simulasi`).

### B. Evaluasi & Soal Siswa
1. **Ketahanan State Pengerjaan**:
   - Saat siswa berpindah tab browser atau beralih antara melihat simulasi dan soal, nomor soal yang sedang dibuka (`currentIdx`) dan jawaban draf tidak akan reset ke nomor 1.
2. **Tombol Pengumpulan Soal Dinamis**:
   - Jika masih ada soal yang belum dijawab:
     Tombol dinonaktifkan bertuliskan:
     **"Jawab [X] soal lagi untuk bisa dikumpulkan"** (contoh: *Jawab 2 soal lagi untuk bisa dikumpulkan*).
   - Jika seluruh soal telah dijawab:
     Tombol berubah menjadi warna hijau (`#15803d` / emerald), aktif, dan bertuliskan:
     **"Selesaikan dan Kumpulkan"**.
3. **Format Tabel Benar / Salah untuk 1 Soal**:
   - Menampilkan tabel dengan kolom:
     | No | Pernyataan | Benar | Salah |
   - Setiap baris memiliki radio pilihan independen. Soal dianggap terjawab jika seluruh baris pernyataan telah ditentukan nilainya.

### C. Formulir Tambah & Edit Modul (Admin/Guru)
1. **Indikator Field Jelas (Wajib vs Opsional)**:
   - Field wajib diberi tanda `Wajib` dengan warna aksen tegas.
   - Field opsional diberi tanda `Opsional` dengan badge abu-abu halus.
2. **Field Urutan Modul**:
   - Menambahkan input angka `Urutan Modul` (default: angka urutan berikutnya) untuk menentukan posisi tampil di beranda siswa.
3. **Validasi Banner 5 MB**:
   - Batas unggah file banner diperketat dari 10 MB menjadi maksimal **5 MB** dengan pesan validasi yang jelas.

---

## 3. Key Product Decisions & Trade-Offs

| Masalah / Kebutuhan | Pendekatan Terpilih | Alasan & Manfaat |
| :--- | :--- | :--- |
| **Simulasi Terdownload Otomatis** | Pastikan header respons `Content-Disposition: inline` dan routing streaming langsung ke `index.html` modul WebGL | Browser tidak lagi memicu file download manager secara keliru; simulasi langsung berputar di dalam frame |
| **Simulasi Airbag Tiba-tiba Refresh** | Hapus listener `window.addEventListener('focus', fetchModules)` di `App.tsx` | Event focus browser memicu re-fetch modul setiap kali siswa beralih jendela/iframe, yang menyebabkan seluruh tree DOM me-render ulang |
| **Soal Reset ke Nomor 1 Saat Ganti Tab** | Simpan `currentIdx` di persistent storage `draft_question_idx_${userId}_${moduleId}` dan cegah reset effect | Siswa tidak kehilangan konteks soal nomor berapa yang sedang dikerjakan saat berpindah aplikasi atau tab |
| **Tabel Benar/Salah** | Struktur data matriks pernyataan: `statements: [{ text: string, isCorrect: boolean }]` | Standar asesmen asesmen kompetensi nasional (AKM/Pusmendik) yang menguji pemahaman konsep multi-aspek dalam 1 stimulus |
| **Akses Materi Terbuka** | Izinkan klik ke DetailView untuk semua modul; isolasi penguncian hanya pada pengerjaan evaluasi | Siswa dapat belajar materi kapan saja untuk persiapan, tanpa memblokir literasi sains |

---

## 4. Technical Architecture & Data Strategy

### A. Diagram Alur State & Komponen

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx (Root)                         │
│  - Hapus 'focus' listener yang merusak iframe               │
│  - Sortir modul berdasarkan field 'order_index'             │
│  - Tandai lastModuleId dengan status 'Sedang Berjalan'      │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       ModulesView.tsx        │ │        DetailView.tsx        │
│ - Badge oranye 'Sedang Berjalan'│ │ - Cegah unmount iframe      │
│ - Ubah label Game -> Simulasi│ │ - Materi selalu dapat dibaca │
│ - Buka klik kartu materi     │ │ - Simpan state tab aktif     │
└──────────────────────────────┘ └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │      QuestionsView.tsx       │
                                 │ - Persistensi currentIdx     │
                                 │ - Tipe Soal Tabel B/S        │
                                 │ - Tombol "Jawab X soal..."   │
                                 │ - Tombol hijau "Selesaikan & │
                                 │   Kumpulkan"                 │
                                 └──────────────────────────────┘
```

### B. Perubahan Model Data

1. **Module Entity (`types.ts` & `server.ts`)**:
   - `order_index`: `number` (urutan modul manual).
2. **Question Entity (`types.ts` & question handlers)**:
   - Dukungan tipe `table_true_false`:
     ```typescript
     {
       type: 'table_true_false',
       text: string, // Stimulus / pertanyaan pengantar
       statements: Array<{ id: string; text: string; isCorrect: boolean }>,
       explanation?: string
     }
     ```
3. **Formulir Admin (`ModulesAddEditView.tsx`)**:
   - Validasi file banner $\le 5\text{MB}$.
   - Label penjelas `Wajib` & `Opsional` pada seluruh input formulir.
   - Penggantian seluruh istilah antarmuka dari *Game* ke *Simulasi*.

---

## 5. Rencana Langkah Eksekusi

1. **Perbaikan Backend & Routing (`server.ts`)**:
   - Tambahkan dukungan field `order_index` pada schema SQLite dan endpoint CRUD modul.
   - Pastikan header penyajian file simulasi WebGL selalu `inline` tanpa memicu download browser.
2. **Perbaikan State Root & Event Window (`App.tsx`)**:
   - Hilangkan event listener `focus` yang menyebabkan refresh mendadak pada simulasi WebGL dan reset komponen.
   - Urutkan modul berdasarkan `order_index` saat dimuat.
3. **Pembaruan Kartu Modul & Navigasi (`ModulesView.tsx`)**:
   - Ganti banner sesi terakhir dengan badge kartu oranye `Sedang Berjalan`.
   - Buka akses klik kartu agar materi pembelajaran dapat dibaca semua siswa.
   - Ganti teks *game* menjadi *simulasi*.
4. **Pembaruan Sistem Soal & Evaluasi (`QuestionsView.tsx`)**:
   - Terapkan penyimpanan `currentIdx` di localStorage agar tidak kembali ke nomor 1 saat tab berganti.
   - Implementasikan komponen Tabel Benar/Salah (multi-pernyataan per baris).
   - Perbarui label tombol penyerahan: `"Jawab X soal lagi untuk bisa dikumpulkan"` dan tombol hijau `"Selesaikan dan Kumpulkan"`.
5. **Pembaruan Antarmuka Pengelolaan (`ModulesAddEditView.tsx`)**:
   - Tambahkan input `order_index` (urutan modul).
   - Berikan badge `Wajib` dan `Opsional` pada seluruh input formulir.
   - Terapkan batas ukuran file banner maksimal 5 MB.
   - Ubah teks dan ikon pengelolaan dari Game ke Simulasi.
