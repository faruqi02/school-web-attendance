import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Send } from 'lucide-react';

export default function NotificationLog({ token, t }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // Auto sync refresh feed every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/notifications/log', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Sort descending (latest first)
        setLogs(data.reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            {t('notificationCenter')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('notificationCenterDesc')}
          </p>
        </div>

        <button onClick={fetchLogs} className="btn btn-secondary" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} />
          {t('refreshFeed')}
        </button>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={18} style={{ color: '#3b82f6' }} />
          {t('outgoingSpooler')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map((log) => (
            <div 
              key={log.id} 
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {t('to')}: <strong style={{ color: '#3b82f6' }}>{log.parentEmail}</strong>
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {log.timestamp}
                </span>
              </div>
              
              <div>
                <h4 style={{ fontSize: '14px', color: 'white', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={12} style={{ color: 'var(--color-present)' }} />
                  {t('subjectPrefix')}: {log.subject}
                </h4>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  padding: '12px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}>
                  {log.textContent}
                </p>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              {t('noOutgoing')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
