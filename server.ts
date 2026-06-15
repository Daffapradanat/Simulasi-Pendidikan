import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { configureSecurity } from "./serverSecurity";
import AdmZip from "adm-zip";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const PUBLIC_GAMES_DIR = path.join(process.cwd(), "public", "games");
if (!fs.existsSync(PUBLIC_GAMES_DIR)) {
  fs.mkdirSync(PUBLIC_GAMES_DIR, { recursive: true });
}

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Database Persistence
const DB_FILE = path.join(process.cwd(), "database.sqlite");
let db: any;

let modulesData: any[] = [];
let teachersData: any[] = [];
let studentsData: any[] = [];
let activitiesData: any[] = [];

async function initDB() {
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY,
      data TEXT
    )
  `);

  const row = await db.get('SELECT data FROM app_state WHERE id = 1');
  if (row) {
    const fileData = JSON.parse(row.data);
    modulesData = fileData.modules || [];
    teachersData = fileData.teachers || [];
    studentsData = fileData.students || [];
    activitiesData = fileData.activities || [];
  } else {
    // Migrate from database.json if exists
    const OLD_DB_FILE = path.join(process.cwd(), "database.json");
    if (fs.existsSync(OLD_DB_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(OLD_DB_FILE, 'utf-8'));
      modulesData = fileData.modules || [];
      teachersData = fileData.teachers || [];
      studentsData = fileData.students || [];
      activitiesData = fileData.activities || [];
    } else {
      modulesData = [];
      teachersData = [];
      studentsData = [];
      activitiesData = [];
    }

    // Add example users if missing
    if (!studentsData.find((s: any) => s.id === 1)) {
      studentsData.push({ id: 1, name: "Siswa Siswi", email: "siswa@murid.sekolah.sch.id", nisn: "1234567890", asalSekolah: "SMP Negeri 1", progress: 0 });
    }
    if (!teachersData.find((t: any) => t.id === 2)) {
      teachersData.push({ id: 2, name: "Guru Pengajar", email: "guru@sekolah.sch.id", nip: "198001012005011001", subject: "Ilmu Pengetahuan Alam" });
    }
    await saveDb();
  }
}

async function doSaveDb() {
  if (!db) return;
  const data = JSON.stringify({ modules: modulesData, teachers: teachersData, students: studentsData, activities: activitiesData });
  await db.run('INSERT OR REPLACE INTO app_state (id, data) VALUES (1, ?)', data);
}

function saveDb() {
  doSaveDb().catch(console.error);
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
  // Keep only the last 100 activities
  if (activitiesData.length > 100) activitiesData.pop();
  saveDb();
}

const SECRET_KEY = "simpend_secret_key_2025";

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  // Security controls are moved to /serverSecurity.ts and currently disabled
  // configureSecurity(app);

  app.use(cors());
  
  app.use(express.json());
  app.use(cookieParser());

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    let foundUser = null;
    
    // Check Admin
    if ((email === 'admin' || email === 'admin@sch.id') && password === 'admin123') {
      foundUser = { id: 3, name: "Administrator", email: "admin@sch.id", role: "admin" };
    }
    
    // Check Students
    if (!foundUser) {
      const student = studentsData.find(s => !s.isDeleted && s.email === email);
      if ((email === 'siswa' || email === 'siswa@murid.sekolah.sch.id') && password === 'siswa') {
        const s = studentsData.find(s => s.email === 'siswa@murid.sekolah.sch.id') || studentsData.find(s => s.id === 1);
        if (s) foundUser = { ...s, role: "siswa", name: s.name, email: 'siswa@murid.sekolah.sch.id' };
        else foundUser = { id: 1, name: "Siswa Siswi", email: "siswa@murid.sekolah.sch.id", role: "siswa" };
      } else if (student && password === 'siswa') {
        foundUser = { ...student, role: "siswa" };
      }
    }
    
    // Check Teachers
    if (!foundUser) {
      const teacher = teachersData.find(t => !t.isDeleted && t.email === email);
      if ((email === 'guru' || email === 'guru@sekolah.sch.id') && password === 'guru') {
        const t = teachersData.find(t => t.email === 'guru@sekolah.sch.id') || teachersData.find(t => t.id === 2);
        if (t) foundUser = { ...t, role: "guru", name: t.name, email: 'guru@sekolah.sch.id' };
        else foundUser = { id: 2, name: "Guru Pengajar", email: "guru@sekolah.sch.id", role: "guru" };
      } else if (teacher && password === 'guru') {
        foundUser = { ...teacher, role: "guru" };
      }
    }

    if (!foundUser) {
      return res.status(401).json({ success: false, error: "Email atau password salah." });
    }

    const user = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role };

    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true,
      sameSite: 'none' // Allow iframe cross-origin
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
      res.json({ user: { email: decoded.email, role: decoded.role, name: decoded.role === 'admin' ? 'Administrator' : 'Siswa' } });
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.get("/api/activities", (req, res) => {
    res.json(activitiesData);
  });

  // Modules CRUD
  app.get("/api/modules", (req, res) => {
    res.json(modulesData);
  });
  
  function findIndexPath(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;
    const items = fs.readdirSync(dir);
    if (items.includes('index.html')) return 'index.html';
    
    // Check in subfolders
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
         const subSearch = findIndexPath(fullPath);
         if (subSearch) return `${item}/${subSearch}`;
      }
    }
    return null;
  }

  app.post("/api/modules", upload.array('gameFiles'), async (req, res) => {
    try {
      let { title, desc, level, duration, material, gamesMeta } = req.body;
      try { material = JSON.parse(material || '[]'); } catch(e) {}
      try { gamesMeta = JSON.parse(gamesMeta || '[]'); } catch(e) {}

      // Process uploaded zip files if any
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
              const zip = new AdmZip(file.path);
              zip.extractAllTo(gameDir, true);
              const indexPath = findIndexPath(gameDir) || 'index.html';
              gamesMeta[i].path = `/games/game_${gamesMeta[i].id}/${indexPath}`;
            } catch (zipError) {
              console.error("Failed to extract zip:", zipError);
            }
          }
        }
      }

      const newModule = { 
        id: Date.now(), 
        title, desc, level, duration, material, 
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

  app.put("/api/modules/:id", upload.array('gameFiles'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const index = modulesData.findIndex(m => m.id === id);
      if (index === -1) return res.status(404).json({ error: "Not found" });

      let { title, desc, level, duration, material, gamesMeta } = req.body;
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
              const zip = new AdmZip(file.path);
              zip.extractAllTo(gameDir, true);
              const indexPath = findIndexPath(gameDir) || 'index.html';
              gamesMeta[i].path = `/games/game_${gamesMeta[i].id}/${indexPath}`;
            } catch (zipError) {
              console.error("Failed to extract zip:", zipError);
            }
          }
        }
      }

      modulesData[index] = { 
        ...modulesData[index], 
        title, desc, level, duration, material, games: gamesMeta, gameCount: gamesMeta?.length || 0
      };
      logActivity('module', 'Admin', `Mengubah modul "${title}"`);
      saveDb();
      res.json({ success: true, module: modulesData[index] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update module" });
    }
  });

  app.delete("/api/modules/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = modulesData.findIndex(m => m.id === id);
    if (index !== -1) {
      modulesData[index].isDeleted = true;
      logActivity('module', 'Admin', `Menghapus modul "${modulesData[index].title}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/modules/:id/restore", (req, res) => {
    const id = parseInt(req.params.id);
    const index = modulesData.findIndex(m => m.id === id);
    if (index !== -1) {
      modulesData[index].isDeleted = false;
      logActivity('module', 'Admin', `Memulihkan modul "${modulesData[index].title}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  // Teachers
  app.get("/api/teachers", (req, res) => {
    res.json(teachersData);
  });
  app.post("/api/teachers", (req, res) => {
    const newTeacher = { id: Date.now(), ...req.body };
    teachersData.push(newTeacher);
    logActivity('teacher', 'Admin', `Mendaftarkan guru "${newTeacher.name}"`);
    saveDb();
    res.json({ success: true, teacher: newTeacher });
  });
  app.put("/api/teachers/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    teachersData[index] = { ...teachersData[index], ...req.body };
    logActivity('teacher', 'Admin', `Memperbarui data guru "${teachersData[index].name}"`);
    saveDb();
    res.json({ success: true, teacher: teachersData[index] });
  });
  app.delete("/api/teachers/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index !== -1) {
      teachersData[index].isDeleted = true;
      logActivity('teacher', 'Admin', `Menonaktifkan guru "${teachersData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/teachers/:id/restore", (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index !== -1) {
      teachersData[index].isDeleted = false;
      logActivity('teacher', 'Admin', `Mengaktifkan guru "${teachersData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  // Students
  app.get("/api/students", (req, res) => {
    res.json(studentsData);
  });
  app.post("/api/students", (req, res) => {
    const newStudent = { id: Date.now(), progress: 0, ...req.body };
    studentsData.push(newStudent);
    logActivity('student', 'Admin', `Mendaftarkan siswa "${newStudent.name}"`);
    saveDb();
    res.json({ success: true, student: newStudent });
  });
  app.put("/api/students/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    studentsData[index] = { ...studentsData[index], ...req.body };
    logActivity('student', 'Admin', `Memperbarui data siswa "${studentsData[index].name}"`);
    saveDb();
    res.json({ success: true, student: studentsData[index] });
  });
  app.delete("/api/students/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index !== -1) {
      studentsData[index].isDeleted = true;
      logActivity('student', 'Admin', `Menonaktifkan siswa "${studentsData[index].name}"`);
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/students/:id/restore", (req, res) => {
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
  app.use('/games', (req, res, next) => {
    if (req.url.endsWith('.gz')) {
      res.set('Content-Encoding', 'gzip');
      if (req.url.includes('.wasm')) res.set('Content-Type', 'application/wasm');
      else if (req.url.includes('.js')) res.set('Content-Type', 'application/javascript');
      else if (req.url.includes('.data')) res.set('Content-Type', 'application/octet-stream');
    } else if (req.url.endsWith('.br')) {
      res.set('Content-Encoding', 'br');
      if (req.url.includes('.wasm')) res.set('Content-Type', 'application/wasm');
      else if (req.url.includes('.js')) res.set('Content-Type', 'application/javascript');
      else if (req.url.includes('.data')) res.set('Content-Type', 'application/octet-stream');
    } else if (req.url.endsWith('.wasm')) {
      res.set('Content-Type', 'application/wasm');
    }
    next();
  }, express.static(PUBLIC_GAMES_DIR));

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
