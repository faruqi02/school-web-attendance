import React, { useState, useEffect } from 'react';
import { User, Calendar, Award, Printer, Download, BookOpen, Clock } from 'lucide-react';

import schoolLogo from '../images/school-logo.png';

export default function ParentPortal({ token, t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildData();
  }, []);

  const fetchChildData = async () => {
    try {
      const res = await fetch('/api/parent/child', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to fetch parent dashboard details');
      }
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>;
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid var(--color-absent)', color: 'var(--color-absent)', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Portal Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data || !data.student) {
    return <p style={{ color: 'var(--text-secondary)' }}>No student records are currently mapped to your parent account.</p>;
  }

  const { student, attendance, results } = data;
  const attendanceRate = attendance.length > 0 
    ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
    : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            {t('parentMonitor')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('parentMonitorDesc')}
          </p>
        </div>

        <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
          <Printer size={16} />
          {t('printSlip')}
        </button>
      </div>

      {/* Grid: Child summary & Ranks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Child Profile summary */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <User size={32} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('profileMapped')}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>{student.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {student.demographic_details || 'Contact details not initialized'}
            </p>
          </div>
        </div>

        {/* Attendance Percentage progress */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6'
          }}>
            <Calendar size={32} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('attPerformance')}
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-present)', marginTop: '2px' }}>
              {attendanceRate}%
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Calculated across total class sessions ({attendance.length}) logged.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
        {/* Child Attendance Logs */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#3b82f6' }} />
            {t('sessionLogs')}
          </h3>

          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((log, idx) => (
                  <tr key={idx}>
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
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                      {t('noAttendanceSheets')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable/Saveable Grade Slip Sheet (printable-area) */}
        <div className="printable-area">
          <div className="grade-slip-container animate-fade-in" style={{ margin: 0 }}>
            <div className="grade-slip-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <img 
                src={schoolLogo} 
                alt="School Logo" 
                style={{ width: '64px', height: '64px', objectFit: 'contain' }} 
              />
              <h2 style={{ color: '#0f172a', fontWeight: '800', letterSpacing: '-0.02em', fontSize: '20px', textAlign: 'center' }}>
                {t('officialSlip')}
              </h2>
              <p style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                {t('officialSlipTitle')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', color: '#334155', marginBottom: '32px' }}>
              <div>
                <p>{t('nameLabel')}: <strong style={{ color: '#0f172a' }}>{student.name}</strong></p>
                <p style={{ marginTop: '6px' }}>{t('studentRef')}: <strong>#{student.id}</strong></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>{t('reportMonth')}: <strong>{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong></p>
                <p style={{ marginTop: '6px' }}>{t('portalAuth')}: <strong>{t('verified')}</strong></p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '32px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px 6px', color: '#475569' }}>{t('subjectHeader')}</th>
                  <th style={{ padding: '12px 6px', color: '#475569' }}>{t('examPeriod')}</th>
                  <th style={{ padding: '12px 6px', color: '#475569' }}>{t('marksHeader')}</th>
                  <th style={{ padding: '12px 6px', color: '#475569', textAlign: 'right' }}>{t('gradeHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 6px', fontWeight: '600', color: '#0f172a' }}>{res.subject_name}</td>
                    <td style={{ padding: '12px 6px', color: '#475569' }}>{res.exam_period}</td>
                    <td style={{ padding: '12px 6px', fontWeight: '600', color: '#0f172a' }}>{res.marks} / 100</td>
                    <td style={{ padding: '12px 6px', fontWeight: '700', color: res.grade === 'F' ? '#ef4444' : '#10b981', textAlign: 'right' }}>
                      {res.grade}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                      {t('noExamResults')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
              <span>{t('signature')}</span>
              <span>{t('generatedOn')}: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
