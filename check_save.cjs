const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  await db.exec("BEGIN TRANSACTION");
  try {
     const data = JSON.parse(fs.readFileSync('simpend.db') || '{}');
     // just seeing what it throws
  } catch (e) {}
}
