import React, { useState, useEffect } from 'react';
import { CalendarCheck, ListChecks, CalendarRange, CheckCircle, Search, Download } from 'lucide-react';

export default function AttendanceTeacher({ token, t }) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'Present'/'Absent'/'Late' }
  
  // Roster Monthly Report States
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudentsAndAttendance();
    } else {
      setStudents([]);
      setAttendanceRecords({});
    }
  }, [selectedClassId, date]);

  const fetchClasses = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
        if (data.length > 0) setSelectedClassId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClassStudentsAndAttendance = async () => {
    setError('');
    setSuccess('');
    try {
      // 1. Fetch Students
      const studentRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/classes/${selectedClassId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!studentRes.ok) throw new Error("Failed to load class students");
      const studentData = await studentRes.json();
      setStudents(studentData);

      // 2. Fetch existing logs for class/date
      const attRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/attendance/class/${selectedClassId}/date/${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (attRes.ok) {
        const attData = await attRes.json();
        // Convert to map
        const initialMap = {};
        // Pre-fill present default
        studentData.forEach(s => {
          initialMap[s.id] = 'Present';
        });
        // Override with saved database records
        attData.forEach(rec => {
          initialMap[rec.student_id] = rec.status;
        });
        setAttendanceRecords(initialMap);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    // Prepare records body
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      student_id: parseInt(studentId),
      status
    }));

    if (records.length === 0) {
      setError('No students mapped to commit records.');
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          records,
          class_id: parseInt(selectedClassId),
          date
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit attendance records');
      }

      setSuccess(t('successAttendance'));
      fetchClassStudentsAndAttendance();
    } catch (err) {
      setError(err.message);
    }
  };

  // Monthly report trigger
  const generateMonthlyReport = async () => {
    if (!selectedClassId) return;
    setGeneratingReport(true);
    setMonthlyLogs([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/attendance/report/class/${selectedClassId}/month/${reportMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMonthlyLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {t('attTracker')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('attTrackerDesc')}
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-absent)', color: 'var(--color-absent)' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-present)', color: 'var(--color-present)' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
        {/* Left Side: Logger interface */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="form-label">{t('selectClass')}</label>
              <select 
                className="form-select" 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="form-label">{t('date')}</label>
              <input 
                type="date" 
                className="form-input" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
          </div>

          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListChecks size={18} style={{ color: '#3b82f6' }} />
            {t('attendanceRoster')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {students.map(student => {
              const currentStatus = attendanceRecords[student.id] || 'Present';
              return (
                <div 
                  key={student.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>{student.name}</span>
                  
                  {/* Selector Segmented Controls */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['Present', 'Absent', 'Late'].map(status => {
                      const isActive = currentStatus === status;
                      let badgeColor = 'var(--text-secondary)';
                      if (isActive) {
                        badgeColor = status === 'Present' ? 'var(--color-present)' : status === 'Absent' ? 'var(--color-absent)' : 'var(--color-late)';
                      }
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: isActive ? badgeColor : 'var(--border-color)',
                            background: isActive 
                              ? (status === 'Present' ? 'var(--color-present-bg)' : status === 'Absent' ? 'var(--color-absent-bg)' : 'var(--color-late-bg)')
                              : 'transparent',
                            color: isActive ? badgeColor : 'var(--text-secondary)',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        >
                          {t(status.toLowerCase())}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {students.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>
                No student profiles registered under this class level.
              </p>
            )}
          </div>

          {students.length > 0 && (
            <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%' }}>
              <CheckCircle size={18} />
              {t('saveAttendance')}
            </button>
          )}
        </div>

        {/* Right Side: Roster Monthly Report View */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarRange size={18} style={{ color: '#3b82f6' }} />
            {t('monthlyReport')}
          </h3>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">{t('selectMonth')}</label>
              <input 
                type="month" 
                className="form-input" 
                value={reportMonth} 
                onChange={(e) => setReportMonth(e.target.value)} 
              />
            </div>
            <button 
              onClick={generateMonthlyReport} 
              className="btn btn-secondary" 
              style={{ display: 'flex', gap: '8px' }}
              disabled={generatingReport}
            >
              <Search size={16} />
              {t('query')}
            </button>
          </div>

          {monthlyLogs.length > 0 ? (
            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>{t('studentName')}</th>
                    <th>{t('dateLogged')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{log.student_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{log.date}</td>
                      <td>
                        <span className={`badge ${
                          log.status === 'Present' ? 'badge-present' : log.status === 'Absent' ? 'badge-absent' : 'badge-late'
                        }`}>
                          {t(log.status.toLowerCase())}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              {generatingReport ? 'Loading report logs...' : t('queryMonthlyData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
