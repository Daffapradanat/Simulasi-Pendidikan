import * as fflate from 'fflate';

export interface StudentProgressPayload {
  playedGames: number[];
  completedModuleIds: number[];
  reflections: Record<number, string>;
  lastModuleId?: number | null;
}

export interface StudentProgressRecord {
  displayName: string;
  normalizedKey: string;
  lastActiveAt: number;
  createdAt: number;
  compressedData: string;
}

const STORAGE_PREFIX = 'simpend_guest_data_';
// 30 hari dalam milidetik (30 * 24 * 60 * 60 * 1000)
export const RETENTION_DAYS = 30;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Normalisasi nama siswa menjadi key penyimpanan yang aman dan deterministik.
 * Menghilangkan karakter rentan, menjaga konsistensi huruf kecil dan spasi.
 */
export function normalizeStudentKey(name: string): string {
  const clean = (name || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);

  return clean || 'siswa_tamu';
}

/**
 * Konversi Uint8Array ke Base64 string yang aman untuk browser
 */
function u8ToBase64(u8: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < u8.length; i += chunkSize) {
    const chunk = u8.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Konversi Base64 string kembali ke Uint8Array
 */
function base64ToU8(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Mengompresi payload objek progress menjadi string Base64 terkompresi Zlib
 */
export function compressProgress(payload: StudentProgressPayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    const u8 = fflate.strToU8(jsonStr);
    const compressed = fflate.zlibSync(u8, { level: 9 });
    return u8ToBase64(compressed);
  } catch (err) {
    console.warn('Gagal mengompresi progress siswa, menggunakan fallback JSON:', err);
    return JSON.stringify(payload);
  }
}

/**
 * Mendekompresi string Base64 terkompresi Zlib kembali menjadi payload objek progress
 */
export function decompressProgress(compressedStr: string): StudentProgressPayload | null {
  try {
    if (!compressedStr) return null;
    
    // Deteksi jika tersimpan sebagai JSON biasa (fallback)
    if (compressedStr.startsWith('{')) {
      return JSON.parse(compressedStr);
    }

    const u8 = base64ToU8(compressedStr);
    const decompressed = fflate.unzlibSync(u8);
    const jsonStr = fflate.strFromU8(decompressed);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn('Gagal mendekompresi data progress siswa:', err);
    return null;
  }
}

/**
 * Menyimpan data progress siswa ke localStorage dengan kompresi dan timestamp aktivitas terbaru.
 */
export function saveStudentProgress(name: string, payload: StudentProgressPayload): boolean {
  if (!name) return false;
  try {
    const normalizedKey = normalizeStudentKey(name);
    const storageKey = `${STORAGE_PREFIX}${normalizedKey}`;
    const now = Date.now();

    let createdAt = now;
    const existingRaw = localStorage.getItem(storageKey);
    if (existingRaw) {
      try {
        const existingRecord: StudentProgressRecord = JSON.parse(existingRaw);
        if (existingRecord.createdAt) createdAt = existingRecord.createdAt;
      } catch {
        // Abaikan jika corrupt
      }
    }

    const compressedData = compressProgress(payload);
    const record: StudentProgressRecord = {
      displayName: name.trim() || 'Siswa Tamu',
      normalizedKey,
      lastActiveAt: now,
      createdAt,
      compressedData
    };

    localStorage.setItem(storageKey, JSON.stringify(record));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan progress siswa ke storage lokal:', err);
    return false;
  }
}

/**
 * Memuat data progress siswa berdasarkan nama.
 * Memeriksa kedaluwarsa 30 hari. Jika lewat 30 hari, data otomatis dihapus dan mengembalikan null.
 */
export function loadStudentProgress(name: string): StudentProgressPayload | null {
  if (!name) return null;
  try {
    const normalizedKey = normalizeStudentKey(name);
    const storageKey = `${STORAGE_PREFIX}${normalizedKey}`;
    const raw = localStorage.getItem(storageKey);

    if (!raw) return null;

    const record: StudentProgressRecord = JSON.parse(raw);
    const now = Date.now();

    // Periksa masa retensi 30 hari sejak aktivitas terakhir
    if (record.lastActiveAt && (now - record.lastActiveAt > RETENTION_MS)) {
      console.info(`Data progress siswa '${record.displayName}' telah kedaluwarsa (> 30 hari). Menghapus data.`);
      localStorage.removeItem(storageKey);
      return null;
    }

    // Perbarui timestamp lastActiveAt saat diakses kembali
    record.lastActiveAt = now;
    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {
      // Abaikan jika quota transient
    }

    return decompressProgress(record.compressedData);
  } catch (err) {
    console.error('Gagal memuat progress siswa dari storage lokal:', err);
    return null;
  }
}

/**
 * Membersihkan data siswa yang sudah melewati batas retensi 30 hari sejak aktivitas terakhir.
 * Mengembalikan jumlah record yang berhasil dibersihkan.
 */
export function cleanupExpiredStudentProgress(): number {
  let cleanedCount = 0;
  const now = Date.now();

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const record: StudentProgressRecord = JSON.parse(raw);
            if (record.lastActiveAt && (now - record.lastActiveAt > RETENTION_MS)) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Jika corrupt, tandai untuk dibersihkan
          keysToRemove.push(key);
        }
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      console.info(`Pembersihan otomatis: ${cleanedCount} data siswa yang tidak aktif lebih dari 30 hari berhasil dihapus.`);
    }
  } catch (err) {
    console.warn('Gagal menjalankan pembersihan data kedaluwarsa:', err);
  }

  return cleanedCount;
}

/**
 * Mendapatkan ringkasan metadata progress siswa untuk keperluan inspeksi / diagnosa
 */
export function getStudentStorageInfo(name: string): { exists: boolean; daysRemaining?: number; displayName?: string } {
  try {
    const normalizedKey = normalizeStudentKey(name);
    const storageKey = `${STORAGE_PREFIX}${normalizedKey}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { exists: false };

    const record: StudentProgressRecord = JSON.parse(raw);
    const ageMs = Date.now() - (record.lastActiveAt || 0);
    const msRemaining = RETENTION_MS - ageMs;
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

    return {
      exists: daysRemaining > 0,
      daysRemaining,
      displayName: record.displayName
    };
  } catch {
    return { exists: false };
  }
}
