import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Users, FolderOpen } from 'lucide-react';
import FloatingAlert from './FloatingAlert';

export default function ClassesAdmin({ token, t }) {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents(selectedClassId);
    } else {
      setClassStudents([]);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/classes/${classId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClassStudents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ class_name: className })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create class');
      }

      setSuccess(t('successSchedule')); // fallback general success or custom string
      setClassName('');
      fetchClasses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {t('classManagement')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('classManagementDesc')}
        </p>
      </div>

      <FloatingAlert message={error} type="error" onClose={() => setError('')} />
      <FloatingAlert message={success} type="success" onClose={() => setSuccess('')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Left column: Add Class & Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Create class form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} style={{ color: '#3b82f6' }} />
              {t('createClassLevel')}
            </h3>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">{t('className')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={t('classNamePlaceholder')} 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {t('establishClass')}
              </button>
            </form>
          </div>

          {/* Established classes roster list selection */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: '#3b82f6' }} />
              {t('classLevels')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 18px',
                    background: selectedClassId === cls.id ? 'var(--accent-glow)' : 'var(--bg-hover)',
                    border: '1px solid',
                    borderColor: selectedClassId === cls.id ? '#3b82f6' : 'var(--border-color)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <span>{cls.class_name}</span>
                  <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>
              ))}

              {classes.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>
                  {t('noClasses')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Selected classroom roster details */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={18} style={{ color: '#3b82f6' }} />
            {t('classroomRoster')}
          </h3>

          {selectedClassId ? (
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-sm)',
                marginBottom: '16px',
                border: '1px solid var(--border-color)',
                fontSize: '13px'
              }}>
                {t('rosterCount')}: <strong style={{ color: 'var(--text-primary)' }}>{classStudents.length}</strong>.
              </div>

              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('studentName')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map(student => (
                      <tr key={student.id}>
                        <td style={{ color: 'var(--text-secondary)' }}>#{student.id}</td>
                        <td style={{ fontWeight: '600' }}>{student.name}</td>
                      </tr>
                    ))}
                    {classStudents.length === 0 && (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                          {t('noStudentsInClass')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              {t('selectClassLeft')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
