const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({ filename: 'test_backup.sqlite', driver: sqlite3.Database });
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log(tables);
  if (tables.find(t => t.name === 'app_state')) {
     const count = await db.get("SELECT count(*) as c FROM app_state");
     console.log("app_state rows:", count.c);
  } else {
     console.log("No app_state table");
  }
}
test();
