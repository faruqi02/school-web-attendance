-- SQLite Database Schema Initialization

PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('Administrator', 'Teacher', 'Parent')) NOT NULL
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL UNIQUE
);

-- 3. Students Table (with mapped parent user and class)
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    demographic_details TEXT, -- JSON string or comma-separated details
    class_id INTEGER,
    parent_id INTEGER,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    status TEXT CHECK(status IN ('Present', 'Absent', 'Late')) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
);

-- 5. Results Table
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    marks REAL NOT NULL,
    grade TEXT NOT NULL,
    average REAL,
    exam_period TEXT NOT NULL, -- e.g. 'Term 1 Midterm', 'Finals'
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(student_id, subject_name, exam_period)
);

-- 6. Academic Schedules Table
CREATE TABLE IF NOT EXISTS academic_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    due_date TEXT NOT NULL -- Format YYYY-MM-DD
);
