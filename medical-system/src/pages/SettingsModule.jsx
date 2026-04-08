import React from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';

export const SettingsModule = () => {
  const { role, user } = useAuth();
  
  return (
    <SidebarLayout title="Account Settings">
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '24px' }}>Profile Information</h3>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={user?.name || ''} readOnly className={`w-full ${role === 'hospital' ? 'input-hospital' : ''}`} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={user?.email || ''} readOnly className={`w-full ${role === 'hospital' ? 'input-hospital' : ''}`} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input type="text" value={role || ''} readOnly className={`w-full ${role === 'hospital' ? 'input-hospital' : ''}`} style={{ textTransform: 'capitalize' }} />
        </div>
        
        <h3 style={{ marginTop: '32px', marginBottom: '24px' }}>Security</h3>
        <button className={`submit-btn ${role === 'hospital' ? 'btn-hospital' : 'btn-patient'}`}>Change Password</button>
      </div>
    </SidebarLayout>
  );
};

export default SettingsModule;
