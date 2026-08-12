import React, { useState, useEffect } from 'react';

export default function FloatingAlert({ message, type = 'error', onClose, duration = 5 }) {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (!message) return;
    setCountdown(duration);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === 'error';
  const borderColor = isError ? 'var(--color-absent)' : 'var(--color-present)';
  const textColor = isError ? 'var(--color-absent)' : 'var(--color-present)';

  return (
    <div 
      className="glass-card animate-fade-in" 
      style={{
        position: 'absolute',
        top: '0px',
        right: '0px',
        zIndex: 9999,
        borderLeft: `4px solid ${borderColor}`,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        minWidth: '320px',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <span>{message}</span>
      <span style={{
        fontSize: '12px',
        background: 'rgba(255,255,255,0.1)',
        padding: '2px 8px',
        borderRadius: '12px',
        fontWeight: 'bold',
        color: 'var(--text-secondary)'
      }}>
        {countdown}s
      </span>
    </div>
  );
}
