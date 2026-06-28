import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar } from 'lucide-react';

const PatientAppointments = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  
  useEffect(() => {
    if (user) dbService.getPatientAppointments(user.id).then(setAppointments);
  }, [user]);

  return (
    <SidebarLayout title={t('patient.appointments.title')}>
      <div className="flex-col" style={{ gap: '16px' }}>
        {appointments.map(ap => (
          <div key={ap.id} className="glass-panel" style={{ padding: '24px' }}>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Calendar size={24} color="var(--primary-color)" />
                  <div>
                    <h3 style={{ margin: 0 }}>{ap.hospitalId}</h3>
                    <span className="text-muted">{ap.date} at {ap.time}</span>
                  </div>
                </div>
                <div className={`badge badge-${ap.status === 'approved' ? 'success' : 'warning'}`}>
                  {ap.status}
                </div>
             </div>
             <p style={{ marginTop: '16px' }}><strong>{t('patient.appointments.reason')}</strong> {ap.reason}</p>
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default PatientAppointments;
