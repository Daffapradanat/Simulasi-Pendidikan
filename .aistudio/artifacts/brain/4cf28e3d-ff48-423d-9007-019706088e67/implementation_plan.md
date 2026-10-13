# Rencana Implementasi: Isolasi Progres Siswa Berbasis Nama, Penyimpanan Terkompresi, dan Retensi 30 Hari

Rencana ini merinci perbaikan arsitektur state management dan penyimpanan lokal untuk memastikan progres setiap siswa tersimpan terpisah di perangkat, tidak saling tercampur antar nama siswa yang berbeda, terkompresi secara efisien, serta otomatis dibersihkan setelah 30 hari tidak aktif.

---

## User Review & Keputusan Kunci

> [!IMPORTANT] Ringkasan Keputusan & Jawaban Pengguna
> - **Identifikasi & Pemulihan Progres**: Progres siswa di perangkat yang sama dibedakan dan dipulihkan berdasarkan **nama siswa**. Ketika siswa memasukkan nama yang sama (misal: "Fahran"), progres sebelumnya di perangkat tersebut langsung dimuat kembali.
> - **Masa Retensi 30 Hari**: Dihitung **30 hari sejak aktivitas/pengerjaan terakhir** (`lastActiveAt`). Setiap kali siswa belajar atau menyelesaikan modul, stempel waktu diperbarui. Jika lewat 30 hari tanpa aktivitas, data profil siswa tersebut otomatis terhapus.
> - **Penyimpanan Lokal Terkompresi**: Progres siswa tamu disimpan di penyimpanan perangkat (`localStorage`) menggunakan kompresi (memanfaatkan pustaka `fflate` yang sudah ada di proyek) untuk meminimalkan beban memori dan kuota penyimpanan browser, tanpa memberatkan beban server lab sekolah.
> - **Akses Modul Bebas**: Seluruh modul terbuka penuh (`unlocked`), siswa bebas memilih dan mengerjakan modul mana saja tanpa batasan urutan prasyarat.

---

## 1. Analisis Masalah & Akar Penyebab (Root Cause Analysis)

Evaluasi kolaboratif dari tiga perspektif engineering:

### A. Evaluasi Senior Web Engineer
1. **Race Condition di State Management React**:
   - Di `App.tsx`, state `playedGames`, `completedModuleIds`, dan `reflections` dipertahankan di memori komponen.
   - Saat siswa melakukan logout dan siswa lain melakukan login dengan nama baru, `currentUser` berubah sedangkan `isProgressLoaded` masih bernilai `true`.
   - `useEffect` penyimpanan otomatis langsung terpicu sebelum `refreshUserData` sempat memuat data siswa baru. Akibatnya, `Set` progres milik siswa sebelumnya langsung menimpa data siswa baru di penyimpanan!
2. **ID Tamu yang Berganti Acak Setiap Login**:
   - Endpoint `/api/auth/guest-login` sebelumnya menghasilkan ID acak `guest_${Date.now()}`. Jika siswa dengan nama sama masuk kembali, server membuat ID acak baru sehingga data lokal tidak tersambung dengan benar.

### B. Evaluasi Cybersecurity Engineer
1. **Sanitasi Kunci Penyimpanan (Storage Key Injection)**:
   - Nama siswa tidak boleh langsung disematkan ke nama kunci penyimpanan tanpa normalisasi. Karakter khusus, spasi berlebih, atau percobaan manipulasi string harus dibersihkan menjadi slug aman (misal: `simpend_student_data_${sanitizedName}`).
2. **Isolasi Sesi & Sanitasi Memori**:
   - Saat pergantian pengguna (logout / switch guest), seluruh data in-memory state harus di-reset secara atomik ke state kosong sebelum state user baru di-mount, mencegah *cross-session data leakage*.
3. **Batas Kuota Penyimpanan (Storage Quota & DoS Prevention)**:
   - Kompresi data mencegah penyimpanan browser melebihi batas kuota ~5 MB di komputer lab sekolah yang digunakan puluhan siswa bergantian.

### C. Evaluasi Science & Education Engineer
1. **Konteks Lab Komputer Sekolah**:
   - Di sekolah, satu unit PC digunakan bergantian oleh siswa dari kelas berbeda dalam beberapa sesi praktikum.
   - Progres simulasi sains, catatan refleksi, dan hasil asesmen tidak boleh tertukar antar siswa. Ketika "Fahran" selesai sesi 1, dan "Budi" login di sesi 2, Budi harus memulai dari progres miliknya sendiri (atau mulai bersih jika siswa baru). Ketika Fahran kembali besoknya, seluruh hasil belajarnya utuh.

---

## 2. Arsitektur Teknis & Alur Data

### A. Struktur Data & Kunci Penyimpanan
Setiap progres siswa tamu disimpan dalam satu envelope terstruktur di `localStorage`:

```typescript
interface StudentProgressRecord {
  displayName: string;           // Nama tampilan asli, misal: "Fahran"
  normalizedKey: string;         // Kunci normalisasi, misal: "fahran"
  lastActiveAt: number;          // Timestamp epoch (ms) aktivitas terakhir
  createdAt: number;             // Timestamp awal dibuat
  compressedData: string;        // Payload terkompresi base64
}

interface StudentProgressPayload {
  playedGames: number[];         // ID simulasi yang telah dijalankan
  completedModuleIds: number[];  // ID modul yang telah diselesaikan
  reflections: Record<number, string>; // Refleksi pengerjaan per modul
  lastModuleId?: number | null;  // Modul terakhir yang dibuka
}
```

