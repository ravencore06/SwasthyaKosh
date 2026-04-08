import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, Activity } from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock doctors list
  const doctors = [
    { id: 'd1', name: 'Dr. Sarah Smith', specialization: 'Neurology' },
    { id: 'd2', name: 'Dr. James Anderson', specialization: 'Cardiology' },
    { id: 'd3', name: 'Dr. Emily Chen', specialization: 'General Practice' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const ap = await dbService.getHospitalAppointments(user.id);
        setAppointments(ap);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <SidebarLayout title="Loading.."><div className="animate-pulse">Fetching hospital data...</div></SidebarLayout>;

  const pendingRequests = appointments.filter(a => a.status === 'pending').length;

  return (
    <SidebarLayout title="Hospital Overview">
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-card-title">Pending Requests</span>
            <Calendar size={24} color="var(--warning-color)" />
          </div>
          <span className="stat-card-value">{pendingRequests}</span>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
             <span className="stat-card-title">Active Doctors</span>
             <Users size={24} color="var(--hospital-color)" />
          </div>
          <span className="stat-card-value">{doctors.length}</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center">
             <span className="stat-card-title">System Load</span>
             <Activity size={24} color="var(--success-color)" />
          </div>
          <span className="stat-card-value">Normal</span>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2>Available Doctors</h2>
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
          {doctors.map(doc => (
            <div key={doc.id} className="glass-panel" style={{ padding: '24px' }}>
              <div className="flex items-center gap-4">
                <div className="avatar flex items-center justify-center" style={{ background: 'var(--hospital-light)', color: 'var(--hospital-dark)' }}>
                  <Users size={20} />
                </div>
                <div>
                   <h4 style={{ margin: 0 }}>{doc.name}</h4>
                   <span className="text-muted" style={{ fontSize: '0.8rem' }}>{doc.specialization}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default HospitalDashboard;
