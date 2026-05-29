import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function Header({ username, role, token, t }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Search Bar or Welcome message */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
          {t('welcomeBack')}, <span className="gradient-text">{username}</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CalendarIcon size={12} />
            {formattedDate}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {time}
          </span>
        </div>
      </div>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '6px 12px',
          borderRadius: 'var(--border-radius-sm)',
          border: '1px solid var(--border-color)',
          fontSize: '12px',
          fontWeight: 600
        }}>
          <Shield size={14} style={{ color: '#3b82f6' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{t('role')}:</span>
          <span style={{ color: 'white' }}>{role}</span>
        </div>

        {/* Profile Avatar icon wrapper */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '14px',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
        }}>
          {username ? username.substring(0, 2).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
