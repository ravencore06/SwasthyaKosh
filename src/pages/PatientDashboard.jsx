import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    LayoutDashboard, Calendar, FileText, Settings, LogOut,
    Plus, Search, Sparkles, Bell, Sun, MoreVertical, Download, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePrescription } from '../utils/aiService';

const PatientDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [hospitals, setHospitals] = useState([]);

    // Modals & AI
    const [bookingModal, setBookingModal] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [analyzingId, setAnalyzingId] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            const qAppts = query(collection(db, 'appointments'), where('patientId', '==', currentUser.uid));
            const snapAppts = await getDocs(qAppts);
            setAppointments(snapAppts.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const qPresc = query(collection(db, 'prescriptions'), where('patientId', '==', currentUser.uid));
            const snapPresc = await getDocs(qPresc);
            setPrescriptions(snapPresc.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const qHosp = query(collection(db, 'users'), where('role', '==', 'hospital'));
            const snapHosp = await getDocs(qHosp);
            setHospitals(snapHosp.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchData();
    }, [currentUser]);

    const handleAiAnalysis = async (prescription) => {
        setAnalyzingId(prescription.id);
        const result = await analyzePrescription(prescription.notes + " " + prescription.diagnosis);
        setAiResult(result);
        setAnalyzingId(null);
        setShowAiModal(true);
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'appointments'), {
                patientId: currentUser.uid,
                patientName: userData.name,
                hospitalId: selectedHospital,
                hospitalName: hospitals.find(h => h.id === selectedHospital)?.name || 'Health Center',
                date: bookingDate,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setBookingModal(false);
            alert('Appointment requested successfully!');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col">
                <div className="p-6 flex items-center gap-2 mb-4">
                    <div className="bg-[#0f766e] p-1.5 rounded-lg">
                        <Plus className="text-white w-6 h-6 rotate-45" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">SwasthyaKosh</h2>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <SidebarNavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarNavItem icon={<FileText />} label="My Prescriptions" active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} />
                    <SidebarNavItem icon={<Calendar />} label="Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
                    <SidebarNavItem icon={<FileText />} label="Health Records" active={activeTab === 'records'} onClick={() => setActiveTab('records')} />
                </nav>

                <div className="p-4 border-t space-y-1">
                    <SidebarNavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-red-600 transition-colors">
                        <Sun className="w-5 h-5" />
                        <span className="font-medium text-sm">Dark Mode</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>

                    <div className="flex items-center gap-6">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Search records..." className="search-input" />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-[#0f766e]">
                            <Bell className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{userData?.name || 'Patient'}</p>
                                <p className="text-xs text-gray-500">Gold Member</p>
                            </div>
                            <div className="avatar bg-teal-50 text-[#0f766e] font-bold">{userData?.name?.charAt(0) || 'P'}</div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard2 label="Prescriptions" value={prescriptions.length} trend="Total" icon={<FileText className="text-teal-600" />} color="teal" />
                            <StatCard2 label="Pending Appointments" value={appointments.filter(a => a.status === 'pending').length} trend="Status" icon={<Calendar className="text-orange-600" />} color="orange" />
                            <StatCard2 label="Health Rating" value="A+" trend="Excellent" icon={<Sparkles className="text-blue-600" />} color="blue" />
                        </div>

                        {/* Dashboard Overview */}
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Recent Prescriptions */}
                                <div className="card p-0 overflow-hidden">
                                    <div className="p-6 border-b flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">Recent Prescriptions</h3>
                                        <button onClick={() => setActiveTab('prescriptions')} className="text-[#0f766e] text-sm font-bold hover:underline">View All</button>
                                    </div>
                                    <div className="divide-y text-sm">
                                        {prescriptions.length === 0 ? (
                                            <p className="p-10 text-center text-gray-500 italic">No prescriptions found.</p>
                                        ) : (
                                            prescriptions.slice(0, 4).map(p => (
                                                <div key={p.id} className="p-6 flex justify-between items-center table-row">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><FileText size={20} /></div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{p.diagnosis}</p>
                                                            <p className="text-xs text-gray-500">{p.hospitalName} • {new Date(p.date?.seconds * 1000).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAiAnalysis(p)}
                                                        className="btn btn-outline border-teal-100 text-[#0f766e] py-1 px-4 text-xs font-bold whitespace-nowrap"
                                                    >
                                                        AI Scan
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Appointments */}
                                <div className="card p-0 overflow-hidden">
                                    <div className="p-6 border-b flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">Appointments</h3>
                                        <button onClick={() => setBookingModal(true)} className="btn btn-primary bg-[#0f766e] py-1 px-4 text-xs">New Request</button>
                                    </div>
                                    <div className="divide-y text-sm px-6">
                                        {appointments.length === 0 ? (
                                            <p className="py-10 text-center text-gray-500 italic">No appointments scheduled.</p>
                                        ) : (
                                            appointments.slice(0, 4).map(a => (
                                                <div key={a.id} className="py-4 flex justify-between items-center">
                                                    <div className="flex gap-4">
                                                        <div className={`p-2 rounded-lg ${a.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{a.hospitalName}</p>
                                                            <p className="text-xs text-gray-500">{a.date}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`status-pill status-${a.status === 'approved' ? 'confirmed' : 'pending'}`}>
                                                        {a.status === 'approved' ? 'Confirmed' : 'Pending'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other tabs placeholders */}
                        {activeTab !== 'dashboard' && (
                            <div className="card p-20 text-center text-gray-500 bg-white">
                                <FileText className="mx-auto w-12 h-12 mb-4 text-gray-200" />
                                <h3 className="text-xl font-bold text-gray-900">Welcome to {activeTab}</h3>
                                <p>This module is currently being optimized for your experience.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {bookingModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Book Appointment</h3>
                                <button onClick={() => setBookingModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                            </div>
                            <form onSubmit={handleBookAppointment} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Choose Hospital</label>
                                    <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none" value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} required>
                                        <option value="">Select a hospital...</option>
                                        {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Preferred Date</label>
                                    <input type="date" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
                                </div>
                                <button type="submit" className="w-full btn btn-primary bg-[#0f766e] py-4 text-lg font-bold">Request Confirmation</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Analysis Modal - Styled to match */}
            <AnimatePresence>
                {showAiModal && aiResult && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-teal-800 flex items-center gap-3">
                                    <span className="bg-teal-100 p-2 rounded-xl text-xl">✨</span> Swasthya AI Insights
                                </h3>
                                <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                            </div>
                            <div className="space-y-8">
                                <div className="p-6 bg-teal-50 border border-teal-100 rounded-2xl">
                                    <p className="text-xs font-bold text-teal-600 uppercase mb-2 tracking-widest">Medical Summary</p>
                                    <p className="text-teal-950 text-lg leading-relaxed font-semibold">{aiResult.summary}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Medication Breakdown</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {aiResult.medicines.map((med, i) => (
                                            <div key={i} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30">
                                                <p className="font-extrabold text-[#0f766e] text-lg">{med.name}</p>
                                                <p className="text-xs font-bold text-gray-400 mb-3">{med.category}</p>
                                                <p className="text-sm text-gray-600 leading-snug">{med.use}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {aiResult.allWarnings.length > 0 && (
                                    <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                                        <p className="text-xs font-bold text-orange-600 uppercase mb-3 tracking-widest">Safety Advisory</p>
                                        <ul className="space-y-2">
                                            {aiResult.allWarnings.map((w, i) => <li key={i} className="text-sm text-orange-800 font-medium flex gap-2"><span>⚠️</span> {w}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setShowAiModal(false)} className="w-full mt-10 btn btn-primary bg-[#0f766e] py-4 text-lg font-bold">Close Analysis</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SidebarNavItem = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 transition-all group ${active ? 'sidebar-active shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
        <span className={`${active ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-500'}`}>{React.cloneElement(icon, { size: 20 })}</span>
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const StatCard2 = ({ label, value, trend, icon, color }) => {
    const colors = {
        teal: 'bg-teal-50 text-teal-600',
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
    };
    return (
        <div className="card">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${colors[color] || 'bg-gray-50'}`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <div className="px-2 py-1 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{trend}</div>
            </div>
            <p className="text-4xl font-black text-gray-900">{value}</p>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">{label}</p>
        </div>
    );
};

export default PatientDashboard;
