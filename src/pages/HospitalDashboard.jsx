import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { LayoutDashboard, Users, Calendar, FilePlus, Settings, LogOut, Check, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HospitalDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [prescriptionData, setPrescriptionData] = useState({ diagnosis: '', notes: '' });

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Appointments for this hospital
            const qAppts = query(collection(db, 'appointments'), where('hospitalId', '==', currentUser.uid));
            const snapAppts = await getDocs(qAppts);
            setAppointments(snapAppts.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        if (currentUser) fetchData();
    }, [currentUser]);

    const handleUpdateStatus = async (id, status) => {
        await updateDoc(doc(db, 'appointments', id), { status });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const handleSearchPatient = async () => {
        const q = query(collection(db, 'users'), where('email', '==', searchEmail), where('role', '==', 'patient'));
        const snap = await getDocs(q);
        if (!snap.empty) {
            setSelectedPatient({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
            alert('Patient not found');
        }
    };

    const handleAddPrescription = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;
        try {
            await addDoc(collection(db, 'prescriptions'), {
                patientId: selectedPatient.id,
                hospitalId: currentUser.uid,
                hospitalName: userData.name,
                diagnosis: prescriptionData.diagnosis,
                notes: prescriptionData.notes,
                date: serverTimestamp()
            });
            alert('Prescription added successfully');
            setPrescriptionData({ diagnosis: '', notes: '' });
            setSelectedPatient(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-[#0f766e] text-white p-6 hidden md:block">
                <h2 className="text-2xl font-bold mb-10">SwasthyaKosh</h2>
                <nav className="space-y-4">
                    <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={<Calendar />} label="Manage Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
                    <SidebarItem icon={<FilePlus />} label="Add Prescription" active={activeTab === 'prescription'} onClick={() => setActiveTab('prescription')} />
                    <SidebarItem icon={<Users />} label="Doctors List" active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} />
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b p-4 flex justify-between items-center px-8">
                    <h1 className="text-xl font-semibold capitalize">{activeTab.replace('-', ' ')}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">{userData?.name}</span>
                        <button className="p-2 rounded-full hover:bg-gray-100"><LogOut className="w-5 h-5 text-gray-500" /></button>
                    </div>
                </header>

                <main className="p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="overview">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <StatCard label="Total Requests" value={appointments.length} icon={<Calendar className="text-blue-600" />} />
                                    <StatCard label="Pending" value={appointments.filter(a => a.status === 'pending').length} icon={<Calendar className="text-orange-500" />} />
                                    <StatCard label="Completed" value={appointments.filter(a => a.status === 'approved').length} icon={<Check className="text-green-500" />} />
                                </div>

                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
                                    <div className="divide-y">
                                        {appointments.filter(a => a.status === 'pending').length === 0 ? (
                                            <p className="py-4 text-gray-500 italic">No pending requests.</p>
                                        ) : (
                                            appointments.filter(a => a.status === 'pending').slice(0, 5).map(a => (
                                                <div key={a.id} className="py-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{a.patientName}</p>
                                                        <p className="text-xs text-gray-500">Requested for: {a.date}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdateStatus(a.id, 'approved')} className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"><Check className="w-4 h-4" /></button>
                                                        <button onClick={() => handleUpdateStatus(a.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"><X className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'prescription' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="prescription" className="max-w-2xl mx-auto">
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-6">New Prescription</h3>

                                    {!selectedPatient ? (
                                        <div className="space-y-4">
                                            <label className="block text-sm font-medium text-gray-700">Find Patient by Email</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    className="flex-1 p-2 border rounded-md"
                                                    placeholder="patient@example.com"
                                                    value={searchEmail}
                                                    onChange={(e) => setSearchEmail(e.target.value)}
                                                />
                                                <button onClick={handleSearchPatient} className="btn btn-primary"><Search className="w-4 h-4" /> Search</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleAddPrescription} className="space-y-4">
                                            <div className="p-3 bg-teal-50 rounded-lg flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-teal-800">Selected Patient:</p>
                                                    <p className="text-teal-700">{selectedPatient.name} ({selectedPatient.email})</p>
                                                </div>
                                                <button type="button" onClick={() => setSelectedPatient(null)} className="text-sm text-teal-800 underline">Change</button>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border rounded-md"
                                                    placeholder="e.g. Viral Fever"
                                                    value={prescriptionData.diagnosis}
                                                    onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Notes</label>
                                                <textarea
                                                    className="w-full p-2 border rounded-md h-32"
                                                    placeholder="List medicines and instructions..."
                                                    value={prescriptionData.notes}
                                                    onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="w-full btn btn-primary">Save & Send Prescription</button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'doctors' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="doctors">
                                <div className="card">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold">Associated Doctors</h3>
                                        <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Doctor</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DoctorCard name="Dr. Sarah Johnson" specialty="Cardiology" />
                                        <DoctorCard name="Dr. Michael Chen" specialty="Pediatrics" />
                                        <DoctorCard name="Dr. Emily Davis" specialty="Neurology" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-white/10 text-white' : 'text-teal-100 hover:bg-white/5'}`}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span className="font-medium">{label}</span>
    </button>
);

const StatCard = ({ label, value, icon }) => (
    <div className="card flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const DoctorCard = ({ name, specialty }) => (
    <div className="p-4 border rounded-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="text-gray-500" />
        </div>
        <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-gray-500">{specialty}</p>
        </div>
    </div>
);

export default HospitalDashboard;
