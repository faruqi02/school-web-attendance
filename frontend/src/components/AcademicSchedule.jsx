import React, { useState, useEffect } from 'react';
import { CalendarDays, PlusCircle, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';

export default function AcademicSchedule({ token, role, t }) {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Edit State
  const [editId, setEditId] = useState(null);
  const [editTaskName, setEditTaskName] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
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
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ task_name: taskName, due_date: dueDate })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule academic task');
      }

      setSuccess(t('successSchedule'));
      setTaskName('');
      setDueDate('');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this academic scheduled event?")) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove academic task');
      }

      setSuccess('Academic scheduled event removed successfully.');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (task) => {
    setEditId(task.id);
    setEditTaskName(task.task_name);
    setEditDueDate(task.due_date);
  };

  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/schedule/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ task_name: editTaskName, due_date: editDueDate })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update scheduled event');
      }

      setSuccess('Academic scheduled event updated successfully.');
      setEditId(null);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {t('scheduleTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('scheduleTitleDesc')}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Left Side: Create tasks (Only Admin role) */}
        {role === 'Administrator' ? (
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} style={{ color: '#3b82f6' }} />
              {t('scheduleEvent')}
            </h3>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">{t('eventTitle')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Term 2 Midterm - Fiqh" 
                  value={taskName} 
                  onChange={(e) => setTaskName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('dueDate')}</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {t('scheduleButton')}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '18px' }}>{t('activeTerm')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              {t('activeTermDesc')}
            </p>
          </div>
        )}

        {/* Right Side: Active Deadlines & Events */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} style={{ color: '#3b82f6' }} />
            {t('scheduledDeadlines')} ({tasks.length})
          </h3>

          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Academic Event</th>
                  <th>Target Due Date</th>
                  {role === 'Administrator' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      {editId === task.id ? (
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: '6px 12px', width: '100%' }}
                          value={editTaskName} 
                          onChange={(e) => setEditTaskName(e.target.value)} 
                        />
                      ) : (
                        <div style={{ fontWeight: '600' }}>{task.task_name}</div>
                      )}
                    </td>
                    <td>
                      {editId === task.id ? (
                        <input 
                          type="date" 
                          className="form-input" 
                          style={{ padding: '6px 12px' }}
                          value={editDueDate} 
                          onChange={(e) => setEditDueDate(e.target.value)} 
                        />
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#f59e0b',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {task.due_date}
                        </span>
                      )}
                    </td>
                    {role === 'Administrator' && (
                      <td style={{ textAlign: 'right' }}>
                        {editId === task.id ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleUpdate(task.id)} className="btn btn-primary" style={{ padding: '6px 10px' }}>
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditId(null)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleEditClick(task)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(task.id)} className="btn btn-danger" style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-absent)' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={role === 'Administrator' ? '3' : '2'} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                      No tasks or academic deadlines scheduled.
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
