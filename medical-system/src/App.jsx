import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';

// Patient Pages
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointments from './pages/PatientAppointments';
import PatientPrescriptions from './pages/PatientPrescriptions';

// Hospital Pages
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalAppointments from './pages/HospitalAppointments';
import HospitalPrescriptions from './pages/HospitalPrescriptions';

// Shared
import SettingsModule from './pages/SettingsModule';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/patient-appointments" element={<PatientAppointments />} />
            <Route path="/patient-prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient-settings" element={<SettingsModule />} />
          </Route>

          {/* Hospital Routes */}
          <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
            <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
            <Route path="/hospital-appointments" element={<HospitalAppointments />} />
            <Route path="/hospital-prescriptions" element={<HospitalPrescriptions />} />
            <Route path="/hospital-settings" element={<SettingsModule />} />
          </Route>

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
