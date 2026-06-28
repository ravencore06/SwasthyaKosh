import React from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const SettingsModule = () => {
  const { role, user } = useAuth();
  const { t } = useLanguage();
  
  return (
    <SidebarLayout title={t('settings.title')}>
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '24px' }}>{t('settings.profile_info')}</h3>
        <div className="form-group">
          <label>{t('settings.name')}</label>
          <input type="text" value={user?.name || ''} readOnly className={`w-full ${role === 'hospital' ? 'input-hospital' : ''}`} />
        </div>
        <div className="form-group">
          <label>{t('settings.email')}</label>
          <input type="email" value={user?.email || ''} readOnly className={`w-full ${role === 'hospital' ? 'input-hospital' : ''}`} />
        </div>
        <div className="form-group">
          <label>{t('settings.role')}</label>
          <input type="text" value={t(`role.${role}`) || ''} readOnly className={`w-full ${role === 'hospital' ? 'input-hospital' : ''}`} style={{ textTransform: 'capitalize' }} />
        </div>
        
        <h3 style={{ marginTop: '32px', marginBottom: '24px' }}>{t('settings.security')}</h3>
        <button className={`submit-btn ${role === 'hospital' ? 'btn-hospital' : 'btn-patient'}`}>{t('settings.change_password')}</button>
      </div>
    </SidebarLayout>
  );
};

export default SettingsModule;
