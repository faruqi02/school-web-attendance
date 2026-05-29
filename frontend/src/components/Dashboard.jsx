import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  ArrowRight,
  AlertTriangle,
  Award
} from 'lucide-react';

export default function Dashboard({ token, role, setActiveTab, t }) {
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total_students: 0
  });
  const [scheduleCount, setScheduleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch schedule tasks count
      const schedRes = await fetch('/api/schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (schedRes.ok) {
        const schedData = await schedRes.json();
        setScheduleCount(schedData.length);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const presentPercentage = stats.total_students > 0 
    ? Math.round((stats.present / stats.total_students) * 100)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {t('portalDashboard')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('realtimeStats')}
        </p>
      </div>

      {/* Stats Widgets Grid */}
      <div className="stats-grid animate-fade-in">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-present)' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-label">{t('totalPresent')}</div>
            <div className="stat-value" style={{ color: 'var(--color-present)' }}>{stats.present}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-absent)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-label">{t('totalAbsent')}</div>
            <div className="stat-value" style={{ color: 'var(--color-absent)' }}>{stats.absent}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-late)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-label">{t('lateArrivals')}</div>
            <div className="stat-value" style={{ color: 'var(--color-late)' }}>{stats.late}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className="stat-label">{t('calendarDeadlines')}</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{scheduleCount}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }} className="animate-fade-in">
        {/* Academic Performance / Roster Details */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: '#3b82f6' }} />
            {t('presentRate')}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', position: 'relative' }}>
            {/* SVG Custom Circular Progress */}
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="12" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                fill="transparent" 
                stroke="var(--color-present)" 
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - (presentPercentage || 0) / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'var(--transition)' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {presentPercentage}%
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('presentRate')}
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {t('todayStats')}
          </p>
        </div>

        {/* Quick Portal Controls */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#8b5cf6' }} />
              {t('quickOperations')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {t('quickOpsDesc')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {role === 'Administrator' && (
              <>
                <button onClick={() => setActiveTab('students')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>{t('registerManageStudents')}</span>
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => setActiveTab('classes')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>{t('configureSchoolClasses')}</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
            
            {role === 'Teacher' && (
              <>
                <button onClick={() => setActiveTab('attendance')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>{t('takeClassroomAttendance')}</span>
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => setActiveTab('results')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>{t('submitExamGrades')}</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}

            <button onClick={() => setActiveTab('schedule')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
              <span>{t('viewAcademicSchedules')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
