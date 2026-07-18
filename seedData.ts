export const seedCategories = [
  { id: 1, name: 'SD' },
  { id: 2, name: 'SMP' },
  { id: 3, name: 'SMA' },
  { id: 4, name: 'SMK' },
];

export const seedSubjects = [
  { id: 1, name: 'Matematika' },
  { id: 2, name: 'IPA (Sains)' },
  { id: 3, name: 'Komputer' },
  { id: 4, name: 'Bahasa' },
];

export const seedSchools = [
  { id: 1, name: 'SMP Negeri 1', category_id: 2 },
  { id: 2, name: 'SMA Negeri 1', category_id: 3 },
  { id: 3, name: 'SD Negeri 1', category_id: 1 },
];

export const seedStudents = [
  { id: 1, name: "Siswa Siswi", email: "siswa@murid.sekolah.sch.id", nisn: "1234567890", school_id: 1, progress: 0 }
];

export const seedTeachers = [
  { id: 2, name: "Guru Pengajar", email: "guru@sekolah.sch.id", nip: "198001012005011001", subject_ids: [2], school_id: 1 }
];

export const seedAdmins = [
  { id: 3, name: "Admin Utama", email: "admin@sekolah.sch.id", role: "admin" }
];
