import React, { useState, useEffect } from 'react';
import { ClipboardList, PlusCircle, Trophy, BarChart3, Star } from 'lucide-react';

export default function ResultsTeacher({ token, t }) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  
  // Results form state
  const [studentId, setStudentId] = useState('');
  const [subjectName, setSubjectName] = useState('Fiqh');
  const [marks, setMarks] = useState('');
  const [examPeriod, setExamPeriod] = useState('Finals');

  // Reports data states
  const [rankings, setRankings] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchRankings();
    fetchGradeDistribution();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents(selectedClassId);
    } else {
      setStudents([]);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes', {
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

  const fetchClassStudents = async (classId) => {
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        if (data.length > 0) setStudentId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/results/performance-ranking', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRankings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGradeDistribution = async () => {
    try {
      const res = await fetch('/api/results/grade-distribution', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGradeDistribution(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!studentId) {
      setError('Please select a student.');
      return;
    }

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: parseInt(studentId),
          subject_name: subjectName,
          marks: parseFloat(marks),
          exam_period: examPeriod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit marks');
      }

      setSuccess(`${t('successMarks')}${data.grade}.`);
      setMarks('');
      fetchRankings();
      fetchGradeDistribution();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {t('gradeManagement')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('gradeManagementDesc')}
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
        {/* Left Side: Enter Grades form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} style={{ color: '#3b82f6' }} />
            {t('enterMarks')}
          </h3>
          
          <form onSubmit={handleEntrySubmit}>
            <div className="form-group">
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

            <div className="form-group">
              <label className="form-label">{t('studentName')}</label>
              <select 
                className="form-select" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">{t('chooseStudent')}</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">{t('subject')}</label>
                <select 
                  className="form-select"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                >
                  <option value="Fiqh">Fiqh (Islamic Jurisprudence)</option>
                  <option value="Sirah">Sirah (Prophetic Biography)</option>
                  <option value="Tafsir">Tafsir (Quranic Exegesis)</option>
                  <option value="Hadith">Hadith Studies</option>
                  <option value="Arabic Language">Arabic Language</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('examPeriod')}</label>
                <select 
                  className="form-select"
                  value={examPeriod}
                  onChange={(e) => setExamPeriod(e.target.value)}
                >
                  <option value="Term 1 Midterm">Term 1 Midterm</option>
                  <option value="Term 1 Final">Term 1 Final</option>
                  <option value="Term 2 Midterm">Term 2 Midterm</option>
                  <option value="Term 2 Final">Term 2 Final</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('score')}</label>
              <input 
                type="number" 
                min="0"
                max="100"
                step="0.5"
                className="form-input" 
                placeholder="85.5" 
                value={marks} 
                onChange={(e) => setMarks(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
              {t('publishResults')}
            </button>
          </form>
        </div>

        {/* Right Side: Performance rankings */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} style={{ color: '#f59e0b' }} />
            {t('rankingsHeader')}
          </h3>

          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>{t('rank')}</th>
                  <th>{t('studentName')}</th>
                  <th>{t('classLevels')}</th>
                  <th>{t('average')}</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((rank, index) => (
                  <tr key={rank.id}>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: index === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: index === 0 ? '#f59e0b' : 'var(--text-secondary)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '12px'
                      }}>
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {rank.name}
                        {index === 0 && <Star size={12} fill="#f59e0b" stroke="none" />}
                      </div>
                    </td>
                    <td>{rank.class_name}</td>
                    <td style={{ fontWeight: '700', color: 'var(--color-present)' }}>
                      {parseFloat(rank.average_marks).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {rankings.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                      No student exam scores published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade distribution charts visualization */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} style={{ color: '#3b82f6' }} />
          {t('distributionMap')}
        </h3>

        {gradeDistribution.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {/* Render a custom CSS bar visualization for each subject */}
            {Array.from(new Set(gradeDistribution.map(d => d.subject_name))).map(subject => {
              const items = gradeDistribution.filter(d => d.subject_name === subject);
              const maxCount = Math.max(...items.map(i => i.count));
              return (
                <div key={subject} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'white' }}>{subject}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {items.map(item => (
                      <div key={item.grade} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '20px', fontWeight: '700', fontSize: '13px' }}>{item.grade}</span>
                        <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{
                            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                            height: '100%',
                            width: `${(item.count / maxCount) * 100}%`,
                            borderRadius: '6px',
                            transition: 'var(--transition)'
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '20px', textAlign: 'right' }}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px 0' }}>
            {t('enterResultsData')}
          </p>
        )}
      </div>
    </div>
  );
}
