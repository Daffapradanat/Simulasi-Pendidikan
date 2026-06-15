import fs from 'fs';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('database.sqlite');
db.get('SELECT data FROM app_state WHERE id = 1', (err, row) => {
  if (row) {
    const data = JSON.parse(row.data);
    const mod = data.modules[data.modules.length - 1];
    if (mod) console.log(JSON.stringify(mod.games, null, 2));
  }
});