### B. Kompresi Menggunakan `fflate`
- **Kompresi**: `JSON.stringify(payload)` → `fflate.strToU8()` → `fflate.zlibSync()` → Base64 string.
- **Dekompresi**: Base64 string → Uint8Array → `fflate.unzlibSync()` → `fflate.strFromU8()` → `JSON.parse()`.
- Mengurangi ukuran penyimpanan hingga 70-85%, sangat cepat (di bawah 2 milidetik).

### C. Mekanisme Pembersihan Otomatis (Retention Cleaner)
- Dijalankan saat inisialisasi aplikasi (`App.tsx` mount) dan setiap kali proses login berlangsung:
  ```typescript
  const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari
  function cleanupExpiredStudentProgress(): void {
    // Memindai seluruh key dengan prefix simpend_student_data_
    // Jika Date.now() - record.lastActiveAt > RETENTION_MS, hapus key dari localStorage.
  }
  ```

### D. Perbaikan Alur Pergantian Pengguna di `App.tsx`
1. **Fungsi `resetSessionProgress()`**:
   - Mengosongkan `playedGames` (`new Set()`), `completedModuleIds` (`new Set()`), `reflections` (`{}`), dan `isProgressLoaded(false)`.
2. **Pemuatan Atomik pada Login**:
   - Saat siswa memasukkan nama:
     1. Panggil `resetSessionProgress()`.
     2. Normalisasikan nama siswa.
     3. Ambil data lokal terkompresi untuk siswa tersebut (jika ada).
     4. Dekompresi dan isi state. Jika belum pernah ada, mulai dengan state kosong.
     5. Perbarui `lastActiveAt` ke waktu saat ini.
     6. Set `isProgressLoaded(true)` dan aktifkan `currentUser`.

---

## 3. Rencana Perubahan Berkas (Step-by-Step Implementation)

### Berkas 1: `src/lib/studentStorage.ts` (Modul Baru)
- Utility lengkap untuk:
  - Sanitasi dan normalisasi nama siswa (`normalizeStudentName(name)`).
  - Kompresi dan dekompresi payload progres siswa menggunakan `fflate`.
  - Fungsi simpan progres (`saveStudentProgress(name, data)`).
  - Fungsi baca progres (`loadStudentProgress(name)`).
  - Fungsi pembersihan data kedaluwarsa (`cleanupExpiredStudentProgress()`).
  - Fungsi daftar profil siswa lokal (jika diperlukan untuk manajemen penyimpanan).

### Berkas 2: `server.ts`
- Perbarui endpoint `/api/auth/guest-login` dan branch guest di `/api/auth/login`:
  - Gunakan ID yang stabil dan deterministik berbasis nama yang dinormalisasi:
    `id: "guest_" + Buffer.from(rawName.toLowerCase()).toString('hex').slice(0, 16)`
  - Memastikan token dan ID konsisten saat siswa dengan nama yang sama masuk kembali.

### Berkas 3: `src/App.tsx`
- Integrasikan `studentStorage.ts`:
  - Jalankan `cleanupExpiredStudentProgress()` pada inisialisasi awal.
  - Perbaiki `handleGuestLogin` dan `handleLogout` agar secara tegas mereset in-memory state sebelum memuat data baru.
  - Pisahkan penyimpanan siswa tamu (menggunakan penyimpanan lokal terkompresi 30 hari) dari penyimpanan akun terdaftar (server sync).
  - Pastikan seluruh modul tetap berstatus `unlocked` sehingga bebas diakses tanpa urutan berjenjang.

---

## 4. Rencana Pengujian & Verifikasi

1. **Uji Isolasi Multi-Siswa**:
   - Masuk sebagai "Fahran", kerjakan simulasi dan selesaikan Modul 1.
   - Logout, lalu masuk sebagai "Budi".
   - Verifikasi: Akun "Budi" mulai dari 0% progres (tidak ada modul selesai dari "Fahran").
   - Selesaikan Modul 2 sebagai "Budi".
   - Logout, lalu masuk kembali sebagai "Fahran".
   - Verifikasi: Progres Modul 1 milik "Fahran" pulih utuh, dan Modul 2 tetap belum selesai.
2. **Uji Efisiensi Kompresi**:
   - Periksa ukuran string di `localStorage` melalui developer tools, pastikan data tersimpan dalam bentuk terkompresi dan rapi.
3. **Uji Retensi & Pembersihan 30 Hari**:
   - Simulasikan record dengan `lastActiveAt` lampau (> 30 hari).
   - Jalankan fungsi cleaner dan verifikasi record tersebut terhapus dengan aman tanpa mengganggu record siswa aktif lainnya.
4. **Uji Akses Bebas Seluruh Modul**:
   - Buka halaman modul, pastikan semua kartu dapat diklik langsung tanpa terkunci.
5. **Verifikasi Build**:
   - Jalankan `compile_applet` untuk memastikan bebas galat kompilasi dan TypeScript.
