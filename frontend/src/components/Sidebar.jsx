import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  ClipboardList, 
  UserSquare2, 
  CalendarDays, 
  Mail, 
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import schoolLogo from '../images/school-logo.png';

export default function Sidebar({ role, activeTab, setActiveTab, handleLogout, t }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define items based on role
  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: ['Administrator', 'Teacher'] },
    
    // Administrator Tabs
    { id: 'students', label: t('manageStudents'), icon: Users, roles: ['Administrator', 'Teacher'] },
    { id: 'classes', label: t('manageClasses'), icon: BookOpen, roles: ['Administrator'] },
    
    // Teacher Tabs
    { id: 'attendance', label: t('markAttendance'), icon: CalendarCheck, roles: ['Teacher'] },
    { id: 'results', label: t('academicResults'), icon: ClipboardList, roles: ['Teacher'] },
    
    // Parent Portal Tab
    { id: 'parent-portal', label: t('parentPortal'), icon: UserSquare2, roles: ['Parent'] },
    
    // Universal Tabs
    { id: 'schedule', label: t('academicCalendar'), icon: CalendarDays, roles: ['Administrator', 'Teacher', 'Parent'] },
    { id: 'notifications', label: t('simulatedEmails'), icon: Mail, roles: ['Administrator', 'Teacher', 'Parent'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside style={{
      width: isCollapsed ? '80px' : '260px',
      background: 'rgba(11, 15, 25, 0.95)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '24px 16px',
      transition: 'width 0.3s ease',
      overflow: 'hidden'
    }}>
      {/* Brand logo branding */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '12px',
        marginBottom: '40px',
        padding: '0 8px',
        minHeight: '32px'
      }}>
        <img 
          src={schoolLogo} 
          alt="School Logo" 
          style={{ width: '32px', height: '32px', objectFit: 'contain', minWidth: '32px' }} 
        />
        {!isCollapsed && (
          <h1 style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            Sekolah Agama Ayer Hitam
          </h1>
        )}
      </div>

      {/* Navigation list */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-sm)',
                border: 'none',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              className={isActive ? '' : 'sidebar-btn-hover'}
            >
              <Icon size={18} style={{ color: isActive ? '#3b82f6' : 'inherit', minWidth: '18px' }} />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout bottom placement */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? (t('expand') || 'Expand') : (t('collapse') || 'Collapse')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          className="sidebar-btn-hover"
        >
          {isCollapsed ? <ChevronRight size={18} style={{ minWidth: '18px' }} /> : <ChevronLeft size={18} style={{ minWidth: '18px' }} />}
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{t('collapse') || 'Collapse'}</span>}
        </button>

        <button
          onClick={handleLogout}
          title={isCollapsed ? t('signOut') : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--color-absent)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          className="logout-btn-hover"
        >
          <LogOut size={18} style={{ minWidth: '18px' }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{t('signOut')}</span>}
        </button>
      </div>

      {/* Sidebar inline helper styling */}
      <style>{`
        .sidebar-btn-hover:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          color: white !important;
        }
        .logout-btn-hover:hover {
          background: #ef4444 !important;
          color: white !important;
        }
      `}</style>
    </aside>
  );
}

