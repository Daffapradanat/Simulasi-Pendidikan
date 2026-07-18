import express from "express";
import bcrypt from "bcrypt";
import path from "path";
import sharp from "sharp";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { configureSecurity } from "./serverSecurity";
import compression from "compression";
import extract from "extract-zip";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedCategories, seedSubjects, seedStudents, seedTeachers, seedSchools } from "./seedData";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const PUBLIC_GAMES_DIR = path.join(process.cwd(), "public", "games");
if (!fs.existsSync(PUBLIC_GAMES_DIR)) {
  fs.mkdirSync(PUBLIC_GAMES_DIR, { recursive: true });
}

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars");
const BANNERS_DIR = path.join(process.cwd(), "uploads", "banners");
if (!fs.existsSync(BANNERS_DIR)) {
  fs.mkdirSync(BANNERS_DIR, { recursive: true });
}

if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } 
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {

     const ext = path.extname(file.originalname).toLowerCase();
     const safeName = Date.now() + "-" + Math.round(Math.random() * 1e9) + (ext.match(/^\.[a-z0-9]+$/i) ? ext : '.png');
     cb(null, safeName);
  }
});
const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Not an image'));
  }
});

const DB_FILE = path.join(process.cwd(), "database.sqlite");
let db: any;

let modulesData: any[] = [];
let teachersData: any[] = [];
let studentsData: any[] = [];
let activitiesData: any[] = [];
let userProgressData: Record<number, any> = {};
let categoriesData: any[] = [];
let schoolsData: any[] = [];
let subjectsData: any[] = [];
let questionsData: any[] = [];

