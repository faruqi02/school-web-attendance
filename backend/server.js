const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'attendance_result_super_secret_token_key_123';

app.use(cors());
app.use(express.json());

// In-Memory Notification Log Store (for visual feedback on triggered simulated emails)
let triggeredNotifications = [];

// Helper to simulate/log triggered email notifications
function sendNotificationEmail(parentEmail, subject, textContent) {
  const timestamp = new Date().toLocaleString();
  const notificationRecord = {
    id: Date.now(),
    parentEmail,
    subject,
    textContent,
    timestamp
  };
  triggeredNotifications.push(notificationRecord);
  console.log(`[EMAIL DISPATCH SIMULATION] [${timestamp}]`);
  console.log(`TO: ${parentEmail}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY: ${textContent}`);
  console.log('--------------------------------------------');
}

// Helper: Calculate grade based on score criteria
function calculateGrade(marks) {
  if (marks >= 85) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 55) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

// JWT Authorization Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Role Validation Middleware
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Unauthorized role permissions.' });
    }
    next();
  };
}

// ==========================================
// 1. REGISTRATION AND LOGIN MODULE
// ==========================================

// Register Account
app.post('/api/auth/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Please supply username, password and role.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
    [username, hash, role],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists.' });
      }
      res.json({ message: 'User registered successfully!', userId: this.lastID });
    }
  );
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please supply username and password.' });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const matches = bcrypt.compareSync(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, role: user.role, username: user.username });
  });
});

// Admin User Management: List all accounts (Administrators, Parents & Teachers)
app.get('/api/auth/users', authenticateToken, requireRole(['Administrator']), (req, res) => {
  db.all("SELECT id, username, role FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Admin User Management: Update account (Password or Role)
app.put('/api/auth/users/:id', authenticateToken, requireRole(['Administrator']), (req, res) => {
  const { password, role } = req.body;
  if (!password && !role) return res.status(400).json({ error: 'Password or role is required to update' });

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    if (role) {
      db.run("UPDATE users SET password_hash = ?, role = ? WHERE id = ?", [hash, role, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully.' });
      });
    } else {
      db.run("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User password updated successfully.' });
      });
    }
  } else if (role) {
    db.run("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User role updated successfully.' });
    });
  }
});

// Admin User Management: Delete account
app.delete('/api/auth/users/:id', authenticateToken, requireRole(['Administrator']), (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully.' });
  });
});

// ==========================================
// 2. STUDENT INFORMATION MODULE
// ==========================================

// Create new student
app.post('/api/students', authenticateToken, requireRole(['Administrator']), (req, res) => {
  const { name, demographic_details, class_id, parent_id } = req.body;
  db.run(
    "INSERT INTO students (name, demographic_details, class_id, parent_id) VALUES (?, ?, ?, ?)",
    [name, demographic_details, class_id || null, parent_id || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student registered successfully', studentId: this.lastID });
    }
  );
});

