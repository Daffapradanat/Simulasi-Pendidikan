const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const PUBLIC_GAMES_DIR = path.join(process.cwd(), 'public', 'games');

async function run() {
  if (!fs.existsSync(PUBLIC_GAMES_DIR)) return;
  const files = fs.readdirSync(PUBLIC_GAMES_DIR);
  for (const file of files) {
    if (file.endsWith('.zip')) {
      const gameDir = path.join(PUBLIC_GAMES_DIR, file.replace('.zip', ''));
      if (!fs.existsSync(gameDir)) {
        console.log('Extracting', file);
        await extract(path.join(PUBLIC_GAMES_DIR, file), { dir: gameDir });
      }
    }
  }
}
run();
