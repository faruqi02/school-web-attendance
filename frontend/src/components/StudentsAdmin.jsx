import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import FloatingAlert from './FloatingAlert';

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
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/students', {
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

  const fetchParents = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/auth/users', {
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
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/students', {
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/students/${id}`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/students/${id}`, {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClassId ? String(student.class_id) === String(filterClassId) : true;
    return matchesSearch && matchesClass;
  });

  const handleCreateAndClose = async (e) => {
    await handleCreate(e);
    if (!error) {
      setShowForm(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {t('studentAdmin')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('studentAdminDesc')}
        </p>
      </div>

      <FloatingAlert message={error} type="error" onClose={() => setError('')} />
      <FloatingAlert message={success} type="success" onClose={() => setSuccess('')} />

      {/* Modal for Create Student */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Plus size={18} style={{ color: '#3b82f6' }} />
                {t('registerStudent')}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAndClose}>
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

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                  {t('cancel') || 'Batal'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {t('registerStudent')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Student Directory Full Width */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>{t('rosterDirectory')} ({filteredStudents.length})</h3>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder={t('search') || 'Search students...'} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px', minWidth: '200px' }}
              />
              <select 
                className="form-select" 
                value={filterClassId} 
                onChange={(e) => setFilterClassId(e.target.value)}
                style={{ padding: '8px 12px', minWidth: '150px' }}
              >
                <option value="">{t('allClasses') || 'All Classes'}</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                ))}
              </select>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', height: '100%' }}
              >
                <Plus size={16} />
                Daftar Pelajar Baru
              </button>
            </div>
          </div>
          
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
                {filteredStudents.map(student => (
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
                {filteredStudents.length === 0 && (
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
