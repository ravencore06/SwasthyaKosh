import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Calendar, Activity } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const rx = await dbService.getPatientPrescriptions(user.id);
        const ap = await dbService.getPatientAppointments(user.id);
        setPrescriptions(rx);
        setAppointments(ap);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <SidebarLayout title={t('patient.dashboard.loading_title')}><div className="animate-pulse">{t('patient.dashboard.loading_text')}</div></SidebarLayout>;

  return (
    <SidebarLayout title={t('patient.dashboard.title')}>
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-card-title">{t('patient.dashboard.recent_prescriptions')}</span>
            <FileText size={24} color="var(--primary-color)" />
          </div>
          <span className="stat-card-value">{prescriptions.length}</span>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
             <span className="stat-card-title">{t('patient.dashboard.upcoming_appointments')}</span>
             <Calendar size={24} color="var(--warning-color)" />
          </div>
          <span className="stat-card-value">{appointments.filter(a => a.status !== 'completed').length}</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
             <span className="stat-card-title">{t('patient.dashboard.health_status')}</span>
             <Activity size={24} color="var(--success-color)" />
          </div>
          <span className="stat-card-value">{t('patient.dashboard.health_value')}</span>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2>{t('patient.dashboard.latest_appointment')}</h2>
        <div className="glass-panel" style={{ padding: '24px', marginTop: '16px' }}>
            {appointments.length > 0 ? (
                <div>
                  <p><strong>{t('patient.dashboard.with_label')}</strong> {appointments[0].hospitalId}</p>
                  <p><strong>{t('patient.dashboard.date_label')}</strong> {appointments[0].date} at {appointments[0].time}</p>
                  <p><strong>{t('patient.dashboard.status_label')}</strong> <span className={`badge badge-${appointments[0].status === 'approved' ? 'success' : 'warning'}`}>{appointments[0].status}</span></p>
                </div>
            ) : (
                <p className="text-muted">{t('patient.dashboard.no_appointments')}</p>
            )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default PatientDashboard;
