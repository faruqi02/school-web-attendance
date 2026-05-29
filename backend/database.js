const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'attendance_system.db');
const dbExists = fs.existsSync(dbPath);
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema, async (err) => {
      if (err) {
        console.error("Error applying schema:", err);
        return reject(err);
      }
      console.log("Database schema successfully set up.");
      
      try {
        await seedInitialData();
        resolve();
      } catch (seedErr) {
        console.error("Error seeding initial data:", seedErr);
        reject(seedErr);
      }
    });
  });
}

async function seedInitialData() {
  const hashPassword = (password) => bcrypt.hashSync(password, 10);

  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // Check if admin user already exists
      db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
        if (err) return reject(err);
        if (row.count > 0) {
          console.log("Database already initialized and seeded.");
          return resolve();
        }

        console.log("Seeding fresh initial database accounts and records...");

        try {
          // 1. Seed Users
          const adminPass = hashPassword('admin123');
          const teacherPass = hashPassword('teacher123');
          const parentPass = hashPassword('parent123');

          db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ['admin', adminPass, 'Administrator']);
          db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ['teacher', teacherPass, 'Teacher']);
          db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ['parent', parentPass, 'Parent']);

          // Retrieve parent user's ID
          db.get("SELECT id FROM users WHERE username = 'parent'", (err, parentRow) => {
            if (err || !parentRow) return reject(err || new Error("Failed to seed parent"));
            const parentId = parentRow.id;

            // 2. Seed Classes
            db.run("INSERT INTO classes (class_name) VALUES (?)", ['Grade 10 - Islamic Studies']);
            db.run("INSERT INTO classes (class_name) VALUES (?)", ['Grade 11 - Quranic Studies']);

            db.get("SELECT id FROM classes WHERE class_name = 'Grade 10 - Islamic Studies'", (err, classRow) => {
              if (err || !classRow) return reject(err || new Error("Failed to seed class"));
              const classId = classRow.id;

              // 3. Seed Students
              db.run(
                "INSERT INTO students (name, demographic_details, class_id, parent_id) VALUES (?, ?, ?, ?)",
                ['Ahmad Ibrahim', 'Age: 16, Gender: Male, Contact: +12345678', classId, parentId]
              );
              db.run(
                "INSERT INTO students (name, demographic_details, class_id, parent_id) VALUES (?, ?, ?, ?)",
                ['Fatima Yusuf', 'Age: 15, Gender: Female, Contact: +87654321', classId, null]
              );

              // 4. Seed Academic Schedule Tasks
              db.run("INSERT INTO academic_schedules (task_name, due_date) VALUES (?, ?)", ['Term 1 Exam - Fiqh', '2026-06-15']);
              db.run("INSERT INTO academic_schedules (task_name, due_date) VALUES (?, ?)", ['Midterm Assignment - Sirah', '2026-06-28']);

              console.log("Database successfully seeded with base records.");
              resolve();
            });
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}

module.exports = {
  db,
  initializeDatabase
};
