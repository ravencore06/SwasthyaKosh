import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    LayoutDashboard, Users, Calendar, FilePlus, Settings, LogOut,
    Check, X, Search, Sparkles, Bell, HelpCircle, Sun, MoreVertical, Edit2, Trash2, Filter, Download, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePrescription } from '../utils/aiService';

const HospitalDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // AI/Prescription State
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [prescriptionData, setPrescriptionData] = useState({ diagnosis: '', notes: '' });
    const [aiPreview, setAiPreview] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const qAppts = query(collection(db, 'appointments'), where('hospitalId', '==', currentUser.uid));
            const snapAppts = await getDocs(qAppts);
            setAppointments(snapAppts.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        if (currentUser) fetchData();
    }, [currentUser]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (prescriptionData.notes.length > 5 || prescriptionData.diagnosis.length > 5) {
                setLoadingAi(true);
                const result = await analyzePrescription(prescriptionData.diagnosis + " " + prescriptionData.notes);
                setAiPreview(result);
                setLoadingAi(false);
            } else {
                setAiPreview(null);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [prescriptionData]);

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
            setShowPrescriptionModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col">
                <div className="p-6 flex items-center gap-2 mb-4">
                    <div className="bg-[#2563eb] p-1.5 rounded-lg">
                        <Plus className="text-white w-6 h-6 rotate-45" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">SwasthyaKosh</h2>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <SidebarNavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarNavItem icon={<FilePlus />} label="Prescriptions" active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} />
                    <SidebarNavItem icon={<Calendar />} label="Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
                    <SidebarNavItem icon={<Users />} label="Doctors" active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} />
                    <SidebarNavItem icon={<FilePlus />} label="Documents" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                </nav>

                <div className="p-4 border-t space-y-1">
                    <SidebarNavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-red-600 transition-colors">
                        <Sun className="w-5 h-5" />
                        <span className="font-medium text-sm">Toggle Theme</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>

                    <div className="flex items-center gap-6">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-blue-600 relative">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{userData?.name || 'Dr. Sarah Smith'}</p>
                                <p className="text-xs text-gray-500">{userData?.specialty || 'Cardiologist'}</p>
                            </div>
                            <div className="avatar">S</div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard2 label="Total Appointments" value="124" trend="+12%" icon={<Calendar className="text-blue-600" />} color="blue" />
                            <StatCard2 label="Upcoming" value="8" trend="Today" icon={<Users className="text-purple-600" />} color="purple" />
                            <StatCard2 label="Completed" value="1,024" trend="Total" icon={<Check className="text-green-600" />} color="green" />
                            <StatCard2 label="Cancelled" value="3" trend="-2%" icon={<X className="text-red-600" />} color="red" />
                        </div>

                        {/* Actions Bar */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <button className="btn btn-outline border-gray-200">
                                    <Filter className="w-4 h-4" /> Filter
                                </button>
                                <button className="btn btn-outline border-gray-200">
                                    <Download className="w-4 h-4" /> Export
                                </button>
                            </div>
                            <button
                                onClick={() => setShowPrescriptionModal(true)}
                                className="btn btn-primary bg-blue-600 hover:bg-blue-700 px-6"
                            >
                                <Plus className="w-4 h-4" /> New Prescription
                            </button>
                        </div>

                        {/* Table Card */}
                        <div className="card p-0 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] border-b">
                                    <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                                        <th className="px-6 py-4">Patient Name</th>
                                        <th className="px-6 py-4">Hospital ID</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">No appointments found.</td></tr>
                                    ) : (
                                        appointments.map((a, i) => (
                                            <tr key={a.id} className="table-row">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar bg-blue-100 text-blue-600 text-xs">{a.patientName?.charAt(0)}</div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{a.patientName}</p>
                                                            <p className="text-xs text-gray-500">ID: #MP-{(100 + i).toString().padStart(4, '0')}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">HMS-789</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-900">{a.date}</p>
                                                    <p className="text-xs text-gray-500">09:30 AM</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`status-pill status-${a.status === 'approved' ? 'confirmed' : a.status}`}>
                                                        {a.status === 'approved' ? 'Confirmed' : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">Check-up</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 text-gray-400">
                                                        <button className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="w-4 h-4" /></button>
                                                        <button className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Placeholder */}
                            <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-500">
                                <p>Showing 1 to {appointments.length} of {appointments.length} results</p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50">Prev</button>
                                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
                                    <button className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* New Prescription Modal (Revived from previous but styled better) */}
            <AnimatePresence>
                {showPrescriptionModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6 bg-[#f8fafc] border-b flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Issue New Prescription</h3>
                                <button onClick={() => setShowPrescriptionModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                            </div>

                            <div className="p-8 space-y-6">
                                {!selectedPatient ? (
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-700">Find Patient by Email</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="patient@example.com"
                                                    value={searchEmail}
                                                    onChange={(e) => setSearchEmail(e.target.value)}
                                                />
                                            </div>
                                            <button onClick={handleSearchPatient} className="btn btn-primary px-8">Find</button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAddPrescription} className="space-y-6">
                                        <div className="p-4 bg-blue-50 rounded-xl flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar bg-blue-600 text-white font-bold">{selectedPatient.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold text-blue-900">{selectedPatient.name}</p>
                                                    <p className="text-sm text-blue-700">{selectedPatient.email}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setSelectedPatient(null)} className="text-sm font-bold text-blue-600 hover:underline">Change</button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-sm font-bold text-gray-700">Diagnosis</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="e.g. Chronic Hypertension"
                                                    value={prescriptionData.diagnosis}
                                                    onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <label className="text-xs text-gray-400">Date: {new Date().toLocaleDateString()}</label>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-700">Clinical Notes & Dosage</label>
                                            <textarea
                                                className="w-full p-3 border rounded-xl h-40 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Type medicines and instructions..."
                                                value={prescriptionData.notes}
                                                onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Integrated AI Preview */}
                                        <AnimatePresence>
                                            {(loadingAi || aiPreview) && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-teal-50 border border-teal-100 p-4 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-2 mb-2 text-teal-800 font-bold text-sm">
                                                        <Sparkles className="w-4 h-4" /> Swasthya AI Pre-checker
                                                    </div>
                                                    <p className="text-xs text-teal-700">{loadingAi ? 'Analyzing...' : aiPreview?.summary}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button type="submit" className="w-full btn btn-primary py-4 text-lg font-bold">Issue Digital Prescription</button>
                                    </form>
                                )}
                            </div>
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
        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all group ${active ? 'sidebar-active shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
    >
        <span className={`${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`}>{React.cloneElement(icon, { size: 20 })}</span>
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const StatCard2 = ({ label, value, trend, icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
    };
    return (
        <div className="card">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors[color] || 'bg-gray-50'}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                <div className={`px-2 py-1 rounded bg-opacity-10 text-[10px] font-bold ${trend?.includes('+') ? 'bg-green-500 text-green-600' : trend?.includes('-') ? 'bg-red-500 text-red-600' : 'bg-gray-500 text-gray-500'}`}>
                    {trend}
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-400 mt-1">{label}</p>
        </div>
    );
};

export default HospitalDashboard;
