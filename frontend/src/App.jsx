import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentsAdmin from './components/StudentsAdmin';
import ClassesAdmin from './components/ClassesAdmin';
import AttendanceTeacher from './components/AttendanceTeacher';
import ResultsTeacher from './components/ResultsTeacher';
import ParentPortal from './components/ParentPortal';
import AcademicSchedule from './components/AcademicSchedule';
import NotificationLog from './components/NotificationLog';
import { LogIn, UserPlus, GraduationCap, Lock, User, Sun, Moon } from 'lucide-react';

import schoolLogo from './images/school-logo.png';
import { translations } from './utils/i18n';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Language Localization State (Defaults to Bahasa Melayu 'ms')
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ms');
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth Form State
  const [loginMode, setLoginMode] = useState('parent'); // 'parent', 'staff', 'register'
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authIcNumber, setAuthIcNumber] = useState('');
  const [authRole, setAuthRole] = useState('Teacher'); // Default registration role choice
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Save/clear local storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
    }
  }, [token, role, username]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang][key] || translations['ms'][key] || key;
  };

  const handleLogout = () => {
    setToken('');
    setRole('');
    setUsername('');
    setActiveTab('dashboard');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    let endpoint = '';
    let payload = {};

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

    if (loginMode === 'register') {
      endpoint = baseUrl + '/api/register.php';
      payload = { username: authUsername, password: authPassword, role: authRole };
    } else {
      endpoint = baseUrl + '/api/login.php';
      if (loginMode === 'parent') {
        payload = { ic_number: authIcNumber };
      } else {
        payload = { username: authUsername, password: authPassword };
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (loginMode === 'register') {
        setAuthSuccess(t('regSuccess'));
        setLoginMode('staff');
        setAuthPassword('');
      } else {
        setToken(data.token);
        setRole(data.role);
        setUsername(data.username);
        // Also save student_id for Parent
        if (data.student_id) {
          localStorage.setItem('student_id', data.student_id);
        }
        setAuthUsername('');
        setAuthPassword('');
        setAuthIcNumber('');
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Render subcomponents based on selected tab and user role permissions
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard token={token} role={role} setActiveTab={setActiveTab} t={t} />;
      case 'students':
        if (role === 'Administrator' || role === 'Teacher') return <StudentsAdmin token={token} t={t} />;
        return <p className="text-secondary">{t('unauthorized')}</p>;
      case 'classes':
        if (role === 'Administrator') return <ClassesAdmin token={token} t={t} />;
        return <p className="text-secondary">{t('unauthorized')}</p>;
      case 'attendance':
        if (role === 'Teacher') return <AttendanceTeacher token={token} t={t} />;
        return <p className="text-secondary">{t('unauthorized')}</p>;
      case 'results':
        if (role === 'Teacher') return <ResultsTeacher token={token} t={t} />;
        return <p className="text-secondary">{t('unauthorized')}</p>;
      case 'parent-portal':
        if (role === 'Parent') return <ParentPortal token={token} t={t} />;
        return <p className="text-secondary">{t('unauthorized')}</p>;
      case 'schedule':
        return <AcademicSchedule token={token} role={role} t={t} />;
      case 'notifications':
        return <NotificationLog token={token} t={t} />;
      default:
        return <Dashboard token={token} role={role} setActiveTab={setActiveTab} t={t} />;
    }
  };

  // Login/Register Screen
  if (!token) {
    return (
      <div className="auth-wrapper">
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-secondary)',
          padding: '4px',
          borderRadius: 'var(--border-radius-sm)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            style={{
              padding: '6px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }}></div>
          <button 
            onClick={() => setLang('ms')} 
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: lang === 'ms' ? 'var(--accent-color)' : 'transparent',
              color: lang === 'ms' ? 'white' : 'var(--text-primary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '11px',
              transition: 'var(--transition)'
            }}
          >
            BM
          </button>
          <button 
            onClick={() => setLang('en')} 
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: lang === 'en' ? 'var(--accent-color)' : 'transparent',
              color: lang === 'en' ? 'white' : 'var(--text-primary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '11px',
              transition: 'var(--transition)'
            }}
          >
            ENG
          </button>
        </div>

        <div className="glass-card auth-card animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '8px',
              marginBottom: '16px'
            }}>
              <img 
                src={schoolLogo} 
                alt="Sekolah Agama Ayer Hitam Logo" 
                style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
              />
            </div>
            <h1 className="gradient-text" style={{ fontSize: '24px', marginBottom: '8px', lineHeight: 1.2 }}>
              {t('portalTitle')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t('portalSubtitle')}</p>
          </div>

          <div className="tabs">
            <button 
              className={`tab-btn ${loginMode === 'parent' ? 'active' : ''}`}
              onClick={() => { setLoginMode('parent'); setAuthError(''); setAuthSuccess(''); }}
            >
              Parent Login
            </button>
            <button 
              className={`tab-btn ${loginMode === 'staff' ? 'active' : ''}`}
              onClick={() => { setLoginMode('staff'); setAuthError(''); setAuthSuccess(''); }}
            >
              Staff Login
            </button>
            <button 
              className={`tab-btn ${loginMode === 'register' ? 'active' : ''}`}
              onClick={() => { setLoginMode('register'); setAuthError(''); setAuthSuccess(''); }}
            >
              Staff Register
            </button>
          </div>

          {authError && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--color-absent)',
              fontSize: '13px',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {authError}
            </div>
          )}

          {authSuccess && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-present)',
              fontSize: '13px',
              marginBottom: '20px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              {authSuccess}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {loginMode === 'parent' ? (
              <div className="form-group">
                <label className="form-label">Student IC / MyKid Number</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ width: '100%', paddingLeft: '44px' }} 
                    placeholder="Enter Student IC"
                    value={authIcNumber}
                    onChange={(e) => setAuthIcNumber(e.target.value)}
                    required
                  />
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  (example: 991201020899, without dash (-))
                </small>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">{t('username')}</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '44px' }} 
                      placeholder={t('enterUsername')}
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('password')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" 
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '44px' }} 
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {loginMode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">{t('systemRole')}</label>
                    <select 
                      className="form-select"
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value)}
                    >
                      <option value="Teacher">Teacher</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '12px' }}>
              {loginMode === 'register' ? <UserPlus size={18} /> : <LogIn size={18} />}
              {loginMode === 'register' ? t('signUp') : (loginMode === 'parent' ? 'Login as Parent' : t('signIn'))}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="app-container">
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        gap: '6px',
        background: 'var(--bg-secondary)',
        padding: '4px',
        borderRadius: 'var(--border-radius-sm)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          style={{
            padding: '6px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)'
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }}></div>
        <button 
          onClick={() => setLang('ms')} 
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            background: lang === 'ms' ? 'var(--accent-color)' : 'transparent',
            color: lang === 'ms' ? 'white' : 'var(--text-primary)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '11px',
            transition: 'var(--transition)'
          }}
        >
          BM
        </button>
        <button 
          onClick={() => setLang('en')} 
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            background: lang === 'en' ? 'var(--accent-color)' : 'transparent',
            color: lang === 'en' ? 'white' : 'var(--text-primary)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '11px',
            transition: 'var(--transition)'
          }}
        >
          EN
        </button>
      </div>

      <Sidebar 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
        t={t}
      />
      <div className="main-content">
        <Header username={username} role={role} token={token} t={t} />
        <div className="page-body animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