async function initDB() {
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS modules (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS user_progress (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS schools (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS question_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY,
      module_id INTEGER,
      type_id INTEGER,
      data TEXT,
      FOREIGN KEY (type_id) REFERENCES question_types(id)
    );
  `);

  
  
  // Seed question_types
  const typesCount = await db.get("SELECT COUNT(*) as c FROM question_types");
  if (typesCount.c === 0) {
    await db.run("INSERT INTO question_types (code, name, description) VALUES ('multiple_choice', 'Pilihan Ganda', 'Soal dengan beberapa pilihan jawaban dimana hanya satu yang benar.')");
    await db.run("INSERT INTO question_types (code, name, description) VALUES ('multiple_select', 'Pilihan Ganda Kompleks', 'Soal dengan beberapa pilihan jawaban dimana lebih dari satu pilihan yang benar.')");
    await db.run("INSERT INTO question_types (code, name, description) VALUES ('true_false', 'Benar / Salah', 'Soal pernyataan yang harus ditentukan apakah benar atau salah.')");
    await db.run("INSERT INTO question_types (code, name, description) VALUES ('short_answer', 'Isian Singkat', 'Soal dengan jawaban singkat/kata-kata tertentu.')");
    await db.run("INSERT INTO question_types (code, name, description) VALUES ('essay', 'Uraian / Essay', 'Soal yang membutuhkan jawaban berupa teks/penjelasan panjang.')");
    await db.run("INSERT INTO question_types (code, name, description) VALUES ('matching', 'Menjodohkan', 'Soal yang mengharuskan siswa mencocokkan pasangan dari dua kolom.')");
    await db.run("INSERT INTO question_types (code, name, description) VALUES ('ordering', 'Mengurutkan', 'Soal yang mengharuskan mengurutkan poin-poin yang diberikan.')");
  }

  // Ensure questions table has the columns (for migration if it was just id and data)
  try {
    await db.exec("ALTER TABLE questions ADD COLUMN module_id INTEGER");
  } catch (e) {}
  try {
    await db.exec("ALTER TABLE questions ADD COLUMN type_id INTEGER REFERENCES question_types(id)");
  } catch (e) {}

  const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='app_state'");
  if (tableCheck) {
    const row = await db.get('SELECT data FROM app_state WHERE id = 1');
    if (row && row.data) {
      const fileData = JSON.parse(row.data);
      modulesData = fileData.modules || [];
      teachersData = fileData.teachers || [];
      studentsData = fileData.students || [];
      activitiesData = fileData.activities || [];

      await db.exec("DROP TABLE app_state");
    }
  } else {

    const mods = await db.all("SELECT data FROM modules");
    modulesData = mods.map((r: any) => JSON.parse(r.data));

    const teas = await db.all("SELECT data FROM teachers");
    teachersData = teas.map((r: any) => JSON.parse(r.data));

    const stus = await db.all("SELECT data FROM students");
    studentsData = stus.map((r: any) => JSON.parse(r.data));

    const acts = await db.all("SELECT data FROM activities ORDER BY id DESC LIMIT 100");
    activitiesData = acts.map((r: any) => JSON.parse(r.data));

    const progs = await db.all("SELECT id, data FROM user_progress");
    progs.forEach((r: any) => {
      userProgressData[r.id] = JSON.parse(r.data);
    });

    const cats = await db.all("SELECT data FROM categories");
    categoriesData = cats.map((r: any) => JSON.parse(r.data));

    try {
      const schs = await db.all("SELECT data FROM schools");
      schoolsData = schs.map((r: any) => JSON.parse(r.data));
    } catch (e) {
      schoolsData = [];
    }

    const subs = await db.all("SELECT data FROM subjects");
    subjectsData = subs.map((r: any) => JSON.parse(r.data));

    try {
      const qData = await db.all("SELECT data FROM questions");
      questionsData = qData.map((r: any) => JSON.parse(r.data));
    } catch (e) {
      questionsData = [];
    }
  }

  if (categoriesData.length === 0) {
    categoriesData = [...seedCategories];
  }
  if (subjectsData.length === 0) {
    subjectsData = [...seedSubjects];
  }
  if (schoolsData.length === 0) {
    schoolsData = [...seedSchools];
  }

  // Migrate existing asalSekolah to school_id if needed
  let schoolIdCounter = Math.max(0, ...schoolsData.map(s => s.id)) + 1;
  const ensureSchool = (asalSekolah: string) => {
    let sch = schoolsData.find(s => s.name === asalSekolah);
    if (!sch) {
      sch = { id: schoolIdCounter++, name: asalSekolah, category_id: 2 }; // Default to SMP
      schoolsData.push(sch);
    }
    return sch.id;
  };

  studentsData.forEach(s => {
    if (s.asalSekolah && !s.school_id) {
      s.school_id = ensureSchool(s.asalSekolah);
    }
  });

  teachersData.forEach(t => {
    if (t.asalSekolah && !t.school_id) {
      t.school_id = ensureSchool(t.asalSekolah);
    }
  });

  // Migrate from database.json if completely empty
  if (modulesData.length === 0 && studentsData.length === 0 && teachersData.length === 0) {
    const OLD_DB_FILE = path.join(process.cwd(), "database.json");
    if (fs.existsSync(OLD_DB_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(OLD_DB_FILE, 'utf-8'));
      modulesData = fileData.modules || [];
      teachersData = fileData.teachers || [];
      studentsData = fileData.students || [];
      activitiesData = fileData.activities || [];
    }
  }

  seedStudents.forEach(seedUser => {
    if (!studentsData.find((s: any) => s.email === seedUser.email)) {
      studentsData.push({ ...seedUser });
    }
  });

  seedTeachers.forEach(seedUser => {
    if (!teachersData.find((t: any) => t.email === seedUser.email)) {
      teachersData.push({ ...seedUser });
    }
  });

  if (!questionsData) {
    questionsData = [];
  }

  await saveDb();
}

async function doSaveDb() {
  if (!db) return;
  await db.exec("BEGIN TRANSACTION");
  try {
    await db.run("DELETE FROM modules");
    for (const m of modulesData) {
      await db.run("INSERT INTO modules (id, data) VALUES (?, ?)", [m.id, JSON.stringify(m)]);
    }

    await db.run("DELETE FROM teachers");
    for (const t of teachersData) {
      await db.run("INSERT INTO teachers (id, data) VALUES (?, ?)", [t.id, JSON.stringify(t)]);
    }

    await db.run("DELETE FROM students");
    for (const s of studentsData) {
      await db.run("INSERT INTO students (id, data) VALUES (?, ?)", [s.id, JSON.stringify(s)]);
    }

    await db.run("DELETE FROM activities");
    for (const a of activitiesData) {
      await db.run("INSERT INTO activities (id, data) VALUES (?, ?)", [a.id, JSON.stringify(a)]);
    }

    await db.run("DELETE FROM user_progress");
    for (const [id, data] of Object.entries(userProgressData)) {
      await db.run("INSERT INTO user_progress (id, data) VALUES (?, ?)", [id, JSON.stringify(data)]);
    }

    await db.run("DELETE FROM categories");
    for (const c of categoriesData) {
      await db.run("INSERT INTO categories (id, data) VALUES (?, ?)", [c.id, JSON.stringify(c)]);
    }
    await db.run("DELETE FROM schools");
    for (const s of schoolsData) {
      await db.run("INSERT INTO schools (id, data) VALUES (?, ?)", [s.id, JSON.stringify(s)]);
    }
    await db.run("DELETE FROM subjects");
    for (const sub of subjectsData) {
      await db.run("INSERT INTO subjects (id, data) VALUES (?, ?)", [sub.id, JSON.stringify(sub)]);
    }

    await db.run("DELETE FROM questions");
    for (const q of questionsData) {
      const typeRow = await db.get("SELECT id FROM question_types WHERE code = ?", [q.type || 'multiple_choice']);
      const type_id = typeRow ? typeRow.id : null;
      await db.run("INSERT INTO questions (id, module_id, type_id, data) VALUES (?, ?, ?, ?)", [q.id, q.module_id, type_id, JSON.stringify(q)]);
    }

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    console.error("Failed to save database:", error);
  }
}

let saveDbTimeout: NodeJS.Timeout | null = null;
function saveDb() {
  if (saveDbTimeout) clearTimeout(saveDbTimeout);
  saveDbTimeout = setTimeout(() => {
    doSaveDb().catch(console.error);
  }, 1000);
}

function logActivity(action: string, user: string, desc: string) {
  const newActivity = {
    id: Date.now(),
    action,
    user,
    time: new Date().toISOString(),
    desc
  };
  activitiesData.unshift(newActivity);

  if (activitiesData.length > 100) activitiesData.pop();
  saveDb();
}

const SECRET_KEY = process.env.JWT_SECRET || "simpend_secret_key_2025_fallback";

async function startServer() {
  await initDB();
  const app = express();
  app.use(compression({ level: 9, threshold: 0 }));
  const PORT = 3000;

  // Security controls are moved to /serverSecurity.ts
  configureSecurity(app);

  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

  // --- Auth Middlewares ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as any;
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };

    const isStrictAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin' && req.user.role !== 'guru') {
      return res.status(403).json({ error: "Forbidden: Admin/Guru access required" });
    }
    next();
  };

  
  app.get("/api/banners/:filename", (req, res) => {
    const filename = req.params.filename;
    if (filename.includes('/') || filename.includes('..') || filename.includes('\\')) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    const filepath = path.join(BANNERS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Not found" });
    }
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(filepath);
  });

  app.get("/api/avatars/:filename", (req, res) => {
    const filename = req.params.filename;
    if (filename.includes('/') || filename.includes('..') || filename.includes('\\')) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    const filepath = path.join(AVATAR_DIR, filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Not found" });
    }
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(filepath);
  });

  
  app.put("/api/users/:id/avatar", authenticateToken, (req, res) => {
    const { avatar, role } = req.body;
    const id = parseInt(req.params.id);
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    let found = false;
    if (role === 'admin') {
      // no persistent storage for hardcoded admin avatar yet, but we allow the frontend to update state
      found = true;
    } else if (role === 'siswa') {
      const idx = studentsData.findIndex(s => s.id === id);
      if (idx !== -1) { studentsData[idx].avatar = avatar; found = true; }
    } else if (role === 'guru') {
      const idx = teachersData.findIndex(t => t.id === id);
      if (idx !== -1) { teachersData[idx].avatar = avatar; found = true; }
    }
    
    if (found) {
      saveDb();
      res.json({ success: true, avatar });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  
const uploadBannerMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya diperbolehkan format PNG, JPG, dan JPEG.'));
    }
  }
});



app.post("/api/upload-image", authenticateToken, isAdmin, (req, res) => {
  uploadBannerMemory.single('image')(req, res, async (err) => {
    if (err) {
       return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: "No file uploaded or invalid format" });
    
    try {
      const filename = 'img-' + Date.now() + '.webp';
      const filepath = path.join(BANNERS_DIR, filename);
      
      await sharp(req.file.buffer)
        .resize(800, null, { withoutEnlargement: true }) // Resize width to 800px max
        .webp({ quality: 80 }) // Compress to webp format
        .toFile(filepath);
        
      res.json({ success: true, url: `/api/banners/${filename}` });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });
});

  app.post("/api/upload-avatar", uploadAvatar.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded or invalid format" });
    res.json({ success: true, url: `/api/avatars/${req.file.filename}` });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    let foundUser = null;

    // Hardcoded Admin with bcrypt fallback (admin123)
    if (email === 'admin' || email === 'admin@sch.id') {
       const defaultAdminHash = await bcrypt.hash('admin123', 10);
       // In real app, load admin from DB. Here we simulate it.
       const match = await bcrypt.compare(password, defaultAdminHash);
       if (match) {
         foundUser = { id: 3, name: "Administrator", email: "admin@sch.id", role: "admin" };
       }
    }

    if (!foundUser) {
      const student = studentsData.find(s => !s.isDeleted && s.email === email);
      if ((email === 'siswa' || email === 'siswa@murid.sekolah.sch.id') && password === 'siswa') {
        const s = studentsData.find(s => s.email === 'siswa@murid.sekolah.sch.id') || studentsData.find(s => s.id === 1);
        if (s) foundUser = { ...s, role: "siswa", name: s.name, email: 'siswa@murid.sekolah.sch.id' };
        else foundUser = { id: 1, name: "Siswa Siswi", email: "siswa@murid.sekolah.sch.id", role: "siswa" };
      } else if (student) {
        // Assume default password 'siswa' is hashed, or if not present, assume 'siswa'
        const match = student.password ? await bcrypt.compare(password, student.password) : (password === 'siswa');
        if (match) foundUser = { ...student, role: "siswa" };
      }
    }

    if (!foundUser) {
      const teacher = teachersData.find(t => !t.isDeleted && t.email === email);
      if ((email === 'guru' || email === 'guru@sekolah.sch.id') && password === 'guru') {
        const t = teachersData.find(t => t.email === 'guru@sekolah.sch.id') || teachersData.find(t => t.id === 2);
        if (t) foundUser = { ...t, role: "guru", name: t.name, email: 'guru@sekolah.sch.id' };
        else foundUser = { id: 2, name: "Guru Pengajar", email: "guru@sekolah.sch.id", role: "guru" };
      } else if (teacher) {
        const match = teacher.password ? await bcrypt.compare(password, teacher.password) : (password === 'guru');
        if (match) foundUser = { ...teacher, role: "guru" };
      }
    }

    if (!foundUser) {
      return res.status(401).json({ success: false, error: "Email atau password salah." });
    }

    let category_ids = foundUser.category_ids || [];
    if (foundUser.school_id) {
      const school = schoolsData.find(s => s.id === foundUser.school_id);
      if (school && !category_ids.includes(school.category_id)) {
        category_ids = [...category_ids, school.category_id];
      }
    }

    const user = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role, category_ids, subject_ids: foundUser.subject_ids, avatar: foundUser.avatar, school_id: foundUser.school_id };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, school_id: user.school_id }, SECRET_KEY, { expiresIn: '1d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true,
      sameSite: 'none' 
    });
    res.json({ success: true, user, token });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token', { sameSite: 'none', secure: true });
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as any;
      let userObj: any = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name, school_id: decoded.school_id };
      
      if (userObj.role === 'guru') {
         const t = teachersData.find(x => x.id === userObj.id);
         if (t) {
           userObj.category_ids = t.category_ids || [];
           userObj.subject_ids = t.subject_ids;
           userObj.avatar = t.avatar;
           userObj.school_id = t.school_id;
           if (t.school_id) {
             const school = schoolsData.find(s => s.id === t.school_id);
             if (school && !userObj.category_ids.includes(school.category_id)) {
               userObj.category_ids.push(school.category_id);
             }
           }
         }
      } else if (userObj.role === 'siswa') {
         const s = studentsData.find(x => x.id === userObj.id);
         if (s) {
           userObj.avatar = s.avatar;
           userObj.school_id = s.school_id;
           userObj.category_ids = [];
           if (s.school_id) {
             const school = schoolsData.find(sch => sch.id === s.school_id);
             if (school) userObj.category_ids.push(school.category_id);
           }
         }
      } else if (userObj.role === 'admin') {
         // admin avatar if exists in a future implementation
      }
      
      res.json({ user: userObj });
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.get("/api/users/:id/progress", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    res.json(userProgressData[id] || { playedGames: [], completedModuleIds: [], reflections: {} });
  });

  app.post("/api/users/:id/progress", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const { playedGames, completedModuleIds, reflections } = req.body;
    userProgressData[id] = { 
      playedGames: playedGames || [], 
      completedModuleIds: completedModuleIds || [],
      reflections: reflections || {}
    };
    saveDb();
    res.json({ success: true });
  });

  app.post("/api/admin/complete_all/:id", authenticateToken, isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const completedModuleIds = modulesData.filter(m => !m.isDeleted).map(m => m.id);
    let playedGames: number[] = [];
    modulesData.filter(m => !m.isDeleted).forEach(m => {
       if (m.games && Array.isArray(m.games)) {
          m.games.forEach((g: any) => playedGames.push(g.id));
       }
    });
    userProgressData[id] = { playedGames, completedModuleIds };
    saveDb();
    logActivity('admin', req.user.role === 'admin' ? 'Admin' : 'Guru', `Menyelesaikan semua modul untuk user ID ${id}`);
    res.json({ success: true, progress: userProgressData[id] });
  });

app.put("/api/auth/profile", authenticateToken, (req, res) => {
    const { id, name, email, role, password } = req.body;
    let found = false;
    let newAvatar = undefined;
    if (role === 'siswa') {
      const idx = studentsData.findIndex(s => s.id === id);
      if (idx !== -1) { 
        studentsData[idx] = { ...studentsData[idx], name, email }; 
        if (password) studentsData[idx].password = password;
        newAvatar = studentsData[idx].avatar; 
        found = true; 
      }
    } else if (role === 'guru') {
      const idx = teachersData.findIndex(t => t.id === id);
      if (idx !== -1) { 
        teachersData[idx] = { ...teachersData[idx], name, email }; 
        if (password) teachersData[idx].password = password;
        newAvatar = teachersData[idx].avatar; 
        found = true; 
      }
    }

    if (found) {
      if (password) {
        logActivity('system', role, `Mereset password profil ${name}`);
      } else {
        logActivity('system', role, `Pembaruan profil ${name}`);
      }
      saveDb();
      res.json({ success: true, user: { id, name, email, role, avatar: newAvatar } });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  
  
app.get('/api/question_types', authenticateToken, isAdmin, async (req, res) => {
  try {
    const types = await db.all("SELECT * FROM question_types");
    res.json(types);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch question types' });
  }
});

app.get('/api/modules/:id/questions', authenticateToken, (req, res) => {
    const moduleId = parseInt(req.params.id);
    const questions = questionsData.filter(q => q.module_id === moduleId);
    res.json({ questions });
  });

  app.post('/api/modules/:id/questions', authenticateToken, isAdmin, (req, res) => {
    const moduleId = parseInt(req.params.id);
    const newQuestions = req.body.questions;
    
    questionsData = questionsData.filter(q => q.module_id !== moduleId);
    
    if (Array.isArray(newQuestions)) {
       newQuestions.forEach(q => {
          questionsData.push({
             id: Date.now() + Math.floor(Math.random() * 1000),
             module_id: moduleId,
             type: q.type || 'multiple_choice',
             text: q.text,
             options: q.options,
             correctAnswerIndex: q.correctAnswerIndex,
             correctAnswer: q.correctAnswer,
             correctAnswerText: q.correctAnswerText,
             correctAnswers: q.correctAnswers,
             pairs: q.pairs,
             explanation: q.explanation
          });
       });
    }
    
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/activities", authenticateToken, isAdmin, (req, res) => {
    res.json(activitiesData);
  });

  app.post("/api/admin/clear_all", authenticateToken, isStrictAdmin, (req, res) => {

    modulesData = [];
    teachersData = [];
    studentsData = [];
    activitiesData = [];
    userProgressData = {};
    categoriesData = [];
    schoolsData = [];
    subjectsData = [];
    questionsData = [];

    try {
      const uFiles = fs.readdirSync(UPLOADS_DIR);
      for (const file of uFiles) fs.unlinkSync(path.join(UPLOADS_DIR, file));
    } catch(e) {}

    try {
      const gFiles = fs.readdirSync(PUBLIC_GAMES_DIR);
      for (const file of gFiles) fs.rmSync(path.join(PUBLIC_GAMES_DIR, file), { recursive: true, force: true });
    } catch(e) {}

    saveDb();
    res.json({ success: true });
  });

  app.get("/api/categories", (req, res) => {
    res.json(categoriesData);
  });

  app.post("/api/categories", authenticateToken, isStrictAdmin, (req, res) => {
    const { name, icon } = req.body;
    const newCat = { id: Date.now(), name, icon };
    categoriesData.push(newCat);
    saveDb();
    res.json({ success: true, category: newCat });
  });

  app.put("/api/categories/reorder", authenticateToken, isStrictAdmin, (req, res) => {
    const { orderIds } = req.body;
    if (orderIds && Array.isArray(orderIds)) {
      categoriesData = orderIds.map(id => categoriesData.find(c => c.id === id)).filter(Boolean);
      saveDb();
    }
    res.json({ success: true, categories: categoriesData });
  });

  app.put("/api/categories/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = categoriesData.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    categoriesData[index] = { ...categoriesData[index], name: req.body.name, icon: req.body.icon };
    saveDb();
    res.json({ success: true, category: categoriesData[index] });
  });

  app.delete("/api/categories/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    categoriesData = categoriesData.filter(c => c.id !== id);
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/schools", (req, res) => {
    res.json(schoolsData);
  });
  app.post("/api/schools", authenticateToken, isStrictAdmin, (req, res) => {
    const newSchool = { id: Date.now(), name: req.body.name, category_id: req.body.category_id };
    schoolsData.push(newSchool);
    saveDb();
    res.json({ success: true, school: newSchool });
  });
  app.put("/api/schools/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = schoolsData.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    schoolsData[index] = { ...schoolsData[index], name: req.body.name, category_id: req.body.category_id };
    saveDb();
    res.json({ success: true, school: schoolsData[index] });
  });
  app.delete("/api/schools/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    schoolsData = schoolsData.filter(s => s.id !== id);
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/subjects", (req, res) => {
    res.json(subjectsData);
  });

  app.post("/api/subjects", authenticateToken, isStrictAdmin, (req, res) => {
    const { name, icon } = req.body;
    const newSub = { id: Date.now(), name, icon };
    subjectsData.push(newSub);
    saveDb();
    res.json({ success: true, subject: newSub });
  });

  app.put("/api/subjects/reorder", authenticateToken, isStrictAdmin, (req, res) => {
    const { orderIds } = req.body;
    if (orderIds && Array.isArray(orderIds)) {
      subjectsData = orderIds.map(id => subjectsData.find(c => c.id === id)).filter(Boolean);
      saveDb();
    }
    res.json({ success: true, subjects: subjectsData });
  });

  app.put("/api/subjects/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = subjectsData.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    subjectsData[index] = { ...subjectsData[index], name: req.body.name, icon: req.body.icon };
    saveDb();
    res.json({ success: true, subject: subjectsData[index] });
  });

  app.delete("/api/subjects/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    subjectsData = subjectsData.filter(s => s.id !== id);
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/modules", (req, res) => {
    const modulesWithQuestionCount = modulesData.map((m: any) => ({
      ...m,
      questionCount: questionsData.filter(q => q.module_id === m.id).length
    }));
    res.json(modulesWithQuestionCount);
  });

  function findIndexPath(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;
    const items = fs.readdirSync(dir);
    if (items.includes('index.html')) return 'index.html';

    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
         const subSearch = findIndexPath(fullPath);
         if (subSearch) return `${item}/${subSearch}`;
      }
    }
    return null;
  }

  app.post("/api/modules", authenticateToken, isAdmin, upload.array('gameFiles'), async (req, res) => {
    try {
      let { title, desc, level, category_id, subject_id, duration, material, gamesMeta, banner_url } = req.body;
      try { material = JSON.parse(material || '[]'); } catch(e) {}
      try { gamesMeta = JSON.parse(gamesMeta || '[]'); } catch(e) {}

      const files = req.files as Express.Multer.File[];
      let fileIndex = 0;
      if (files && files.length > 0) {
        for (let i = 0; i < gamesMeta.length; i++) {
          if (gamesMeta[i].hasNewFile && fileIndex < files.length) {
            const file = files[fileIndex++];
            const gameDir = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}`);
            try {
              if (!fs.existsSync(gameDir)) {
                fs.mkdirSync(gameDir, { recursive: true });
              }
              // Save as zip
              const zipPath = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}.zip`);
              fs.copyFileSync(file.path, zipPath);
              gamesMeta[i].path = `/games/game_${gamesMeta[i].id}.zip`;
            } catch (zipError) {
              console.error("Failed to extract zip:", zipError);
            } finally {
              try { fs.unlinkSync(file.path); } catch(err){}
            }
          }
        }
      }

      const newModule = { 
        id: Date.now(), 
        title, desc, level, 
        category_id: parseInt(category_id) || null,
        subject_id: parseInt(subject_id) || null,
        duration, material, 
        games: gamesMeta, gameCount: gamesMeta?.length || 0,
        status: 'locked'
      };
      modulesData.push(newModule);
      logActivity('module', 'Admin', `Menambahkan modul baru "${title}"`);
      saveDb();
      res.json({ success: true, module: newModule });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create module" });
    }
  });

  app.put("/api/modules/:id", authenticateToken, isAdmin, upload.array('gameFiles'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const index = modulesData.findIndex(m => m.id === id);
      if (index === -1) return res.status(404).json({ error: "Not found" });

      let { title, desc, level, category_id, subject_id, duration, material, gamesMeta } = req.body;
      try { material = JSON.parse(material || '[]'); } catch(e) {}
      try { gamesMeta = JSON.parse(gamesMeta || '[]'); } catch(e) {}

      const files = req.files as Express.Multer.File[];
      let fileIndex = 0;
      if (files && files.length > 0) {
        for (let i = 0; i < gamesMeta.length; i++) {
          if (gamesMeta[i].hasNewFile && fileIndex < files.length) {
            const file = files[fileIndex++];
            const gameDir = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}`);
            try {
              if (!fs.existsSync(gameDir)) {
                fs.mkdirSync(gameDir, { recursive: true });
              }
              // Save as zip
              const zipPath = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}.zip`);
              fs.copyFileSync(file.path, zipPath);
              gamesMeta[i].path = `/games/game_${gamesMeta[i].id}.zip`;
            } catch (zipError) {
              console.error("Failed to extract zip:", zipError);
            } finally {
              try { fs.unlinkSync(file.path); } catch(err){}
            }
          }
        }
      }

      modulesData[index] = { 
        ...modulesData[index], 
        title, desc, level, 
        category_id: parseInt(category_id) || null,
        subject_id: parseInt(subject_id) || null,
        duration, material, games: gamesMeta, gameCount: gamesMeta?.length || 0
      };
      logActivity('module', 'Admin', `Mengubah modul "${title}"`);
      saveDb();
      res.json({ success: true, module: modulesData[index] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update module" });
    }
  });

  app.delete("/api/modules/:id", authenticateToken, isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = modulesData.findIndex(m => m.id === id);
    if (index !== -1) {
      const module = modulesData[index];
      if (module.games && Array.isArray(module.games)) {
        module.games.forEach((g: any) => {
          const gameDir = path.join(PUBLIC_GAMES_DIR, `game_${g.id}`);
          if (fs.existsSync(gameDir)) {
             try { fs.rmSync(gameDir, { recursive: true, force: true }); } catch (e) {}
          }
        });
      }
      logActivity('module', 'Admin', `Menghapus modul "${module.title}" secara permanen`);
      modulesData.splice(index, 1);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/modules/:id/restore", authenticateToken, isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = modulesData.findIndex(m => m.id === id);
    if (index !== -1) {
      modulesData[index].isDeleted = false;
      logActivity('module', 'Admin', `Memulihkan modul "${modulesData[index].title}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.get("/api/teachers", authenticateToken, isAdmin, (req, res) => {
    res.json(teachersData);
  });
  app.post("/api/teachers", authenticateToken, isStrictAdmin, async (req, res) => {
    const newTeacher = { id: Date.now(), ...req.body };
    if (!newTeacher.password) newTeacher.password = await bcrypt.hash('guru', 10);
    else newTeacher.password = await bcrypt.hash(newTeacher.password, 10);
    teachersData.push(newTeacher);
    logActivity('teacher', 'Admin', `Mendaftarkan guru "${newTeacher.name}"`);
    saveDb();
    res.json({ success: true, teacher: newTeacher });
  });
  app.put("/api/teachers/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    teachersData[index] = { ...teachersData[index], ...req.body };
    logActivity('teacher', 'Admin', `Memperbarui data guru "${teachersData[index].name}"`);
    saveDb();
    res.json({ success: true, teacher: teachersData[index] });
  });
  app.delete("/api/teachers/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index !== -1) {
      teachersData[index].isDeleted = true;
      logActivity('teacher', 'Admin', `Menonaktifkan guru "${teachersData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/teachers/:id/restore", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index !== -1) {
      teachersData[index].isDeleted = false;
      logActivity('teacher', 'Admin', `Mengaktifkan guru "${teachersData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.get("/api/students", authenticateToken, isAdmin, (req, res) => {
    const activeMods = modulesData.filter((m: any) => !m.isDeleted);
    const totalMods = activeMods.length;
    
    // Pre-calculate mods per subject to avoid O(N*M) loop
    const modsPerSubject: Record<number, any[]> = {};
    subjectsData.forEach((sub: any) => {
       modsPerSubject[sub.id] = activeMods.filter((m: any) => m.subject_id === sub.id);
    });

    const augmentedStudents = studentsData.map((s: any) => {
       const userProg = userProgressData[s.id] || { playedGames: [], completedModuleIds: [], reflections: {} };
       const completedModuleIds = userProg.completedModuleIds || [];
       const reflections = userProg.reflections || {};
       const completed = completedModuleIds.length;
       const progress = totalMods > 0 ? Math.round((completed / totalMods) * 100) : 0;
       
       const subjectProgress: Record<string, number> = {};
       subjectsData.forEach((sub: any) => {
          const subMods = modsPerSubject[sub.id] || [];
          const subCompleted = subMods.filter((m: any) => completedModuleIds.includes(m.id)).length;
          subjectProgress[sub.name] = subMods.length > 0 ? Math.round((subCompleted / subMods.length) * 100) : 0;
       });
       
       return { ...s, progress, subjectProgress, completedModuleIds, reflections };
    });
    res.json(augmentedStudents);
  });

  app.post("/api/students", authenticateToken, isStrictAdmin, async (req, res) => {
    const newStudent = { id: Date.now(), progress: 0, ...req.body };
    if (!newStudent.password) newStudent.password = await bcrypt.hash('siswa', 10);
    else newStudent.password = await bcrypt.hash(newStudent.password, 10);
    studentsData.push(newStudent);
    logActivity('student', 'Admin', `Mendaftarkan siswa "${newStudent.name}"`);
    saveDb();
    res.json({ success: true, student: newStudent });
  });
  app.put("/api/students/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    studentsData[index] = { ...studentsData[index], ...req.body };
    logActivity('student', 'Admin', `Memperbarui data siswa "${studentsData[index].name}"`);
    saveDb();
    res.json({ success: true, student: studentsData[index] });
  });
  app.delete("/api/students/:id", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index !== -1) {
      studentsData[index].isDeleted = true;
      logActivity('student', 'Admin', `Menonaktifkan siswa "${studentsData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/students/:id/restore", authenticateToken, isStrictAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index !== -1) {
      studentsData[index].isDeleted = false;
      logActivity('student', 'Admin', `Mengaktifkan siswa "${studentsData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  // Serve extracted games explicitly
  app.use('/games', express.static(PUBLIC_GAMES_DIR, {
    maxAge: '1y', 
    setHeaders: (res, filePath) => {

      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      if (filePath.endsWith('.gz')) {
        res.set('Content-Encoding', 'gzip');
        if (filePath.includes('.wasm')) res.set('Content-Type', 'application/wasm');
        else if (filePath.includes('.js')) res.set('Content-Type', 'application/javascript');
        else if (filePath.includes('.data')) res.set('Content-Type', 'application/octet-stream');
      } else if (filePath.endsWith('.br')) {
        res.set('Content-Encoding', 'br');
        if (filePath.includes('.wasm')) res.set('Content-Type', 'application/wasm');
        else if (filePath.includes('.js')) res.set('Content-Type', 'application/javascript');
        else if (filePath.includes('.data')) res.set('Content-Type', 'application/octet-stream');
      } else if (filePath.endsWith('.wasm')) {
        res.set('Content-Type', 'application/wasm');
      }
    }
  }));

  app.use('/games', (req, res) => {
    res.status(404).send('Game file not found.');
  });

  // Provide JSON 404 for unhandled API routes instead of falling back to Vite SPA
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API Endpoint not found' });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler to catch express-rate-limit validation errors or other crashes
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Error Caught:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
