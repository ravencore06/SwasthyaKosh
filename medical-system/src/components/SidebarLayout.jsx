import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, FileText, Settings, LogOut, LayoutDashboard, UserSquare2, ShieldAlert } from 'lucide-react';
import CircularText from './CircularText';
import './Sidebar.css';

export const SidebarLayout = ({ children, title }) => {
  const { role, user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/patient-dashboard', icon: LayoutDashboard, label: 'sidebar.dashboard' },
    { to: '/patient-appointments', icon: Calendar, label: 'sidebar.appointments' },
    { to: '/patient-prescriptions', icon: FileText, label: 'sidebar.prescriptions' },
    { to: '/patient-settings', icon: Settings, label: 'sidebar.settings' }
  ];

  const hospitalLinks = [
    { to: '/hospital-dashboard', icon: LayoutDashboard, label: 'sidebar.overview' },
    { to: '/hospital-appointments', icon: Calendar, label: 'sidebar.appointments' },
    { to: '/hospital-prescriptions', icon: ShieldAlert, label: 'sidebar.manage_rx' },
    { to: '/hospital-settings', icon: Settings, label: 'sidebar.settings' }
  ];

  const links = role === 'patient' ? patientLinks : hospitalLinks;
  const themeClass = role === 'patient' ? 'theme-patient' : 'theme-hospital';

  return (
    <div className={`layout-container ${themeClass}`}>
      <aside className="sidebar glass-panel">
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '32px', paddingTop: '32px' }}>
          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', color: '#000000', opacity: 0.85 }}>
              <CircularText size={170} radius={90} text="SWASTHYAKOSH • MEDICAL PORTAL • " />
            </div>
            <img src="/src/assets/brush_logo.png" alt="SwasthyaKosh Brush Logo" style={{ width: '90px', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'grayscale(1) brightness(1.1) contrast(1.5)', zIndex: 2, position: 'relative' }} />
          </div>
        </div>
        
        <div className="user-profile">
          <img src={user?.avatar} alt="Profile" className="avatar" />
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="badge badge-primary">{t(`role.${role}`)}</span>
          </div>
        </div>

        <nav className="sidebar-nav flex-col">
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `nav-item flex items-center ${isActive ? 'active' : ''}`}
            >
              <link.icon size={20} className="nav-icon" />
              <span>{t(link.label)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn flex items-center w-full">
            <LogOut size={20} />
            <span>{t('sidebar.sign_out')}</span>
          </button>
        </div>
      </aside>

      <main className="main-content flex-col">
        {title && (
          <header className="content-header animate-fade-in">
            <h1>{title}</h1>
          </header>
        )}
        <div className="inner-content animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
