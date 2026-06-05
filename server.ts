import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import extractZip from "extract-zip";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { configureSecurity } from "./serverSecurity";

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
const DB_FILE = path.join(process.cwd(), "database.json");

let modulesData: any[] = [];
let teachersData: any[] = [];
let studentsData: any[] = [];

if (fs.existsSync(DB_FILE)) {
  const fileData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  modulesData = fileData.modules || [];
  teachersData = fileData.teachers || [];
  studentsData = fileData.students || [];
} else {
  modulesData = [
    { id: 1, title: 'Modul 1: Pengenalan Platform', desc: 'Mempelajari cara navigasi dan fitur utama', status: 'unlocked', level: 'Dasar', gameCount: 0, duration: '15 Menit' },
    { id: 2, title: 'Modul 2: Simulasi Mengajar', desc: 'Praktik mengajar di kelas virtual', status: 'locked', level: 'Menengah', gameCount: 2, duration: '45 Menit' },
  ];
  teachersData = [
    { id: 1, name: 'Budi Santoso', nip: '198001012010011001', email: 'budi@sekolah.sch.id', subject: 'Matematika' },
    { id: 2, name: 'Siti Aminah', nip: '198502022015022002', email: 'siti@sekolah.sch.id', subject: 'Bahasa Indonesia' }
  ];
  studentsData = [
    { id: 1, name: 'Daffa Pradana', nisn: '0012345678', asalSekolah: 'SMKN 1 Jakarta', email: 'daffa.pradana4a@gmail.com', progress: 50 },
    { id: 2, name: 'Siswa Demo', nisn: '0012345679', asalSekolah: 'SMKN 2 Jakarta', email: 'siswa@sekolah.sch.id', progress: 100 }
  ];
  saveDb();
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify({ modules: modulesData, teachers: teachersData, students: studentsData }, null, 2));
}

const SECRET_KEY = "simpend_secret_key_2025";

async function startServer() {
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
    let role = "siswa";
    let user = { name: "Pengguna", email, role };

    // Simple role determination for demonstration
    if (email.includes("admin")) {
      role = "admin";
      user = { name: "Administrator", email, role };
    } else if (email.includes("guru")) {
      role = "guru";
      user = { name: "Guru Pengajar", email, role };
    }

    const token = jwt.sign({ email, role }, SECRET_KEY, { expiresIn: '1d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' // CSRF protection (anti-cross link)
    });
    res.json({ success: true, user, token });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token', { sameSite: 'lax' });
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

  // Modules CRUD
  app.get("/api/modules", (req, res) => {
    res.json(modulesData);
  });
  
  app.post("/api/modules", upload.array('gameFiles'), async (req, res) => {
    let { title, desc, level, duration, material, gamesMeta } = req.body;
    try { material = JSON.parse(material || '[]'); } catch(e) {}
    try { gamesMeta = JSON.parse(gamesMeta || '[]'); } catch(e) {}

    // Process uploaded zip files if any
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (gamesMeta[i]) {
          const gameDir = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}`);
          await extractZip(file.path, { dir: gameDir });
          gamesMeta[i].path = `/games/game_${gamesMeta[i].id}/index.html`; // Assuming the zip contains an index.html at root
        }
      }
    }

    const newModule = { 
      id: Date.now(), 
      title, desc, level, duration, material, 
      games: gamesMeta, gameCount: gamesMeta.length, 
      status: 'locked' 
    };
    modulesData.push(newModule);
    saveDb();
    res.json({ success: true, module: newModule });
  });

  app.put("/api/modules/:id", upload.array('gameFiles'), async (req, res) => {
    const id = parseInt(req.params.id);
    const index = modulesData.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });

    let { title, desc, level, duration, material, gamesMeta } = req.body;
    try { material = JSON.parse(material || '[]'); } catch(e) {}
    try { gamesMeta = JSON.parse(gamesMeta || '[]'); } catch(e) {}

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      // Very basic match strategy: just unzip them to their module specific folder
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (gamesMeta[i]) {
          const gameDir = path.join(PUBLIC_GAMES_DIR, `game_${gamesMeta[i].id}`);
          await extractZip(file.path, { dir: gameDir });
          gamesMeta[i].path = `/games/game_${gamesMeta[i].id}/index.html`;
        }
      }
    }

    modulesData[index] = { 
      ...modulesData[index], 
      title, desc, level, duration, material, games: gamesMeta, gameCount: gamesMeta.length
    };
    saveDb();
    res.json({ success: true, module: modulesData[index] });
  });

  app.delete("/api/modules/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = modulesData.findIndex(m => m.id === id);
    if (index !== -1) {
      modulesData[index].isDeleted = true;
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/modules/:id/restore", (req, res) => {
    const id = parseInt(req.params.id);
    const index = modulesData.findIndex(m => m.id === id);
    if (index !== -1) {
      modulesData[index].isDeleted = false;
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
    saveDb();
    res.json({ success: true, teacher: newTeacher });
  });
  app.put("/api/teachers/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    teachersData[index] = { ...teachersData[index], ...req.body };
    saveDb();
    res.json({ success: true, teacher: teachersData[index] });
  });
  app.delete("/api/teachers/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index !== -1) {
      teachersData[index].isDeleted = true;
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/teachers/:id/restore", (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachersData.findIndex(t => t.id === id);
    if (index !== -1) {
      teachersData[index].isDeleted = false;
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
    saveDb();
    res.json({ success: true, student: newStudent });
  });
  app.put("/api/students/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    studentsData[index] = { ...studentsData[index], ...req.body };
    saveDb();
    res.json({ success: true, student: studentsData[index] });
  });
  app.delete("/api/students/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index !== -1) {
      studentsData[index].isDeleted = true;
      saveDb();
    }
    res.json({ success: true, id });
  });

  app.put("/api/students/:id/restore", (req, res) => {
    const id = parseInt(req.params.id);
    const index = studentsData.findIndex(s => s.id === id);
    if (index !== -1) {
      studentsData[index].isDeleted = false;
      saveDb();
    }
    res.json({ success: true, id });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
