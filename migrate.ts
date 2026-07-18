import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function migrate() {
  const db = await open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  });

  const stus = await db.all("SELECT data FROM students");
  const students = stus.map((r: any) => JSON.parse(r.data));

  const teas = await db.all("SELECT data FROM teachers");
  const teachers = teas.map((r: any) => JSON.parse(r.data));

  const cats = await db.all("SELECT data FROM categories");
  const categories = cats.map((r: any) => JSON.parse(r.data));

  const schoolsMap = new Map();
  let schoolIdCounter = 1;

  for (let s of students) {
    if (s.asalSekolah && !schoolsMap.has(s.asalSekolah)) {
      schoolsMap.set(s.asalSekolah, { id: schoolIdCounter++, name: s.asalSekolah, category_id: 2 });
    }
  }

  const schools = Array.from(schoolsMap.values());
  for (let sch of schools) {
    await db.exec(`INSERT INTO schools (id, name, data) VALUES (${sch.id}, '${sch.name}', '${JSON.stringify(sch)}')`);
  }

  for (let s of students) {
    if (s.asalSekolah) {
      s.school_id = schoolsMap.get(s.asalSekolah).id;
      await db.exec(`UPDATE students SET data = '${JSON.stringify(s)}' WHERE id = ${s.id}`);
    }
  }

  console.log("Migration complete.");
}

migrate().catch(console.error);
