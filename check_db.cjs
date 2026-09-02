const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables:', tables);
  for (const t of tables) {
    const count = await db.get(`SELECT COUNT(*) as c FROM ${t.name}`);
    console.log(`${t.name}: ${count.c} rows`);
  }
}
run();
