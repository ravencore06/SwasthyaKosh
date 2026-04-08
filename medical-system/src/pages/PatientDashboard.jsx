import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, Activity } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
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

  if (loading) return <SidebarLayout title="Loading.."><div className="animate-pulse">Fetching your data...</div></SidebarLayout>;

  return (
    <SidebarLayout title="Dashboard Overview">
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-card-title">Recent Prescriptions</span>
            <FileText size={24} color="var(--primary-color)" />
          </div>
          <span className="stat-card-value">{prescriptions.length}</span>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
             <span className="stat-card-title">Upcoming Appointments</span>
             <Calendar size={24} color="var(--warning-color)" />
          </div>
          <span className="stat-card-value">{appointments.filter(a => a.status !== 'completed').length}</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
             <span className="stat-card-title">Health Status</span>
             <Activity size={24} color="var(--success-color)" />
          </div>
          <span className="stat-card-value">Good</span>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2>Latest Appointment</h2>
        <div className="glass-panel" style={{ padding: '24px', marginTop: '16px' }}>
            {appointments.length > 0 ? (
                <div>
                  <p><strong>With:</strong> {appointments[0].hospitalId}</p>
                  <p><strong>Date:</strong> {appointments[0].date} at {appointments[0].time}</p>
                  <p><strong>Status:</strong> <span className={`badge badge-${appointments[0].status === 'approved' ? 'success' : 'warning'}`}>{appointments[0].status}</span></p>
                </div>
            ) : (
                <p className="text-muted">No recent appointments found.</p>
            )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default PatientDashboard;
