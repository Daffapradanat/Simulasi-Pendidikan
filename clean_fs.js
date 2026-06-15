import fs from 'fs';
import path from 'path';

const PUBLIC_GAMES_DIR = path.join(process.cwd(), "public", "games");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

try {
  const gFiles = fs.readdirSync(PUBLIC_GAMES_DIR);
  for (const file of gFiles) {
    console.log("Removing game dir", file);
    fs.rmSync(path.join(PUBLIC_GAMES_DIR, file), { recursive: true, force: true });
  }
} catch(e) { console.error(e) }

try {
  const uFiles = fs.readdirSync(UPLOADS_DIR);
  for (const file of uFiles) {
    console.log("Removing upload file", file);
    fs.unlinkSync(path.join(UPLOADS_DIR, file));
  }
} catch(e) { console.error(e) }
