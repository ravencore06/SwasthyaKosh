import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    LayoutDashboard, Users, Calendar, FileText, Settings, LogOut,
    Check, X, Search, Sparkles, Bell, HelpCircle, Sun, MoreVertical, Edit2, Trash2, Filter, Download, Plus, FolderOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePrescription } from '../utils/aiService';

const HospitalDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals & AI State (Keeping functional logic in case they click things)
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            const qAppts = query(collection(db, 'appointments'), where('hospitalId', '==', currentUser.uid));
            const snapAppts = await getDocs(qAppts);
            setAppointments(snapAppts.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchData();
    }, [currentUser]);

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#f1f5f9] bg-white flex flex-col shrink-0">
                <div className="p-8 flex items-center gap-3 mb-6">
                    <div className="bg-[#2563eb] p-2 rounded-xl shadow-lg shadow-blue-500/20">
                        <Plus className="text-white w-5 h-5 rotate-45" />
                    </div>
                    <h2 className="text-xl font-black text-[#1e293b] tracking-tight">SwasthyaKosh</h2>
                </div>

                <nav className="flex-1 px-6 space-y-2">
                    <SidebarNavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarNavItem icon={<FileText />} label="Prescriptions" active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} />
                    <SidebarNavItem icon={<Calendar />} label="Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
                    <SidebarNavItem icon={<Users />} label="Doctors" active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} />
                    <SidebarNavItem icon={<FolderOpen />} label="Documents" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                </nav>

                <div className="p-6 border-t border-gray-50 space-y-2 mt-auto">
                    <SidebarNavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 rounded-2xl">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Toggle Theme</span>
                        <Sun className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-[#f1f5f9] flex items-center justify-between px-10 shrink-0">
                    <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Appointments Management</h1>

                    <div className="flex items-center gap-10">
                        <div className="relative w-[400px]">
                            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                className="w-full bg-[#f8fafc] border border-transparent rounded-[1rem] py-3 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-400"
                                value={searchQuery}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-400">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-white"></span>
                            </button>

                            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#1e293b]">Dr. Sarah Smith</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.1em]">Cardiologist</p>
                                </div>
                                <div className="w-11 h-11 rounded-full border-2 border-white shadow-md overflow-hidden ring-1 ring-gray-100">
                                    <img src="https://ui-avatars.com/api/?name=Sarah+Smith&background=2563eb&color=fff" alt="Profile" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <main className="flex-1 overflow-y-auto p-12 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto space-y-12">

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <StatCard2 label="Total Appointments" value="124" trend="+12%" icon={<Calendar />} color="blue" />
                            <StatCard2 label="Upcoming" value="8" trend="Today" icon={<LayoutDashboard />} color="purple" />
                            <StatCard2 label="Completed" value="1,024" trend="Total" icon={<Check />} color="green" />
                            <StatCard2 label="Cancelled" value="3" trend="-2%" icon={<X />} color="red" />
                        </div>

                        {/* Sub-Header Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2.5 px-6 py-3 bg-white border border-[#f1f5f9] rounded-2xl text-[12px] font-black uppercase tracking-widest text-gray-600 hover:shadow-lg hover:shadow-gray-200/50 transition-all active:scale-95">
                                    <Filter size={16} className="text-gray-400" /> Filter
                                </button>
                                <button className="flex items-center gap-2.5 px-6 py-3 bg-white border border-[#f1f5f9] rounded-2xl text-[12px] font-black uppercase tracking-widest text-gray-600 hover:shadow-lg hover:shadow-gray-200/50 transition-all active:scale-95">
                                    <Download size={16} className="text-gray-400" /> Export
                                </button>
                            </div>
                            <button
                                onClick={() => setShowAppointmentModal(true)}
                                className="flex items-center gap-2.5 px-8 py-3.5 bg-[#2563eb] text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] shadow-xl shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 hover:-translate-y-1"
                            >
                                <Plus size={18} strokeWidth={3} /> New Appointment
                            </button>
                        </div>

                        {/* Appointments Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#f1f5f9] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#fcfdfe] border-b border-[#f1f5f9]">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Name</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Doctor</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date & Time</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                                        <th className="px-10 py-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50/50">
                                    <AppointmentRow
                                        name="Jane Cooper"
                                        id="#MP-00125"
                                        doctor="Dr. Sarah Smith"
                                        specialty="Cardiology"
                                        date="Oct 24, 2023"
                                        time="09:30 AM"
                                        status="Confirmed"
                                        type="Check-up"
                                        avatar="https://ui-avatars.com/api/?name=Jane+Cooper&background=ffedd5&color=9a3412"
                                    />
                                    <AppointmentRow
                                        name="Cody Fisher"
                                        id="#MP-00126"
                                        doctor="Dr. James Wilson"
                                        specialty="Neurology"
                                        date="Oct 24, 2023"
                                        time="11:00 AM"
                                        status="Pending"
                                        type="Consultation"
                                        avatar="https://ui-avatars.com/api/?name=Cody+Fisher&background=eff6ff&color=1e40af"
                                    />
                                    <AppointmentRow
                                        name="Esther Howard"
                                        id="#MP-00127"
                                        doctor="Dr. Sarah Smith"
                                        specialty="Cardiology"
                                        date="Oct 24, 2023"
                                        time="02:15 PM"
                                        status="In Progress"
                                        type="Surgery"
                                        avatar="https://ui-avatars.com/api/?name=Esther+Howard&background=f0fdf4&color=166534"
                                    />
                                    <AppointmentRow
                                        name="Jenny Wilson"
                                        id="#MP-00128"
                                        doctor="Dr. Linda Blair"
                                        specialty="Dermatology"
                                        date="Oct 25, 2023"
                                        time="10:00 AM"
                                        status="Cancelled"
                                        type="Follow-up"
                                        avatar="https://ui-avatars.com/api/?name=Jenny+Wilson&background=fdf2f8&color=9d174d"
                                    />
                                </tbody>
                            </table>

                            {/* Pagination footer */}
                            <div className="px-12 py-8 flex items-center justify-between bg-white border-t border-[#f1f5f9]">
                                <p className="text-sm font-bold text-gray-400">Showing <span className="text-[#1e293b]">1</span> to <span className="text-[#1e293b]">4</span> of <span className="text-[#1e293b]">24</span> results</p>
                                <div className="flex gap-3">
                                    <button className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors active:scale-95"><ChevronLeft size={18} className="text-gray-400" /> </button>
                                    <button className="w-10 h-10 flex items-center justify-center bg-[#2563eb] text-white rounded-xl font-black text-xs shadow-lg shadow-blue-500/20">1</button>
                                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1e293b] hover:bg-gray-50 rounded-xl font-black text-xs transition-colors">2</button>
                                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1e293b] hover:bg-gray-50 rounded-xl font-black text-xs transition-colors">3</button>
                                    <button className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors active:scale-95"><ChevronRight size={18} className="text-gray-400" /> </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const SidebarNavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 py-4 transition-all rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.1em] ${active
            ? 'bg-[#eff6ff] text-[#2563eb] shadow-xl shadow-blue-500/5'
            : 'text-gray-400 hover:bg-[#f8fafc] hover:text-gray-600'
            }`}
    >
        <span className={active ? 'text-[#2563eb]' : 'text-gray-300'}>{React.cloneElement(icon, { size: 20, strokeWidth: active ? 3 : 2.5 })}</span>
        {label}
    </button>
);

const StatCard2 = ({ label, value, trend, icon, color }) => {
    const meta = {
        blue: { bg: 'bg-[#eff6ff]', text: 'text-[#2563eb]', trend: 'text-[#16a34a] bg-[#f0fdf4]' },
        purple: { bg: 'bg-[#faf5ff]', text: 'text-[#9333ea]', trend: 'text-[#9333ea] bg-[#faf5ff]' },
        green: { bg: 'bg-[#f0fdf4]', text: 'text-[#16a34a]', trend: 'text-[#16a34a] bg-[#f0fdf4]' },
        red: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', trend: 'text-[#dc2626] bg-[#fef2f2]' },
    };
    return (
        <div className="bg-white p-10 rounded-[3rem] border border-[#f1f5f9] shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group hover:-translate-y-2">
            <div className="flex justify-between items-start mb-10">
                <div className={`p-4.5 rounded-2xl transition-all group-hover:scale-110 shadow-sm ${meta[color].bg} ${meta[color].text}`}>
                    {React.cloneElement(icon, { size: 24, strokeWidth: 3 })}
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${trend.includes('+') ? 'text-[#16a34a] bg-[#f0fdf4] border-[#dcfce7]' :
                    trend.includes('-') ? 'text-[#dc2626] bg-[#fef2f2] border-[#fee2e2]' :
                        'text-gray-400 bg-gray-50 border-gray-100'
                    }`}>
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-4xl font-black text-[#1e293b] mb-1.5 tracking-tighter">{value}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
            </div>
        </div>
    );
};

