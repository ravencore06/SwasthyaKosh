import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { LayoutDashboard, Calendar, FileText, Settings, LogOut, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [bookingModal, setBookingModal] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [bookingDate, setBookingDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Appointments
            const qAppts = query(collection(db, 'appointments'), where('patientId', '==', currentUser.uid));
            const snapAppts = await getDocs(qAppts);
            setAppointments(snapAppts.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Prescriptions
            const qPresc = query(collection(db, 'prescriptions'), where('patientId', '==', currentUser.uid));
            const snapPresc = await getDocs(qPresc);
            setPrescriptions(snapPresc.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Hospitals for booking
            const qHosp = query(collection(db, 'users'), where('role', '==', 'hospital'));
            const snapHosp = await getDocs(qHosp);
            setHospitals(snapHosp.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        if (currentUser) fetchData();
    }, [currentUser]);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'appointments'), {
                patientId: currentUser.uid,
                patientName: userData.name,
                hospitalId: selectedHospital,
                date: bookingDate,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setBookingModal(false);
            // Refresh logic here
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
                    <SidebarItem icon={<LayoutDashboard />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={<Calendar />} label="Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
                    <SidebarItem icon={<FileText />} label="Prescriptions" active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} />
                    <SidebarItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b p-4 flex justify-between items-center px-8">
                    <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Welcome, {userData?.name}</span>
                        <button className="p-2 rounded-full hover:bg-gray-100"><LogOut className="w-5 h-5 text-gray-500" /></button>
                    </div>
                </header>

                <main className="p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="overview">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <StatCard label="Total Prescriptions" value={prescriptions.length} icon={<FileText className="text-teal-600" />} />
                                    <StatCard label="Pending Appointments" value={appointments.filter(a => a.status === 'pending').length} icon={<Calendar className="text-orange-500" />} />
                                    <StatCard label="Health Score" value="A+" icon={<FileText className="text-blue-500" />} />
                                </div>

                                <div className="card">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Recent Prescriptions</h3>
                                        <button className="text-[#0f766e] text-sm font-medium hover:underline">View All</button>
                                    </div>
                                    <div className="divide-y">
                                        {prescriptions.length === 0 ? (
                                            <p className="py-4 text-gray-500 italic">No prescriptions found.</p>
                                        ) : (
                                            prescriptions.slice(0, 3).map(p => (
                                                <div key={p.id} className="py-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{p.diagnosis}</p>
                                                        <p className="text-xs text-gray-500">{p.hospitalName} • {new Date(p.date?.seconds * 1000).toLocaleDateString()}</p>
                                                    </div>
                                                    <button className="btn btn-outline py-1 px-3 text-sm">Download</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'appointments' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="appointments" className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">My Appointments</h3>
                                    <button onClick={() => setBookingModal(true)} className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Book New</button>
                                </div>
                                <div className="card">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-gray-500 text-sm">
                                                <th className="pb-3 font-medium">Hospital</th>
                                                <th className="pb-3 font-medium">Date</th>
                                                <th className="pb-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {appointments.map(a => (
                                                <tr key={a.id}>
                                                    <td className="py-4">{a.hospitalName || 'Health Center'}</td>
                                                    <td className="py-4">{a.date}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Booking Modal */}
            {bookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Request Appointment</h3>
                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={selectedHospital}
                                    onChange={(e) => setSelectedHospital(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a hospital...</option>
                                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-md"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setBookingModal(false)} className="flex-1 btn btn-outline">Cancel</button>
                                <button type="submit" className="flex-1 btn btn-primary">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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

export default PatientDashboard;
