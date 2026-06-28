import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Check, X } from 'lucide-react';

const HospitalAppointments = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  
  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (user) {
      const aps = await dbService.getHospitalAppointments(user.id);
      setAppointments(aps);
    }
  };

  const handleStatusChange = async (id, status) => {
    await dbService.updateAppointmentStatus(id, status);
    fetchAppointments(); // Refresh
  };

  return (
    <SidebarLayout title={t('hospital.appointments.title')}>
      <div className="flex-col" style={{ gap: '16px' }}>
        {appointments.length === 0 ? (
          <div className="text-muted">{t('hospital.appointments.empty')}</div>
        ) : (
          appointments.map(ap => (
            <div key={ap.id} className="glass-panel" style={{ padding: '24px' }}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Calendar size={24} color="var(--hospital-color)" />
                    <div>
                      <h3 style={{ margin: 0 }}>{ap.patientName} ({ap.patientId})</h3>
                      <span className="text-muted">{ap.date} at {ap.time}</span>
                    </div>
                  </div>
                  
                  {ap.status === 'pending' ? (
                    <div className="flex gap-2">
                       <button onClick={() => handleStatusChange(ap.id, 'approved')} className="badge flex items-center gap-1" style={{ background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
                         <Check size={14} /> {t('hospital.appointments.approve')}
                       </button>
                       <button onClick={() => handleStatusChange(ap.id, 'rejected')} className="badge flex items-center gap-1" style={{ background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
                         <X size={14} /> {t('hospital.appointments.reject')}
                       </button>
                    </div>
                  ) : (
                    <div className={`badge badge-${ap.status === 'approved' ? 'success' : 'danger'}`}>
                      {ap.status}
                    </div>
                  )}
               </div>
               <p style={{ marginTop: '16px' }}><strong>{t('hospital.appointments.reason')}</strong> {ap.reason}</p>
            </div>
          ))
        )}
      </div>
    </SidebarLayout>
  );
};

export default HospitalAppointments;
