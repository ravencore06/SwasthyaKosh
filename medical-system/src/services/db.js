// Mock database using LocalStorage
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getStorageItem = (key, defaultVal) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

const setStorageItem = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initialize default mock data
const initDB = () => {
  if (!localStorage.getItem('users')) {
    setStorageItem('users', [
      { id: 'p1', email: 'patient@demo.com', role: 'patient', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
      { id: 'h1', email: 'hospital@demo.com', role: 'hospital', name: 'City General Hospital', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Hospital' }
    ]);
  }
  
  if (!localStorage.getItem('prescriptions')) {
    setStorageItem('prescriptions', [
      { id: 'rx1', patientId: 'p1', hospitalId: 'h1', hospitalName: 'City General Hospital', date: '2023-10-15', medications: ['Amoxicillin 500mg', 'Ibuprofen 400mg'], notes: 'Take after meals for 5 days.' },
      { id: 'rx2', patientId: 'p1', hospitalId: 'h1', hospitalName: 'City General Hospital', date: '2023-11-20', medications: ['Lisinopril 10mg'], notes: 'Daily morning.' }
    ]);
  }

  if (!localStorage.getItem('appointments')) {
    setStorageItem('appointments', [
      { id: 'ap1', patientId: 'p1', patientName: 'John Doe', hospitalId: 'h1', date: '2023-12-01', time: '10:00 AM', status: 'approved', reason: 'Routine Checkup' },
      { id: 'ap2', patientId: 'p1', patientName: 'John Doe', hospitalId: 'h1', date: '2023-12-15', time: '02:30 PM', status: 'pending', reason: 'Fever and Cough' }
    ]);
  }
};

initDB();

export const dbService = {
  // Auth
  async login(email, role) {
    await delay(600); // Simulate network
    const users = getStorageItem('users', []);
    const user = users.find(u => u.email === email && u.role === role);
    if (!user) throw new Error('Invalid credentials or role mismatch. Use patient@demo.com or hospital@demo.com');
    return user;
  },

  // Patient Methods
  async getPatientPrescriptions(patientId) {
    await delay(400);
    const prescriptions = getStorageItem('prescriptions', []);
    return prescriptions.filter(rx => rx.patientId === patientId);
  },

  async getPatientAppointments(patientId) {
    await delay(400);
    const appointments = getStorageItem('appointments', []);
    return appointments.filter(ap => ap.patientId === patientId);
  },

  async bookAppointment(data) {
    await delay(500);
    const appointments = getStorageItem('appointments', []);
    const newAp = { ...data, id: 'ap_' + Date.now(), status: 'pending' };
    appointments.push(newAp);
    setStorageItem('appointments', appointments);
    return newAp;
  },

  // Hospital Methods
  async getHospitalAppointments(hospitalId) {
    await delay(400);
    const appointments = getStorageItem('appointments', []);
    return appointments.filter(ap => ap.hospitalId === hospitalId);
  },

  async updateAppointmentStatus(appointmentId, status) {
    await delay(300);
    const appointments = getStorageItem('appointments', []);
    const index = appointments.findIndex(a => a.id === appointmentId);
    if (index > -1) {
      appointments[index].status = status;
      setStorageItem('appointments', appointments);
    }
  },

  async createPrescription(data) {
    await delay(600);
    const prescriptions = getStorageItem('prescriptions', []);
    const newRx = { ...data, id: 'rx_' + Date.now(), date: new Date().toISOString().split('T')[0] };
    prescriptions.unshift(newRx);
    setStorageItem('prescriptions', prescriptions);
    return newRx;
  },

  // AI Mock Module
  async analyzePrescription(medications) {
    await delay(800);
    const mockWarnings = [
      "No critical interactions found.",
      "Monitor for potential gastrointestinal issues.",
      "Ensure patient is hydrated while taking these medications."
    ];
    return mockWarnings[Math.floor(Math.random() * mockWarnings.length)];
  }
};
