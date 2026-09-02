const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  const rows = await db.all('SELECT data FROM modules');
  console.log('Total modules:', rows.length);
  rows.forEach(r => {
    const m = JSON.parse(r.data);
    console.log(`ID: ${m.id}, Title: ${m.title}, category_id: ${m.category_id} (${typeof m.category_id}), subject_id: ${m.subject_id} (${typeof m.subject_id})`);
  });
}
run();
