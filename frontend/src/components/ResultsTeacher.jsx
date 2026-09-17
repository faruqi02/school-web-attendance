import React, { useState, useEffect } from 'react';
import { Award, Plus, Save } from 'lucide-react';
import FloatingAlert from './FloatingAlert';

export default function ResultsTeacher({ token, t }) {
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  // Results Form
  const [studentId, setStudentId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [marks, setMarks] = useState('');
  const [examPeriod, setExamPeriod] = useState('Term 1');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resultsList, setResultsList] = useState([]);

  useEffect(() => {
    fetchYearsAndClasses();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedClass) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedYear, selectedClass]);

  useEffect(() => {
    if (selectedYear) {
      fetchAllResults();
    }
  }, [selectedYear]);

  const fetchYearsAndClasses = async () => {
    try {
      const [yearRes, classRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/academic_years.php`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/classes.php`, { headers: { 'Authorization': `Bearer ${token}` } })
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

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/students.php?academic_year_id=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allStudents = await res.json();
      const classStudents = allStudents.filter(s => s.class_id == selectedClass);
      setStudents(classStudents);
      if (classStudents.length > 0) setStudentId(classStudents[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllResults = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/results.php?academic_year_id=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setResultsList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateGrade = (score) => {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/results.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: parseInt(studentId),
          academic_year_id: parseInt(selectedYear),
          subject_name: subjectName,
          marks: parseFloat(marks),
          grade: calculateGrade(parseFloat(marks)),
          exam_period: examPeriod
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save result');
      }

      setSuccess('Result saved successfully!');
      setMarks('');
      setSubjectName('');
      fetchAllResults();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{t('manageResults')}</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Academic Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-select"
            style={{ minWidth: '150px' }}
          >
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>{year.year_name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <FloatingAlert type="error" message={error} onClose={() => setError('')} />}
      {success && <FloatingAlert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="glass-card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{t('enterStudentMarks')}</h3>
        <form onSubmit={handleSaveResult} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">{t('selectClass')}</label>
            <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('selectStudent')}</label>
            <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">-- Select Student --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.ic_number})</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('subjectHeader')}</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Mathematics"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('examPeriod')}</label>
            <select className="form-select" value={examPeriod} onChange={(e) => setExamPeriod(e.target.value)}>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Finals">Finals</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('marksHeader')} (0-100)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="0.0"
              step="0.1"
              min="0"
              max="100"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label className="form-label" style={{ visibility: 'hidden' }}>&nbsp;</label>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Save size={18} />
              Save Result
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Saved Results ({academicYears.find(y => y.id == selectedYear)?.year_name})</h3>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>{t('nameLabel')}</th>
                <th>IC Number</th>
                <th>{t('subjectHeader')}</th>
                <th>{t('examPeriod')}</th>
                <th>{t('marksHeader')}</th>
                <th>{t('gradeHeader')}</th>
              </tr>
            </thead>
            <tbody>
              {resultsList.map((res, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '500' }}>{res.student_name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{res.ic_number}</td>
                  <td>{res.subject_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{res.exam_period}</td>
                  <td style={{ fontWeight: '600' }}>{res.marks}</td>
                  <td>
                    <span className={`badge ${res.grade === 'F' ? 'badge-absent' : 'badge-present'}`}>
                      {res.grade}
                    </span>
                  </td>
                </tr>
              ))}
              {resultsList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                    No results found for this academic year.
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
