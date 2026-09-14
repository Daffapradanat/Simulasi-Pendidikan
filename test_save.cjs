const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({ filename: './simpend.db', driver: sqlite3.Database });
  await db.exec("BEGIN TRANSACTION");
  try {
    await db.run("DELETE FROM modules");
    await db.run("INSERT INTO modules (id, data) VALUES (?, ?)", [1, "{}"]);
    await db.exec("COMMIT");
    console.log("Success");
  } catch (e) {
    await db.exec("ROLLBACK");
    console.error("Error", e);
  }
}
test();
