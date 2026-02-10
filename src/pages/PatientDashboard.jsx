import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    LayoutDashboard, Calendar, FileText, Settings, LogOut,
    Plus, Search, Sparkles, Bell, Sun, MoreVertical, Download, X, FilePlus, ChevronLeft, ChevronRight
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
            <aside className="w-64 border-r bg-white flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3 mb-6">
                    <div className="bg-[#0f766e] p-2 rounded-xl shadow-lg shadow-teal-500/20">
                        <Plus className="text-white w-5 h-5 rotate-45" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">SwasthyaKosh</h2>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    <SidebarNavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarNavItem icon={<FileText />} label="My Prescriptions" active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} />
                    <SidebarNavItem icon={<Calendar />} label="Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
                    <SidebarNavItem icon={<FilePlus />} label="Health Records" active={activeTab === 'records'} onClick={() => setActiveTab('records')} />
                </nav>

                <div className="p-4 border-t border-gray-50 space-y-1 mt-auto">
                    <SidebarNavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm">
                        <Sun className="w-5 h-5" />
                        Toggle Theme
                    </button>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0">
                    <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>

                    <div className="flex items-center gap-8">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your records..."
                                className="w-full bg-[#f1f5f9] border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-400">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{userData?.name || 'Patient'}</p>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Health ID: #SK-9921</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-gray-100">
                                    <img src={`https://ui-avatars.com/api/?name=${userData?.name || 'P'}&background=0f766e&color=fff`} alt="Profile" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto space-y-10">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <StatCard2 label="Prescriptions" value={prescriptions.length} trend="Active" icon={<FileText className="text-teal-600" />} color="teal" />
                            <StatCard2 label="Apptmnts" value={appointments.filter(a => a.status === 'pending').length} trend="Pending" icon={<Calendar className="text-orange-600" />} color="orange" />
                            <StatCard2 label="Health Score" value="A+" trend="Excellent" icon={<Sparkles className="text-blue-600" />} color="blue" />
                        </div>

                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Recent Prescriptions */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-900">Recent Prescriptions</h3>
                                        <button onClick={() => setActiveTab('prescriptions')} className="text-teal-600 text-sm font-bold hover:underline">View All</button>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {prescriptions.length === 0 ? (
                                            <div className="p-20 text-center opacity-40">
                                                <FileText className="mx-auto w-10 h-10 mb-2" />
                                                <p className="font-bold">No records found</p>
                                            </div>
                                        ) : (
                                            prescriptions.slice(0, 4).map(p => (
                                                <div key={p.id} className="p-8 flex justify-between items-center hover:bg-gray-50/50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold scale-90 group-hover:scale-100 transition-transform">
                                                            <FileText size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{p.diagnosis}</p>
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{p.hospitalName} • {new Date(p.date?.seconds * 1000).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleAiAnalysis(p)}
                                                            className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-100 transition-colors"
                                                        >
                                                            AI Scan
                                                        </button>
                                                        <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors"><Download size={20} /></button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Appointments */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-900">My Appointments</h3>
                                        <button onClick={() => setBookingModal(true)} className="px-6 py-2 bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all active:scale-95">New Slot</button>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {appointments.length === 0 ? (
                                            <div className="p-20 text-center opacity-40">
                                                <Calendar className="mx-auto w-10 h-10 mb-2" />
                                                <p className="font-bold">No upcoming visits</p>
                                            </div>
                                        ) : (
                                            appointments.slice(0, 4).map(a => (
                                                <div key={a.id} className="p-8 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${a.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            <Calendar size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{a.hospitalName}</p>
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{a.date}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${a.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {a.status === 'approved' ? 'Confirmed' : 'Pending'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {bookingModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 border border-gray-100">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">New Visit</h3>
                                <button onClick={() => setBookingModal(false)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleBookAppointment} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Hospital Selection</label>
                                    <select className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all font-bold text-gray-700" value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} required>
                                        <option value="">Choose a center...</option>
                                        {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Appointment Date</label>
                                    <input type="date" className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all font-bold text-gray-700" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
                                </div>
                                <button type="submit" className="w-full bg-teal-600 text-white p-5 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:bg-teal-700 hover:-translate-y-1 transition-all active:scale-95">Book Now</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Analysis Modal */}
            <AnimatePresence>
                {showAiModal && aiResult && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-12 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                            <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
                                <h3 className="text-3xl font-black text-teal-900 tracking-tighter flex items-center gap-3">
                                    <span className="bg-teal-100 p-3 rounded-2xl text-2xl shadow-inner">✨</span> Swasthya AI
                                </h3>
                                <button onClick={() => setShowAiModal(false)} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all active:scale-90"><X size={28} /></button>
                            </div>
                            <div className="space-y-10">
                                <div className="p-8 bg-teal-50/50 rounded-[2.5rem] border border-teal-100/50 shadow-inner">
                                    <p className="text-[12px] font-black text-teal-600 uppercase mb-3 tracking-[0.2em]">Patient Summary</p>
                                    <p className="text-teal-950 text-xl leading-relaxed font-bold italic">"{aiResult.summary}"</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-black text-gray-400 uppercase mb-6 tracking-[0.2em] ml-1">Medication Profile</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {aiResult.medicines.map((med, i) => (
                                            <div key={i} className="p-6 rounded-[2rem] bg-[#f8fafc] border border-gray-100 hover:border-teal-200 transition-colors group">
                                                <p className="font-black text-[#0f766e] text-xl mb-1 group-hover:scale-105 transition-transform origin-left">{med.name}</p>
                                                <p className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">{med.category}</p>
                                                <p className="text-sm text-gray-600 leading-relaxed font-medium">{med.use}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {aiResult.allWarnings.length > 0 && (
                                    <div className="p-8 bg-orange-50 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Bell size={80} className="rotate-12" /></div>
                                        <p className="text-[12px] font-black text-orange-600 uppercase mb-4 tracking-[0.2em]">Safety Protocol</p>
                                        <ul className="space-y-3 relative z-10">
                                            {aiResult.allWarnings.map((w, i) => <li key={i} className="text-sm text-orange-950 font-bold flex gap-3 items-start">
                                                <span className="mt-0.5">⚠️</span>
                                                <span className="leading-tight">{w}</span>
                                            </li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setShowAiModal(false)} className="w-full mt-12 bg-[#0f766e] text-white p-6 rounded-[2.5rem] text-lg font-black uppercase tracking-widest shadow-2xl shadow-teal-500/30 hover:bg-teal-800 hover:-translate-y-1 transition-all active:scale-95">Close Analysis</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SidebarNavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 py-3.5 transition-all rounded-2xl font-bold text-sm ${active
            ? 'sidebar-active shadow-md shadow-teal-500/10'
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 uppercase tracking-wider text-[11px]'
            }`}
    >
        <span className={active ? 'text-[#0f766e]' : 'text-gray-300'}>{React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}</span>
        {label}
    </button>
);

const StatCard2 = ({ label, value, trend, icon, color }) => {
    const bgColors = {
        teal: 'bg-teal-50 text-teal-600',
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
    };
    return (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group hover:-translate-y-2">
            <div className="flex justify-between items-start mb-8">
                <div className={`p-5 rounded-[1.5rem] transition-all group-hover:rotate-6 group-hover:scale-110 ${bgColors[color] || 'bg-gray-50'}`}>
                    {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest">{trend}</div>
            </div>
            <p className="text-5xl font-black text-gray-900 mb-2 tracking-tighter">{value}</p>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        </div>
    );
};

export default PatientDashboard;
