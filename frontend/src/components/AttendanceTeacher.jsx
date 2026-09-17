import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Save } from 'lucide-react';
import FloatingAlert from './FloatingAlert';

export default function AttendanceTeacher({ token, t }) {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchYearsAndClasses();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedClass && selectedDate) {
      fetchStudentsAndAttendance();
    } else {
      setStudents([]);
      setAttendanceRecords({});
    }
  }, [selectedYear, selectedClass, selectedDate]);

  const fetchYearsAndClasses = async () => {
    try {
      const [yearRes, classRes] = await Promise.all([
        fetch('/api/academic_years.php', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/classes.php', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const years = await yearRes.json();
      const cls = await classRes.json();
      
      setAcademicYears(years);
      setClasses(cls);
      
      if (years.length > 0) setSelectedYear(years[0].id);
      if (cls.length > 0) setSelectedClass(cls[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    try {
      // Fetch students for this class and year
      const stRes = await fetch(`/api/students.php?academic_year_id=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allStudents = await stRes.json();
      const classStudents = allStudents.filter(s => s.class_id == selectedClass);
      setStudents(classStudents);

      // Fetch attendance for this class, year, and date
      const attRes = await fetch(`/api/attendance.php?academic_year_id=${selectedYear}&class_id=${selectedClass}&date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const attData = await attRes.json();
      
      // Map attendance to state
      const records = {};
      attData.forEach(att => {
        records[att.student_id] = att.status;
      });
      setAttendanceRecords(records);
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [studentId]: status
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    const recordsToSave = students.map(student => ({
      student_id: student.id,
      class_id: selectedClass,
      academic_year_id: selectedYear,
      date: selectedDate,
      status: attendanceRecords[student.id] || 'Present' // Default to present if untouched
    }));

    if (recordsToSave.length === 0) {
      setError('No students to save attendance for.');
      return;
    }

    try {
      const res = await fetch('/api/attendance.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ records: recordsToSave })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save attendance');
      }

      setSuccess(t('successAttendance'));
      fetchStudentsAndAttendance();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{t('takeAttendance')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log daily presence for your students</p>
        </div>
      </div>

      {error && <FloatingAlert type="error" message={error} onClose={() => setError('')} />}
      {success && <FloatingAlert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="glass-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
          <label className="form-label">Academic Year</label>
          <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {academicYears.map(year => <option key={year.id} value={year.id}>{year.year_name}</option>)}
          </select>
        </div>
        
        <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
          <label className="form-label">{t('selectClass')}</label>
          <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
          <label className="form-label">{t('dateLabel')}</label>
          <input 
            type="date" 
            className="form-input" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <button onClick={handleSave} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
            <Save size={18} />
            {t('saveAttendance')}
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>IC Number</th>
                <th>{t('nameLabel')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const currentStatus = attendanceRecords[student.id] || 'Present';
                return (
                  <tr key={student.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{student.ic_number}</td>
                    <td style={{ fontWeight: '500' }}>{student.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={`btn ${currentStatus === 'Present' ? 'btn-primary' : ''}`}
                          style={{ 
                            padding: '6px 12px', fontSize: '13px', 
                            background: currentStatus === 'Present' ? '#10b981' : 'transparent',
                            color: currentStatus === 'Present' ? 'white' : 'var(--text-secondary)',
                            border: currentStatus === 'Present' ? 'none' : '1px solid var(--border-color)',
                            display: 'flex', gap: '6px'
                          }}
                        >
                          <CheckCircle size={14} /> {t('present')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'Absent')}
                          className={`btn ${currentStatus === 'Absent' ? 'btn-primary' : ''}`}
                          style={{ 
                            padding: '6px 12px', fontSize: '13px', 
                            background: currentStatus === 'Absent' ? '#ef4444' : 'transparent',
                            color: currentStatus === 'Absent' ? 'white' : 'var(--text-secondary)',
                            border: currentStatus === 'Absent' ? 'none' : '1px solid var(--border-color)',
                            display: 'flex', gap: '6px'
                          }}
                        >
                          <XCircle size={14} /> {t('absent')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'Late')}
                          className={`btn ${currentStatus === 'Late' ? 'btn-primary' : ''}`}
                          style={{ 
                            padding: '6px 12px', fontSize: '13px', 
                            background: currentStatus === 'Late' ? '#f59e0b' : 'transparent',
                            color: currentStatus === 'Late' ? 'white' : 'var(--text-secondary)',
                            border: currentStatus === 'Late' ? 'none' : '1px solid var(--border-color)',
                            display: 'flex', gap: '6px'
                          }}
                        >
                          <Clock size={14} /> {t('late')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    {t('noStudentsInClass')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
