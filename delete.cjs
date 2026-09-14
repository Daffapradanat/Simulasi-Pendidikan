const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  await db.run("DELETE FROM modules");
  await db.run("DELETE FROM teachers");
  await db.run("DELETE FROM questions");
}
test();
