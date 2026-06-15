import sqlite3 from "sqlite3";
const db = new sqlite3.Database("database.sqlite");
db.get("SELECT data FROM app_state WHERE id = 1", (err, row) => {
  if (row) {
    const data = JSON.parse(row.data);
    data.modules = [];
    db.run("UPDATE app_state SET data = ? WHERE id = 1", [JSON.stringify(data)], () => {
      console.log("Modules cleared.");
    });
  }
});