// List all students (With Class and Parent Info mapped)
app.get('/api/students', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  const query = `
    SELECT students.*, classes.class_name, users.username as parent_username 
    FROM students 
    LEFT JOIN classes ON students.class_id = classes.id
    LEFT JOIN users ON students.parent_id = users.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update student profile
app.put('/api/students/:id', authenticateToken, requireRole(['Administrator']), (req, res) => {
  const { name, demographic_details, class_id, parent_id } = req.body;
  db.run(
    "UPDATE students SET name = ?, demographic_details = ?, class_id = ?, parent_id = ? WHERE id = ?",
    [name, demographic_details, class_id || null, parent_id || null, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student details updated successfully.' });
    }
  );
});

// Delete student
app.delete('/api/students/:id', authenticateToken, requireRole(['Administrator']), (req, res) => {
  db.run("DELETE FROM students WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student deleted successfully.' });
  });
});

// ==========================================
// 3. CLASSES MODULE
// ==========================================

// Create a class
app.post('/api/classes', authenticateToken, requireRole(['Administrator']), (req, res) => {
  const { class_name } = req.body;
  db.run("INSERT INTO classes (class_name) VALUES (?)", [class_name], function(err) {
    if (err) return res.status(400).json({ error: 'Class name already exists.' });
    res.json({ message: 'Class added successfully', classId: this.lastID });
  });
});

// List all classes
app.get('/api/classes', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  db.all("SELECT * FROM classes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get class students
app.get('/api/classes/:classId/students', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  db.all("SELECT id, name FROM students WHERE class_id = ?", [req.params.classId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==========================================
// 4. ATTENDANCE TRACKING & REPORTING MODULE
// ==========================================

// Mark/Update Attendance
app.post('/api/attendance', authenticateToken, requireRole(['Teacher']), (req, res) => {
  const { records, class_id, date } = req.body; // records: [{student_id, status: 'Present'/'Absent'/'Late'}]
  if (!records || !class_id || !date) return res.status(400).json({ error: 'Incomplete parameters.' });

  db.serialize(() => {
    const stmt = db.prepare(`
      INSERT INTO attendance (student_id, class_id, date, status) 
      VALUES (?, ?, ?, ?) 
      ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status, updated_at=CURRENT_TIMESTAMP
    `);

    records.forEach(rec => {
      stmt.run(rec.student_id, class_id, date, rec.status);

      // Trigger automatic simulated alert if marked "Absent"
      if (rec.status === 'Absent') {
        db.get(
          `SELECT students.name, users.username as parent_name 
           FROM students 
           LEFT JOIN users ON students.parent_id = users.id 
           WHERE students.id = ?`,
          [rec.student_id],
          (err, sRow) => {
            if (!err && sRow && sRow.parent_name) {
              sendNotificationEmail(
                `${sRow.parent_name.toLowerCase()}@school.edu`,
                `Urgent Notice: Absence Alert for ${sRow.name}`,
                `Dear Parent,\n\nPlease be informed that your child ${sRow.name} was marked as ABSENT on ${date}.\n\nIf you have any questions, please contact the main office.\n\nWarm regards,\nSchool Administration`
              );
            }
          }
        );
      }
    });

    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Attendance records successfully logged.' });
    });
  });
});

// Get Attendance for a Class and Date
app.get('/api/attendance/class/:classId/date/:date', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  db.all(
    "SELECT student_id, status FROM attendance WHERE class_id = ? AND date = ?",
    [req.params.classId, req.params.date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Generate Class Monthly Attendance Report
app.get('/api/attendance/report/class/:classId/month/:month', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  // Month format: 'YYYY-MM'
  const query = `
    SELECT attendance.date, attendance.status, students.name as student_name, students.id as student_id
    FROM attendance 
    JOIN students ON attendance.student_id = students.id
    WHERE attendance.class_id = ? AND attendance.date LIKE ?
    ORDER BY students.name, attendance.date
  `;
  db.all(query, [req.params.classId, `${req.params.month}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==========================================
// 5. RESULT MANAGEMENT MODULE
// ==========================================

// Enter Marks
app.post('/api/results', authenticateToken, requireRole(['Teacher']), (req, res) => {
  const { student_id, subject_name, marks, exam_period } = req.body;
  if (!student_id || !subject_name || marks === undefined || !exam_period) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  const grade = calculateGrade(marks);
  const average = marks; // In individual entry, average maps to individual marks or subject scope

  db.run(
    `INSERT INTO results (student_id, subject_name, marks, grade, average, exam_period)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(student_id, subject_name, exam_period) 
     DO UPDATE SET marks=excluded.marks, grade=excluded.grade, average=excluded.average`,
    [student_id, subject_name, marks, grade, average, exam_period],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Automatically email Parent when new examination results are entered
      db.get(
        `SELECT students.name, users.username as parent_name 
         FROM students 
         LEFT JOIN users ON students.parent_id = users.id 
         WHERE students.id = ?`,
        [student_id],
        (err, sRow) => {
          if (!err && sRow && sRow.parent_name) {
            sendNotificationEmail(
              `${sRow.parent_name.toLowerCase()}@school.edu`,
              `New Academic Results Published for ${sRow.name}`,
              `Dear Parent,\n\nNew academic results have been published for your child ${sRow.name}.\nSubject: ${subject_name}\nExam Period: ${exam_period}\nMarks Secured: ${marks} / 100\nGrade Earned: ${grade}\n\nPlease log in to the Parent Portal to download the digital examination result slip.\n\nWarm regards,\nSchool Administration`
            );
          }
        }
      );

      res.json({ message: 'Result marks successfully saved.', grade });
    }
  );
});