const AppointmentRow = ({ name, id, doctor, specialty, date, time, status, type, avatar }) => {
    const statusColors = {
        'Confirmed': 'bg-[#f0fdf4] text-[#16a34a] border border-[#dcfce7]',
        'Pending': 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
        'In Progress': 'bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]',
        'Cancelled': 'bg-[#fef2f2] text-[#dc2626] border border-[#fee2e2]',
    };
    return (
        <tr className="hover:bg-blue-50/10 transition-colors group border-b border-gray-50 last:border-0 font-medium">
            <td className="px-10 py-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-gray-100">
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-black text-[#1e293b] text-sm tracking-tight">{name}</p>
                        <p className="text-[9px] font-black text-gray-300 tracking-[0.2em] uppercase mt-0.5">{id}</p>
                    </div>
                </div>
            </td>
            <td className="px-10 py-6">
                <p className="font-bold text-[#334155] text-sm tracking-tight">{doctor}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{specialty}</p>
            </td>
            <td className="px-10 py-6">
                <p className="font-bold text-[#334155] text-sm tracking-tight">{date}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{time}</p>
            </td>
            <td className="px-10 py-6">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${statusColors[status]}`}>
                    {status}
                </span>
            </td>
            <td className="px-10 py-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">{type}</p>
            </td>
            <td className="px-10 py-6 text-right">
                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90 shadow-sm"><Edit2 size={16} strokeWidth={3} /></button>
                    <button className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 shadow-sm"><Trash2 size={16} strokeWidth={3} /></button>
                </div>
            </td>
        </tr>
    );
};

export default HospitalDashboard;
