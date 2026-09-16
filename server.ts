import express from "express";
import http from "http";
import bcrypt from "bcrypt";
import path from "path";
import sharp from "sharp";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import * as XLSX from "xlsx";
import fs from "fs";
import { configureSecurity } from "./serverSecurity";
import compression from "compression";
import extract from "extract-zip";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedCategories, seedSubjects, seedStudents, seedTeachers, seedSchools } from "./seedData";
import { MODULES_DATA } from "./src/data";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const PUBLIC_GAMES_DIR = path.join(process.cwd(), "public", "games");
try { if (!fs.existsSync(PUBLIC_GAMES_DIR)) { fs.mkdirSync(PUBLIC_GAMES_DIR, { recursive: true }); } } catch(e) {}

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
try { if (!fs.existsSync(UPLOADS_DIR)) { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } } catch(e) {}

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
let adminProfile: any = { id: 3, name: "Administrator", username: "admin", email: "admin@sch.id", role: "admin", password: "", avatar: "" };

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
    CREATE TABLE IF NOT EXISTS user_progress (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS schools (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS admin_profile (id INTEGER PRIMARY KEY, data TEXT);
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

  try {
    const adminRows = await db.all("SELECT data FROM admin_profile");
    if (adminRows.length > 0) {
      adminProfile = JSON.parse(adminRows[0].data);
      if (!adminProfile.username) adminProfile.username = "admin";
      // Ensure admin password is admin123
      adminProfile.password = await bcrypt.hash("admin123", 10);
      await db.run("UPDATE admin_profile SET data = ? WHERE id = ?", [JSON.stringify(adminProfile), 3]);
    } else {
      adminProfile.username = "admin";
      adminProfile.password = await bcrypt.hash("admin123", 10);
      await db.run("INSERT INTO admin_profile (id, data) VALUES (?, ?)", [3, JSON.stringify(adminProfile)]);
    }
  } catch (e) {
    console.error("Error loading admin_profile", e);
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

  if (!modulesData || modulesData.length === 0) {
    modulesData = [...MODULES_DATA];
  }

  // Ensure initial sample game package exists so generic loader does not 404
  const game1Dir = path.join(PUBLIC_GAMES_DIR, "game_1");
  const zipPath = path.join(PUBLIC_GAMES_DIR, "game_1.zip");
  if (!fs.existsSync(game1Dir) || !fs.existsSync(path.join(game1Dir, "index.html"))) {
    try {
      fs.mkdirSync(game1Dir, { recursive: true });
      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulasi Konversi Bilangan Biner</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      max-width: 620px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 { font-size: 22px; font-weight: 700; color: #38bdf8; margin-bottom: 8px; }
    p.subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .bits-container {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }
    .bit-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .bit-val {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }
    .bit-btn {
      width: 48px;
      height: 60px;
      font-size: 26px;
      font-weight: 800;
      font-family: monospace;
      border: 2px solid #475569;
      border-radius: 8px;
      background: #0f172a;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .bit-btn.active {
      background: #0284c7;
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
      transform: translateY(-2px);
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    .res-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 14px 8px;
    }
    .res-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
    .res-value { font-size: 20px; font-weight: 700; font-family: monospace; color: #f1f5f9; }
    .res-value.accent { color: #38bdf8; }
    .btn-reset {
      margin-top: 24px;
      padding: 10px 20px;
      background: #334155;
      color: #f8fafc;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-reset:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔬 Laboratorium Interaktif Sistem Bilangan</h1>
    <p class="subtitle">Klik switch register 8-bit di bawah untuk mempelajari konversi nilai secara interaktif.</p>
    
    <div class="bits-container" id="bitsRow"></div>

    <div class="results-grid">
      <div class="res-card">
        <div class="res-label">Desimal (Base 10)</div>
        <div class="res-value accent" id="valDec">0</div>
      </div>
      <div class="res-card">
        <div class="res-label">Heksadesimal (Base 16)</div>
        <div class="res-value" id="valHex">0x00</div>
      </div>
      <div class="res-card">
        <div class="res-label">Oktal (Base 8)</div>
        <div class="res-value" id="valOct">000</div>
      </div>
    </div>

    <button class="btn-reset" onclick="resetBits()">Reset Register</button>
  </div>

  <script>
    const weights = [128, 64, 32, 16, 8, 4, 2, 1];
    let bits = [0, 0, 0, 0, 0, 0, 0, 0];

    function render() {
      const container = document.getElementById('bitsRow');
      container.innerHTML = '';
      let total = 0;

      weights.forEach((w, i) => {
        if (bits[i]) total += w;

        const box = document.createElement('div');
        box.className = 'bit-box';

        const label = document.createElement('div');
        label.className = 'bit-val';
        label.innerText = w;

        const btn = document.createElement('button');
        btn.className = 'bit-btn' + (bits[i] ? ' active' : '');
        btn.innerText = bits[i];
        btn.onclick = () => {
          bits[i] = bits[i] ? 0 : 1;
          render();
        };

        box.appendChild(label);
        box.appendChild(btn);
        container.appendChild(box);
      });

      document.getElementById('valDec').innerText = total;
      document.getElementById('valHex').innerText = '0x' + total.toString(16).toUpperCase().padStart(2, '0');
      document.getElementById('valOct').innerText = total.toString(8).padStart(3, '0');
    }

    function resetBits() {
      bits = [0, 0, 0, 0, 0, 0, 0, 0];
      render();
    }

    render();
  </script>
</body>
</html>`;
      fs.writeFileSync(path.join(game1Dir, "index.html"), htmlContent, "utf-8");
      fs.writeFileSync(path.join(game1Dir, "manifest.json"), JSON.stringify({
        simulationId: 1,
        status: "ready",
        entryPoint: "index.html",
        hasGzip: true,
        hasBrotli: true,
        updatedAt: Date.now()
      }, null, 2), "utf-8");

      const AdmZip = (await import("adm-zip")).default;
      const zip = new AdmZip();
      zip.addLocalFile(path.join(game1Dir, "index.html"));
      zip.addLocalFile(path.join(game1Dir, "manifest.json"));
      zip.writeZip(zipPath);
    } catch(seedErr) {
      console.error("Failed to seed sample simulation:", seedErr);
    }
  }

  // Link game_1 metadata
  if (modulesData.length > 0 && modulesData[0].games && modulesData[0].games.length > 0) {
    if (!modulesData[0].games[0].path) {
      modulesData[0].games[0].path = '/games/game_1.zip';
      modulesData[0].games[0].entryPoint = 'index.html';
    }
  }

  await doSaveDb();
}

let isSavingDb = false;
let pendingSaveDb = false;

async function doSaveDb() {
  if (!db) return;
  if (isSavingDb) {
    pendingSaveDb = true;
    return;
  }
  isSavingDb = true;
  pendingSaveDb = false;
  
  await db.exec("BEGIN TRANSACTION");
  try {
    await db.run("DELETE FROM admin_profile");
    await db.run("INSERT INTO admin_profile (id, data) VALUES (?, ?)", [3, JSON.stringify(adminProfile)]);

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
    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];
      const typeRow = await db.get("SELECT id FROM question_types WHERE code = ?", [q.type || 'multiple_choice']);
      const type_id = typeRow ? typeRow.id : null;
      const qId = q.id ? parseInt(q.id) : (i + 1);
      await db.run("INSERT INTO questions (id, module_id, type_id, data) VALUES (?, ?, ?, ?)", [qId, Number(q.module_id), type_id, JSON.stringify(q)]);
    }

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    console.error("Failed to save database:", error);
  } finally {
    isSavingDb = false;
    if (pendingSaveDb) {
      doSaveDb().catch(console.error);
    }
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
  const httpServer = http.createServer(app);
  app.use(compression({ level: 9, threshold: 0 }) as any);
  const PORT = process.env.PORT || 3000;

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

  
// API routes go here FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

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
  (uploadBannerMemory.single('image') as any)(req, res, async (err) => {
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

  app.post("/api/upload-avatar", uploadAvatar.single('avatar') as any, (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded or invalid format" });
    res.json({ success: true, url: `/api/avatars/${req.file.filename}` });
  });

  function isEmailUnique(email: string, excludeId?: number, excludeRole?: string) {
    if (adminProfile.email === email && !(excludeRole === 'admin' && adminProfile.id === excludeId)) return false;
    if (['admin', 'admin@sch.id', 'admin@sekolah.sch.id'].includes(email) && !(excludeRole === 'admin')) return false;
    if (studentsData.some(s => !s.isDeleted && s.email === email && !(excludeRole === 'siswa' && s.id === excludeId))) return false;
    if (teachersData.some(t => !t.isDeleted && t.email === email && !(excludeRole === 'guru' && t.id === excludeId))) return false;
    return true;
  }

  function isNisnUnique(nisn: string, excludeId?: number) {
    if (!nisn) return true;
    return !studentsData.some(s => !s.isDeleted && s.nisn === nisn && s.id !== excludeId);
  }

  function isNipUnique(nip: string, excludeId?: number) {
    if (!nip) return true;
    return !teachersData.some(t => !t.isDeleted && t.nip === nip && t.id !== excludeId);
  }

  app.post("/api/auth/guest-login", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nama harus diisi" });
    const user = {
      id: "guest_" + Date.now(),
      name: name,
      email: "guest@simulasisains.id",
      role: 'siswa',
      isGuest: true,
      avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random&color=fff&size=100"
    };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Username/Email dan password wajib diisi." });
    }

    const rawIdentifier = (email || '').toString().trim();
    const identifierLower = rawIdentifier.toLowerCase();
    const rawPassword = (password || '').toString().trim();

    let foundUser = null;
    let isAccountDeleted = false;

    // Helper to safely check password
    const checkPassword = async (storedPassword?: string) => {
      if (!storedPassword) return false;
      try {
        const isBcrypt = await bcrypt.compare(rawPassword, storedPassword);
        if (isBcrypt) return true;
      } catch (e) {}
      return storedPassword === rawPassword;
    };

    // 1. Check Admin
    const adminEmail = (adminProfile.email || '').toLowerCase();
    const adminUsername = (adminProfile.username || '').toLowerCase();
    const adminName = (adminProfile.name || '').toLowerCase();
    if (
      identifierLower === adminEmail ||
      identifierLower === adminUsername ||
      identifierLower === adminName ||
      identifierLower === 'admin' ||
      identifierLower === 'admin@sch.id' ||
      identifierLower === 'admin@sekolah.sch.id' ||
      identifierLower === 'administrator'
    ) {
       const match = await checkPassword(adminProfile.password);
       if (match) {
         foundUser = { ...adminProfile, role: "admin" };
       }
    }

    // 2. Check Student (Matches: email, NISN, username, or name - case-insensitive)
    if (!foundUser) {
      // Find candidate student
      const student = studentsData.find(s => {
        const sEmail = (s.email || '').toString().trim().toLowerCase();
        const sNisn = (s.nisn || '').toString().trim();
        const sUsername = (s.username || '').toString().trim().toLowerCase();
        const sName = (s.name || '').toString().trim().toLowerCase();
        
        return (
          (sEmail && sEmail === identifierLower) ||
          (sNisn && sNisn === rawIdentifier) ||
          (sUsername && sUsername === identifierLower) ||
          (sName && sName === identifierLower)
        );
      });

      if (student) {
        if (student.isDeleted) {
          isAccountDeleted = true;
        } else {
          const match = await checkPassword(student.password);
          if (match) {
            foundUser = { ...student, role: "siswa" };
          }
        }
      }
    }

    // 3. Check Teacher (Matches: email, NIP, username, or name - case-insensitive)
    if (!foundUser && !isAccountDeleted) {
      const teacher = teachersData.find(t => {
        const tEmail = (t.email || '').toString().trim().toLowerCase();
        const tNip = (t.nip || '').toString().trim();
        const tUsername = (t.username || '').toString().trim().toLowerCase();
        const tName = (t.name || '').toString().trim().toLowerCase();
        
        return (
          (tEmail && tEmail === identifierLower) ||
          (tNip && tNip === rawIdentifier) ||
          (tUsername && tUsername === identifierLower) ||
          (tName && tName === identifierLower)
        );
      });

      if (teacher) {
        if (teacher.isDeleted) {
          isAccountDeleted = true;
        } else {
          const match = await checkPassword(teacher.password);
          if (match) {
            foundUser = { ...teacher, role: "guru" };
          }
        }
      }
    }

    if (isAccountDeleted) {
      return res.status(403).json({ success: false, error: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator sekolah." });
    }

    if (!foundUser) {
      return res.status(401).json({ success: false, error: "Username/Email atau password salah." });
    }

    let category_ids = foundUser.category_ids || [];
    if (foundUser.school_id) {
      const school = schoolsData.find(s => s.id === foundUser.school_id);
      if (school && !category_ids.includes(school.category_id)) {
        category_ids = [...category_ids, school.category_id];
      }
    }

    const user = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role, category_ids, subject_ids: foundUser.subject_ids, avatar: foundUser.avatar, school_id: foundUser.school_id, nisn: foundUser.nisn, nip: foundUser.nip };

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

  
  app.post("/api/auth/anomaly", (req, res) => {
    const { email, attemptedRole, actualRole } = req.body;
    console.warn(`[SECURITY ANOMALY] Unauthorized access attempt: email=${email}, attemptedRole=${attemptedRole}, actualRole=${actualRole}`);
    logActivity('system', 'System', `Percobaan akses tidak sah: Email ${email} mencoba login sebagai ${attemptedRole} (Role asli: ${actualRole})`);
    saveDb();
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
         if (!t || t.isDeleted) return res.status(401).json({ error: "Akun dinonaktifkan atau tidak ditemukan." });
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
         if (!s || s.isDeleted) return res.status(401).json({ error: "Akun dinonaktifkan atau tidak ditemukan." });
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

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
    const { id, name, email, role, password } = req.body;
    let found = false;
    let newAvatar = undefined;
    
    if (!isEmailUnique(email, id, role)) {
      return res.status(400).json({ error: "Email sudah digunakan oleh pengguna lain!" });
    }

    if (role === 'siswa') {
      const idx = studentsData.findIndex(s => s.id === id);
      if (idx !== -1) { 
        studentsData[idx] = { ...studentsData[idx], name, email }; 
        if (password) studentsData[idx].password = await bcrypt.hash(password, 10);
        newAvatar = studentsData[idx].avatar; 
        found = true; 
      }
    } else if (role === 'guru') {
      const idx = teachersData.findIndex(t => t.id === id);
      if (idx !== -1) { 
        teachersData[idx] = { ...teachersData[idx], name, email }; 
        if (password) teachersData[idx].password = await bcrypt.hash(password, 10);
        newAvatar = teachersData[idx].avatar; 
        found = true; 
      }
    } else if (role === 'admin' && id === adminProfile.id) {
      adminProfile = { ...adminProfile, name, email };
      if (password) adminProfile.password = await bcrypt.hash(password, 10);
      newAvatar = adminProfile.avatar;
      found = true;
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
    const moduleId = parseInt(req.params.id as string);
    const questions = questionsData.filter(q => Number(q.module_id) === moduleId);
    res.json({ questions });
  });

  app.post('/api/modules/:id/questions', authenticateToken, isAdmin, (req, res) => {
    const moduleId = parseInt(req.params.id as string);
    const newQuestions = req.body.questions;
    
    questionsData = questionsData.filter(q => Number(q.module_id) !== moduleId);
    
    if (Array.isArray(newQuestions)) {
       newQuestions.forEach((q, idx) => {
          questionsData.push({
             id: q.id ? parseInt(q.id) : (Date.now() + idx + Math.floor(Math.random() * 100000)),
             module_id: moduleId,
             type: q.type || 'multiple_choice',
             text: q.text || '',
             options: Array.isArray(q.options) ? q.options : [],
             correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
             correctAnswer: typeof q.correctAnswer === 'boolean' ? q.correctAnswer : true,
             correctAnswerText: q.correctAnswerText || '',
             correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [],
             pairs: Array.isArray(q.pairs) ? q.pairs : [],
             explanation: q.explanation || ''
          });
       });
    }
    
    saveDb();
    const count = questionsData.filter(q => Number(q.module_id) === moduleId).length;
    res.json({ success: true, count });
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


  // EXCEL EXPORT ROUTES
  app.get("/api/schools/export", authenticateToken, isStrictAdmin, (req, res) => {
    const data = schoolsData.map((s, i) => ({
      'No': i + 1,
      'ID Jenjang': s.category_id,
      'Nama Sekolah': s.name
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sekolah");
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="Template_Sekolah.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });

  app.get("/api/students/export", authenticateToken, isStrictAdmin, (req, res) => {
    const data = studentsData.map((s, i) => ({
      'No': i + 1,
      'Nama Lengkap': s.name,
      'Email': s.email,
      'Password': '',
      'Konfirmasi Password': '',
      'NISN': s.nisn || '',
      'ID Sekolah': s.school_id || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="Template_Siswa.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });

  app.get("/api/teachers/export", authenticateToken, isStrictAdmin, (req, res) => {
    const data = teachersData.map((t, i) => ({
      'No': i + 1,
      'Nama Lengkap': t.name,
      'Email': t.email,
      'Password': '',
      'Konfirmasi Password': '',
      'NIP': t.nip || '',
      'ID Jenjang (Koma dipisahkan)': (t.category_ids || []).join(','),
      'ID Mapel (Koma dipisahkan)': (t.subject_ids || []).join(',')
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guru");
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="Template_Guru.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });

  // EXCEL IMPORT ROUTES
  const uploadExcel = multer({ storage: multer.memoryStorage() });
  app.post("/api/schools/import", authenticateToken, isStrictAdmin, uploadExcel.single('file') as any, (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      
      if (rows.length === 0) return res.status(400).json({ error: "File Excel kosong" });
      
      const firstRow = rows[0];
      if (!('ID Jenjang' in firstRow) || !('Nama Sekolah' in firstRow)) {
        return res.status(400).json({ error: "Format Excel tidak sesuai template. Pastikan ada kolom 'ID Jenjang' dan 'Nama Sekolah'." });
      }

      for (const row of rows) {
        if (row['Nama Sekolah'] && row['ID Jenjang']) {
          schoolsData.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: row['Nama Sekolah'],
            category_id: parseInt(row['ID Jenjang'], 10)
          });
        }
      }
      saveDb();
      res.json({ success: true, message: `Berhasil mengimpor ${rows.length} sekolah` });
    } catch (e) {
      res.status(500).json({ error: "Gagal memproses file Excel" });
    }
  });

  app.post("/api/students/import", authenticateToken, isStrictAdmin, uploadExcel.single('file') as any, async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      
      if (rows.length === 0) return res.status(400).json({ error: "File Excel kosong" });
      
      const firstRow = rows[0];
      if (!('Nama Lengkap' in firstRow) || !('Email' in firstRow) || !('ID Sekolah' in firstRow)) {
        return res.status(400).json({ error: "Format Excel tidak sesuai template. Pastikan ada kolom 'Nama Lengkap', 'Email', dan 'ID Sekolah'." });
      }

      for (const row of rows) {
        if (!row['Password']) {
          return res.status(400).json({ error: "Kolom 'Password' wajib diisi untuk semua siswa dalam file Excel." });
        }
        if (row["Password"] !== row["Konfirmasi Password"]) {
          return res.status(400).json({ error: "Kolom Password dan Konfirmasi Password tidak cocok." });
        }
        if (!row['Email'] || !isEmailUnique(row['Email'].toString())) {
          return res.status(400).json({ error: `Email '${row['Email']}' sudah digunakan atau kosong.` });
        }
        if (row['NISN'] && !isNisnUnique(row['NISN'].toString())) {
          return res.status(400).json({ error: `NISN '${row['NISN']}' sudah terdaftar.` });
        }
      }

      for (const row of rows) {
        if (row['Nama Lengkap'] && row['Email']) {
          let hash = await bcrypt.hash(row['Password'].toString(), 10);
          studentsData.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: row['Nama Lengkap'],
            email: row['Email'],
            password: hash,
            nisn: row['NISN'] ? row['NISN'].toString() : '',
            school_id: row['ID Sekolah'] ? parseInt(row['ID Sekolah'], 10) : null,
            role: 'siswa',
            progress: 0,
            isDeleted: false
          });
        }
      }
      saveDb();
      res.json({ success: true, message: `Berhasil mengimpor ${rows.length} siswa` });
    } catch (e) {
      res.status(500).json({ error: "Gagal memproses file Excel" });
    }
  });

  app.post("/api/teachers/import", authenticateToken, isStrictAdmin, uploadExcel.single('file') as any, async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      
      if (rows.length === 0) return res.status(400).json({ error: "File Excel kosong" });
      
      const firstRow = rows[0];
      if (!('Nama Lengkap' in firstRow) || !('Email' in firstRow)) {
        return res.status(400).json({ error: "Format Excel tidak sesuai template. Pastikan ada kolom 'Nama Lengkap' dan 'Email'." });
      }

      for (const row of rows) {
        if (!row['Password']) {
          return res.status(400).json({ error: "Kolom 'Password' wajib diisi untuk semua guru dalam file Excel." });
        }
        if (row["Password"] !== row["Konfirmasi Password"]) {
          return res.status(400).json({ error: "Kolom Password dan Konfirmasi Password tidak cocok." });
        }
        if (!row['Email'] || !isEmailUnique(row['Email'].toString())) {
          return res.status(400).json({ error: `Email '${row['Email']}' sudah digunakan atau kosong.` });
        }
        if (row['NIP'] && !isNipUnique(row['NIP'].toString())) {
          return res.status(400).json({ error: `NIP '${row['NIP']}' sudah terdaftar.` });
        }
      }

      for (const row of rows) {
        if (row['Nama Lengkap'] && row['Email']) {
          let hash = await bcrypt.hash(row['Password'].toString(), 10);
          teachersData.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: row['Nama Lengkap'],
            email: row['Email'],
            password: hash,
            nip: row['NIP'] ? row['NIP'].toString() : '',
            category_ids: row['ID Jenjang (Koma dipisahkan)'] ? row['ID Jenjang (Koma dipisahkan)'].toString().split(',').map((s: string) => parseInt(s.trim())) : [],
            subject_ids: row['ID Mapel (Koma dipisahkan)'] ? row['ID Mapel (Koma dipisahkan)'].toString().split(',').map((s: string) => parseInt(s.trim())) : [],
            role: 'guru',
            isDeleted: false
          });
        }
      }
      saveDb();
      res.json({ success: true, message: `Berhasil mengimpor ${rows.length} guru` });
    } catch (e) {
      res.status(500).json({ error: "Gagal memproses file Excel" });
    }
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
      questionCount: questionsData.filter(q => Number(q.module_id) === Number(m.id)).length
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

  app.post("/api/modules", authenticateToken, isAdmin, upload.array('gameFiles') as any, async (req, res) => {
    try {
      let { title, desc, level, category_id, subject_id, duration, material, gamesMeta, banner_url, is_restricted } = req.body;
      try { material = JSON.parse(material || '[]'); } catch(e) {}
      try { gamesMeta = JSON.parse(gamesMeta || '[]'); } catch(e) {}

      const files = req.files as Express.Multer.File[];
      let fileIndex = 0;
      if (files && files.length > 0) {
        for (let i = 0; i < gamesMeta.length; i++) {
          if (gamesMeta[i].hasNewFile && fileIndex < files.length) {
            const file = files[fileIndex++];
            const gameDir = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}`);
            const zipPath = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}.zip`);
            try {
              if (!fs.existsSync(gameDir)) {
                fs.mkdirSync(gameDir, { recursive: true });
              }
              // Save zip
              fs.copyFileSync(file.path, zipPath);
              try {
                await extract(file.path, { dir: gameDir });
                const entryRel = findIndexHtmlRelative(gameDir);
                if (entryRel) {
                  gamesMeta[i].entryPoint = entryRel.split(path.sep).map(encodeURIComponent).join('/');
                  try {
                    fs.writeFileSync(path.join(gameDir, 'manifest.json'), JSON.stringify({
                      simulationId: gamesMeta[i].id,
                      status: 'ready',
                      entryPoint: gamesMeta[i].entryPoint,
                      updatedAt: Date.now()
                    }, null, 2));
                    const rootIndex = path.join(gameDir, 'index.html');
                    if (!fs.existsSync(rootIndex)) {
                      fs.writeFileSync(rootIndex, `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=./${gamesMeta[i].entryPoint}"><script>location.replace('./' + ${JSON.stringify(gamesMeta[i].entryPoint)});</script></head><body>Redirecting to simulation...</body></html>`, 'utf-8');
                    }
                  } catch(e) {}
                }
              } catch (ex) {
                console.error("Server-side zip extraction warning:", ex);
              }
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
        status: 'locked', banner_url, is_restricted: is_restricted === 'true' || is_restricted === true
      };
      modulesData.push(newModule);
      logActivity('module', 'Admin', `Menambahkan modul baru "${title}"`);
      saveDb();
      const qCount = questionsData.filter(q => Number(q.module_id) === Number(newModule.id)).length;
      res.json({ success: true, module: { ...newModule, questionCount: qCount } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create module" });
    }
  });

  app.put("/api/modules/:id", authenticateToken, isAdmin, upload.array('gameFiles') as any, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const index = modulesData.findIndex(m => m.id === id);
      if (index === -1) return res.status(404).json({ error: "Not found" });

      let { title, desc, level, category_id, subject_id, duration, material, gamesMeta, banner_url, is_restricted } = req.body;
      try { material = JSON.parse(material || '[]'); } catch(e) {}
      try { gamesMeta = JSON.parse(gamesMeta || '[]'); } catch(e) {}

      const files = req.files as Express.Multer.File[];
      let fileIndex = 0;
      if (files && files.length > 0) {
        for (let i = 0; i < gamesMeta.length; i++) {
          if (gamesMeta[i].hasNewFile && fileIndex < files.length) {
            const file = files[fileIndex++];
            const gameDir = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}`);
            const zipPath = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}.zip`);
            try {
              if (!fs.existsSync(gameDir)) {
                fs.mkdirSync(gameDir, { recursive: true });
              }
              // Save zip
              fs.copyFileSync(file.path, zipPath);
              try {
                await extract(file.path, { dir: gameDir });
                const entryRel = findIndexHtmlRelative(gameDir);
                if (entryRel) {
                  gamesMeta[i].entryPoint = entryRel.split(path.sep).map(encodeURIComponent).join('/');
                  try {
                    fs.writeFileSync(path.join(gameDir, 'manifest.json'), JSON.stringify({
                      simulationId: gamesMeta[i].id,
                      status: 'ready',
                      entryPoint: gamesMeta[i].entryPoint,
                      updatedAt: Date.now()
                    }, null, 2));
                    const rootIndex = path.join(gameDir, 'index.html');
                    if (!fs.existsSync(rootIndex)) {
                      fs.writeFileSync(rootIndex, `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=./${gamesMeta[i].entryPoint}"><script>location.replace('./' + ${JSON.stringify(gamesMeta[i].entryPoint)});</script></head><body>Redirecting to simulation...</body></html>`, 'utf-8');
                    }
                  } catch(e) {}
                }
              } catch (ex) {
                console.error("Server-side zip extraction warning:", ex);
              }
              gamesMeta[i].path = `/games/game_${gamesMeta[i].id}.zip`;
            } catch (zipError) {
              console.error("Failed to extract zip:", zipError);
            } finally {
              try { fs.unlinkSync(file.path); } catch(err){}
            }
          }
        }
      }

      const oldBannerUrl = modulesData[index].banner_url;
      if (oldBannerUrl && oldBannerUrl !== banner_url) {
        const oldFilename = oldBannerUrl.split('/').pop();
        if (oldFilename) {
          const oldFilepath = path.join(BANNERS_DIR, oldFilename);
          try {
            if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
          } catch(err) {
            console.error('Failed to delete old banner:', err);
          }
        }
      }

      modulesData[index] = { 
        ...modulesData[index], 
        title, desc, level, 
        category_id: parseInt(category_id) || null,
        subject_id: parseInt(subject_id) || null,
        duration, material, games: gamesMeta, gameCount: gamesMeta?.length || 0, banner_url, is_restricted: is_restricted === 'true' || is_restricted === true
      };
      logActivity('module', 'Admin', `Mengubah modul "${title}"`);
      saveDb();
      const qCount = questionsData.filter(q => Number(q.module_id) === Number(modulesData[index].id)).length;
      res.json({ success: true, module: { ...modulesData[index], questionCount: qCount } });
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
      if (module.banner_url) {
        const oldFilename = module.banner_url.split('/').pop();
        if (oldFilename) {
          const oldFilepath = path.join(BANNERS_DIR, oldFilename);
          try {
            if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
          } catch(err) {}
        }
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
    if (!req.body.name || !req.body.email || !req.body.nip || !req.body.password) {
      return res.status(400).json({ error: "Nama, Email, NIP, dan Password wajib diisi!" });
    }
    if (!isEmailUnique(req.body.email)) {
      return res.status(400).json({ error: "Email sudah digunakan oleh pengguna lain!" });
    }
    if (!isNipUnique(req.body.nip)) {
      return res.status(400).json({ error: "NIP sudah terdaftar!" });
    }
    const newTeacher = { id: Date.now(), ...req.body };
    newTeacher.password = await bcrypt.hash(newTeacher.password, 10);
    teachersData.push(newTeacher);
    logActivity('teacher', 'Admin', `Mendaftarkan guru "${newTeacher.name}"`);
    saveDb();
    res.json({ success: true, teacher: newTeacher });
  });
  app.put("/api/teachers/:id", authenticateToken, isStrictAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    
    if (req.body.email && !isEmailUnique(req.body.email, id, 'guru')) {
      return res.status(400).json({ error: "Email sudah digunakan oleh pengguna lain!" });
    }
    if (req.body.nip && !isNipUnique(req.body.nip, id)) {
      return res.status(400).json({ error: "NIP sudah terdaftar!" });
    }

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    teachersData[index] = { ...teachersData[index], ...updateData };
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
      const teacher = teachersData[index];
      if (!isEmailUnique(teacher.email, id, 'guru')) {
        return res.status(400).json({ error: "Gagal memulihkan: Email ini sudah digunakan oleh pengguna aktif lain!" });
      }
      if (teacher.nip && !isNipUnique(teacher.nip, id)) {
        return res.status(400).json({ error: "Gagal memulihkan: NIP ini sudah terdaftar pada pengguna aktif lain!" });
      }
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
    if (!req.body.name || !req.body.email || !req.body.nisn || !req.body.password) {
      return res.status(400).json({ error: "Nama, Email, NISN, dan Password wajib diisi!" });
    }
    if (!isEmailUnique(req.body.email)) {
      return res.status(400).json({ error: "Email sudah digunakan oleh pengguna lain!" });
    }
    if (!isNisnUnique(req.body.nisn)) {
      return res.status(400).json({ error: "NISN sudah terdaftar!" });
    }
    const newStudent = { id: Date.now(), progress: 0, ...req.body };
    newStudent.password = await bcrypt.hash(newStudent.password, 10);
    studentsData.push(newStudent);
    logActivity('student', 'Admin', `Mendaftarkan siswa "${newStudent.name}"`);
    saveDb();
    res.json({ success: true, student: newStudent });
  });

  app.put("/api/students/:id", authenticateToken, isStrictAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    
    if (req.body.email && !isEmailUnique(req.body.email, id, 'siswa')) {
      return res.status(400).json({ error: "Email sudah digunakan oleh pengguna lain!" });
    }
    if (req.body.nisn && !isNisnUnique(req.body.nisn, id)) {
      return res.status(400).json({ error: "NISN sudah terdaftar!" });
    }

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    studentsData[index] = { ...studentsData[index], ...updateData };
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
      const student = studentsData[index];
      if (!isEmailUnique(student.email, id, 'siswa')) {
        return res.status(400).json({ error: "Gagal memulihkan: Email ini sudah digunakan oleh pengguna aktif lain!" });
      }
      if (student.nisn && !isNisnUnique(student.nisn, id)) {
        return res.status(400).json({ error: "Gagal memulihkan: NISN ini sudah terdaftar pada pengguna aktif lain!" });
      }
      studentsData[index].isDeleted = false;
      logActivity('student', 'Admin', `Mengaktifkan siswa "${studentsData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  // Helper: Find index.html recursively within simulation folder
  function findIndexHtmlRelative(dir: string, maxDepth = 5, currentDepth = 0): string | null {
    if (currentDepth > maxDepth || !fs.existsSync(dir)) return null;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      // Priority 1: direct index.html in current directory
      const indexFile = entries.find(e => e.isFile() && e.name.toLowerCase() === 'index.html');
      if (indexFile) return indexFile.name;

      // Priority 2: subdirectories (ignore hidden and macOS metadata)
      const subdirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.') && !e.name.includes('__MACOSX'));
      for (const subdir of subdirs) {
        const subResult = findIndexHtmlRelative(path.join(dir, subdir.name), maxDepth, currentDepth + 1);
        if (subResult) {
          return path.join(subdir.name, subResult);
        }
      }
    } catch (e) {}
    return null;
  }

  // Helper: MIME types for simulation assets
  function getSimulationMimeType(filename: string): string {
    let cleanName = filename.toLowerCase();
    if (cleanName.endsWith('.gz')) cleanName = cleanName.slice(0, -3);
    if (cleanName.endsWith('.br')) cleanName = cleanName.slice(0, -3);
    const ext = cleanName.split('.').pop() || '';

    const types: Record<string, string> = {
      'html': 'text/html; charset=utf-8',
      'htm': 'text/html; charset=utf-8',
      'js': 'application/javascript; charset=utf-8',
      'mjs': 'application/javascript; charset=utf-8',
      'css': 'text/css; charset=utf-8',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'svg': 'image/svg+xml',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'ico': 'image/x-icon',
      'wav': 'audio/wav',
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'wasm': 'application/wasm',
      'data': 'application/octet-stream',
      'unityweb': 'application/octet-stream',
      'mem': 'application/octet-stream',
      'symbols': 'application/json',
      'zip': 'application/zip'
    };
    return types[ext] || 'application/octet-stream';
  }

  // Core Simulation File Dispatcher with GZIP, BROTLI & Subfolder Resolution
  function serveSimulationFile(req: express.Request, res: express.Response, baseRoute: string) {
    const regex = new RegExp('^' + baseRoute.replace('/', '\\/') + '\\/?');
    let cleanPath = req.path.replace(regex, '');
    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch (e) {}

    // Security: sanitize against path traversal
    const safeRelativePath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '');
    const targetFullPath = path.join(PUBLIC_GAMES_DIR, safeRelativePath);

    if (!targetFullPath.startsWith(PUBLIC_GAMES_DIR)) {
      return res.status(403).send("Access Denied");
    }

    // Direct ZIP request handler
    if (safeRelativePath.toLowerCase().endsWith('.zip')) {
      if (fs.existsSync(targetFullPath) && fs.statSync(targetFullPath).isFile()) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.sendFile(targetFullPath);
      }
      return res.status(404).send('Simulation ZIP package not found on server.');
    }

    // Directory / Entry point handler
    if (fs.existsSync(targetFullPath) && fs.statSync(targetFullPath).isDirectory()) {
      if (!req.path.endsWith('/')) {
        const redirectUrl = req.originalUrl.split('?')[0] + '/' + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '');
        return res.redirect(301, redirectUrl);
      }

      // If direct index.html exists
      const directIndex = path.join(targetFullPath, 'index.html');
      if (fs.existsSync(directIndex) && fs.statSync(directIndex).isFile()) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'no-cache');
        return res.sendFile(directIndex);
      }

      // If nested in subfolder (e.g. DENYUT JANTUNG_640/index.html)
      const relativeIndex = findIndexHtmlRelative(targetFullPath);
      if (relativeIndex) {
        const encodedSubPath = relativeIndex.split(path.sep).map(encodeURIComponent).join('/');
        const destUrl = req.originalUrl.replace(/\/+$/, '') + '/' + encodedSubPath;
        return res.redirect(302, destUrl);
      }

      return res.status(404).send('Simulation index.html not found inside package.');
    }

    // Asset file matching with GZIP & BROTLI variants
    const candidates: { path: string; encoding?: string }[] = [];

    // Exact path
    candidates.push({ path: targetFullPath });

    // Compressed variants
    candidates.push({ path: targetFullPath + '.br', encoding: 'br' });
    candidates.push({ path: targetFullPath + '.gz', encoding: 'gzip' });
    candidates.push({ path: targetFullPath + '.unityweb' });

    // Extension transforms for WebGL runtime requests (.wasm -> .wasm.br, .data -> .data.gz, etc)
    if (/\.(wasm|data|js|json)$/i.test(targetFullPath)) {
      candidates.push({ path: targetFullPath.replace(/\.(wasm|data|js|json)$/i, '.$1.br'), encoding: 'br' });
      candidates.push({ path: targetFullPath.replace(/\.(wasm|data|js|json)$/i, '.$1.gz'), encoding: 'gzip' });
      candidates.push({ path: targetFullPath.replace(/\.(wasm|data|js|json)$/i, '.$1.unityweb') });
    }

    if (targetFullPath.endsWith('.js')) {
      candidates.push({ path: targetFullPath.replace(/\.js$/, '.framework.js.br'), encoding: 'br' });
      candidates.push({ path: targetFullPath.replace(/\.js$/, '.framework.js.gz'), encoding: 'gzip' });
    }

    let matchedFile: string | null = null;
    let matchedEncoding: string | undefined = undefined;

    for (const cand of candidates) {
      if (fs.existsSync(cand.path)) {
        try {
          if (fs.statSync(cand.path).isFile()) {
            matchedFile = cand.path;
            matchedEncoding = cand.encoding;
            break;
          }
        } catch (e) {}
      }
    }

    if (!matchedFile) {
      return res.status(404).send('Simulation asset not found: ' + path.basename(safeRelativePath));
    }

    // Detect GZIP magic bytes if .unityweb or .data lacks encoding header
    if (!matchedEncoding && (matchedFile.endsWith('.unityweb') || matchedFile.endsWith('.data'))) {
      try {
        const fd = fs.openSync(matchedFile, 'r');
        const buf = Buffer.alloc(2);
        fs.readSync(fd, buf, 0, 2, 0);
        fs.closeSync(fd);
        if (buf[0] === 0x1f && buf[1] === 0x8b) {
          matchedEncoding = 'gzip';
        }
      } catch (e) {}
    }

    const mimeType = getSimulationMimeType(targetFullPath);
    res.setHeader('Content-Type', mimeType);

    if (matchedEncoding) {
      res.setHeader('Content-Encoding', matchedEncoding);
    }

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    if (matchedFile.toLowerCase().endsWith('.html') || matchedFile.toLowerCase().endsWith('.htm')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return res.sendFile(matchedFile);
  }

  // Register simulation routes for both /games and /local-game-play
  app.get('/game-sw.js', (req, res, next) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  app.all('/games/*', (req, res) => {
    serveSimulationFile(req, res, '/games');
  });

  app.all('/local-game-play/*', (req, res) => {
    serveSimulationFile(req, res, '/local-game-play');
  });

  // Provide JSON 404 for unhandled API routes instead of falling back to Vite SPA
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API Endpoint not found' });
  });

  // Vite Integration
  const isProduction = process.env.NODE_ENV === "production" || process.argv[1]?.endsWith(".cjs");
  if (!isProduction) {
    const vite = await import("vite");
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use('/digital/simulasisains', viteServer.middlewares);
    app.use(viteServer.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use('/digital/simulasisains', express.static(distPath));
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

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
