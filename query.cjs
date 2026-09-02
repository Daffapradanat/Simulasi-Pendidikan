const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  const row = await db.get('SELECT data FROM modules LIMIT 1');
  console.log(JSON.parse(row.data).games);
}
run();
