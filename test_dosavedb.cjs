const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  await db.exec("BEGIN TRANSACTION");
  try {
    const questionsData = [
       { id: Date.now()+2, module_id: 1, type: "non_existent_type", text: "Q3" }
    ];
    await db.run("DELETE FROM questions");
    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];
      const typeRow = await db.get("SELECT id FROM question_types WHERE code = ?", [q.type || 'multiple_choice']);
      const type_id = typeRow ? typeRow.id : null;
      const qId = q.id ? parseInt(q.id) : (i + 1);
      await db.run("INSERT INTO questions (id, module_id, type_id, data) VALUES (?, ?, ?, ?)", [qId, Number(q.module_id), type_id, JSON.stringify(q)]);
    }
    await db.exec("COMMIT");
    console.log("Success questions!");
  } catch (e) {
    await db.exec("ROLLBACK");
    console.error("Error questions", e);
  }
}
test();