// Generate finalized School-Wide Academic Performance Report ranked by average performance
app.get('/api/results/performance-ranking', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  const query = `
    SELECT students.id, students.name, classes.class_name, 
           SUM(results.marks) as total_marks,
           AVG(results.marks) as average_marks
    FROM students
    JOIN results ON students.id = results.student_id
    LEFT JOIN classes ON students.class_id = classes.id
    GROUP BY students.id
    ORDER BY average_marks DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Subject distributions for visual UI charts
app.get('/api/results/grade-distribution', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  const query = `
    SELECT subject_name, grade, COUNT(*) as count 
    FROM results 
    GROUP BY subject_name, grade
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==========================================
// 6. PARENT MONITORING PORTAL (SCOPE-ISOLATED)
// ==========================================

app.get('/api/parent/child', authenticateToken, requireRole(['Parent']), (req, res) => {
  // Enforce parent-scoped child retrieval
  db.get("SELECT * FROM students WHERE parent_id = ?", [req.user.id], (err, studentRow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!studentRow) return res.status(404).json({ error: 'No student mapped to this Parent account yet.' });

    // Fetch real-time attendance for the child
    db.all("SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date DESC", [studentRow.id], (err, attendanceRows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Fetch child's exam results
      db.all("SELECT subject_name, marks, grade, exam_period FROM results WHERE student_id = ?", [studentRow.id], (err, resultsRows) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          student: studentRow,
          attendance: attendanceRows,
          results: resultsRows
        });
      });
    });
  });
});

// ==========================================
// 7. ACADEMIC SCHEDULE MODULE
// ==========================================

// Add task
app.post('/api/schedule', authenticateToken, requireRole(['Administrator']), (req, res) => {
  const { task_name, due_date } = req.body;
  db.run("INSERT INTO academic_schedules (task_name, due_date) VALUES (?, ?)", [task_name, due_date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Academic task scheduled successfully', taskId: this.lastID });
  });
});

// Update task
app.put('/api/schedule/:id', authenticateToken, requireRole(['Administrator']), (req, res) => {
  const { task_name, due_date } = req.body;
  db.run(
    "UPDATE academic_schedules SET task_name = ?, due_date = ? WHERE id = ?",
    [task_name, due_date, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Academic schedule updated.' });
    }
  );
});

// Delete task
app.delete('/api/schedule/:id', authenticateToken, requireRole(['Administrator']), (req, res) => {
  db.run("DELETE FROM academic_schedules WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Academic task removed.' });
  });
});

// List tasks (Visible to all authenticated users)
app.get('/api/schedule', authenticateToken, (req, res) => {
  db.all("SELECT * FROM academic_schedules ORDER BY due_date ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Helper route to pull simulated notification mail queue to the frontend UI
app.get('/api/notifications/log', authenticateToken, (req, res) => {
  res.json(triggeredNotifications);
});

// Today's attendance quick stats widget
app.get('/api/dashboard/stats', authenticateToken, requireRole(['Administrator', 'Teacher']), (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const query = `
    SELECT 
      SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN status='Absent' THEN 1 ELSE 0 END) as absent_count,
      SUM(CASE WHEN status='Late' THEN 1 ELSE 0 END) as late_count,
      COUNT(*) as total_logged
    FROM attendance
    WHERE date = ?
  `;
  db.get(query, [today], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get("SELECT COUNT(*) as total_students FROM students", [], (err, sRow) => {
      res.json({
        present: row.present_count || 0,
        absent: row.absent_count || 0,
        late: row.late_count || 0,
        total_students: sRow ? sRow.total_students : 0
      });
    });
  });
});

// Start Server and Initialize Database
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server successfully listening on port ${PORT}`);
  });
}).catch(err => {
  console.error("Database failed to initialize. Server not started.", err);
});
