import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import FloatingAlert from './FloatingAlert';

export default function StudentsAdmin({ token, t }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState('');
  
  // Form State
  const [icNumber, setIcNumber] = useState('');
  const [name, setName] = useState('');
  const [demographics, setDemographics] = useState('');
  const [classId, setClassId] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchYearsAndClasses();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchStudents(selectedYear);
    }
  }, [selectedYear]);

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
      
      if (years.length > 0) {
        setSelectedYear(years[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (yearId) => {
    try {
      const res = await fetch(`/api/students.php?academic_year_id=${yearId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedYear) {
      setError('Please select an Academic Year first.');
      return;
    }

    try {
      const res = await fetch('/api/students.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ic_number: icNumber,
          name,
          demographic_details: demographics,
          class_id: classId ? parseInt(classId) : null,
          academic_year_id: parseInt(selectedYear)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register student');
      }

      setSuccess('Student successfully registered/updated for the selected academic year.');
      setIcNumber('');
      setName('');
      setDemographics('');
      setClassId('');
      fetchStudents(selectedYear);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Manage Students</h1>
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
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Enroll Student</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">IC / MyKid Number</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 090101140000"
              value={icNumber}
              onChange={(e) => setIcNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('nameLabel')}</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contact / Demographic</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Address or Phone"
              value={demographics}
              onChange={(e) => setDemographics(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('classAssign')}</label>
            <select 
              className="form-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
            >
              <option value="">-- Select Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label className="form-label" style={{ visibility: 'hidden' }}>&nbsp;</label>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Plus size={18} />
              Enroll
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Enrolled Students</h3>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>IC / MyKid</th>
                <th>{t('nameLabel')}</th>
                <th>{t('classAssign')}</th>
                <th>Contact Details</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '600' }}>{student.ic_number}</td>
                  <td>{student.name}</td>
                  <td><span className="badge badge-present">{student.class_name}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{student.demographic_details || 'N/A'}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                    No students found for this academic year.
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
