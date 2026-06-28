import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Download, ShieldCheck } from 'lucide-react';

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRx = async () => {
      const rx = await dbService.getPatientPrescriptions(user.id);
      setPrescriptions(rx);
      setLoading(false);
    };
    if (user) fetchRx();
  }, [user]);

  if (loading) return <SidebarLayout title={t('patient.prescriptions.title')}><div className="animate-pulse">{t('patient.prescriptions.loading')}</div></SidebarLayout>;

  return (
    <SidebarLayout title={t('patient.prescriptions.title')}>
      <div className="flex-col" style={{ gap: '16px' }}>
        {prescriptions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <FileText size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
            <h3 className="text-muted">{t('patient.prescriptions.empty')}</h3>
          </div>
        ) : (
          prescriptions.map(rx => (
            <div key={rx.id} className="glass-panel" style={{ padding: '24px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div className="flex items-center gap-4">
                  <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary-dark)' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{t('patient.prescriptions.prescription_no')}{rx.id.slice(-4).toUpperCase()}</h3>
                    <span className="text-muted text-sm">{rx.date} • {rx.hospitalName}</span>
                  </div>
                </div>
                <button className="badge badge-primary flex items-center gap-2" style={{ border: 'none', cursor: 'pointer', padding: '8px 16px' }}>
                  <Download size={16} /> {t('patient.prescriptions.download_pdf')}
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('patient.prescriptions.medications')}</h4>
                <ul style={{ listStylePosition: 'inside', margin: 0, padding: 0 }}>
                  {rx.medications.map((med, idx) => (
                    <li key={idx} style={{ padding: '4px 0' }}>{med}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                <strong>{t('patient.prescriptions.doctors_notes')}</strong> {rx.notes}
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-muted" style={{ marginTop: '16px', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} color="var(--success-color)" /> {t('patient.prescriptions.signature_verified')}
              </div>
            </div>
          ))
        )}
      </div>
    </SidebarLayout>
  );
};

export default PatientPrescriptions;
