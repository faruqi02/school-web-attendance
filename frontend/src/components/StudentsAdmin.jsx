import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';

export default function StudentsAdmin({ token, t }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [demographics, setDemographics] = useState('');
  const [classId, setClassId] = useState('');
  const [parentId, setParentId] = useState('');
  
  // Editing State
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDemographics, setEditDemographics] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editParentId, setEditParentId] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchParents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students', {
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

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes', {
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

  const fetchParents = async () => {
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter users who are parents
        setParents(data.filter(u => u.role === 'Parent'));
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
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          demographic_details: demographics,
          class_id: classId ? parseInt(classId) : null,
          parent_id: parentId ? parseInt(parentId) : null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register student');
      }

      setSuccess(t('successAttendance')); // general success template or direct msg
      setName('');
      setDemographics('');
      setClassId('');
      setParentId('');
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      setSuccess('Student record successfully removed.');
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (student) => {
    setEditId(student.id);
    setEditName(student.name);
    setEditDemographics(student.demographic_details || '');
    setEditClassId(student.class_id || '');
    setEditParentId(student.parent_id || '');
  };

  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          demographic_details: editDemographics,
          class_id: editClassId ? parseInt(editClassId) : null,
          parent_id: editParentId ? parseInt(editParentId) : null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update student');
      }

      setSuccess('Student profile successfully updated.');
      setEditId(null);
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {t('studentAdmin')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('studentAdminDesc')}
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
        {/* Left Side: Create Student */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} style={{ color: '#3b82f6' }} />
            {t('registerStudent')}
          </h3>
          
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ahmad Ibrahim" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('demographics')}</label>
              <textarea 
                className="form-textarea" 
                rows="2"
                placeholder={t('demographicsPlaceholder')} 
                value={demographics} 
                onChange={(e) => setDemographics(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('assignedClass')}</label>
              <select 
                className="form-select" 
                value={classId} 
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">{t('noClass')}</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('assignedParent')}</label>
              <select 
                className="form-select" 
                value={parentId} 
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">{t('noParent')}</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>{p.username}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
              {t('registerStudent')}
            </button>
          </form>
        </div>

        {/* Right Side: Student Directory */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px' }}>{t('rosterDirectory')} ({students.length})</h3>
          
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>{t('studentInfo')}</th>
                  <th>{t('classParent')}</th>
                  <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>
                      {editId === student.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ padding: '6px 12px' }}
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ padding: '6px 12px' }}
                            value={editDemographics} 
                            onChange={(e) => setEditDemographics(e.target.value)} 
                          />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: '600' }}>{student.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {student.demographic_details || 'No demographic context'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {editId === student.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <select 
                            className="form-select" 
                            style={{ padding: '6px 12px' }}
                            value={editClassId} 
                            onChange={(e) => setEditClassId(e.target.value)}
                          >
                            <option value="">No Class</option>
                            {classes.map(cls => (
                              <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                            ))}
                          </select>
                          <select 
                            className="form-select" 
                            style={{ padding: '6px 12px' }}
                            value={editParentId} 
                            onChange={(e) => setEditParentId(e.target.value)}
                          >
                            <option value="">No Parent</option>
                            {parents.map(p => (
                              <option key={p.id} value={p.id}>{p.username}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>
                            Class: <span style={{ color: 'white' }}>{student.class_name || 'None'}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Parent: {student.parent_username || 'Not assigned'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {editId === student.id ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleUpdate(student.id)} className="btn btn-primary" style={{ padding: '6px 10px' }}>
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditId(null)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditClick(student)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(student.id)} className="btn btn-danger" style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-absent)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                      {t('noRecords')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
