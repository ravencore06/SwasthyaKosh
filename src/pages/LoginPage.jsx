import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, Lock, Mail, ChevronRight, Activity, ShieldCheck, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate(`/${role}`);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email,
                    name,
                    role,
                    createdAt: new Date()
                });

                navigate(`/${role}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-gray-900">
            {/* Left Column: Branding/Marketing */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-20 bg-[#0f766e] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-40 opacity-10">
                    <Activity className="w-[800px] h-[800px] -rotate-12" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-20">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md ring-1 ring-white/30">
                            <Plus className="text-white w-6 h-6 rotate-45" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter">SwasthyaKosh</h2>
                    </div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <span className="text-sm font-black leading-tight tracking-tighter">
                            The future of <br />
                            <span className="text-teal-300">medical storage.</span>
                        </span>
                        <p className="text-xl text-teal-50/80 max-w-lg font-medium leading-relaxed">
                            A secure, AI-powered platform for patients and hospitals to maintain continuous, lifelong medical records.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 flex gap-12 border-t border-white/10 pt-10">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-teal-300" />
                        <span className="text-sm font-bold uppercase tracking-widest text-teal-100/60">Tier-4 Security</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Activity className="text-teal-300" />
                        <span className="text-sm font-bold uppercase tracking-widest text-teal-100/60">Live Analytics</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-20 bg-[#f8fafc]">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-white p-20 rounded-[5rem] shadow-2xl shadow-blue-500/10">

                    <div className="text-center mb-12 lg:hidden">
                        <h1 className="text-5xl font-black text-[#0f766e] tracking-tighter">SwasthyaKosh</h1>
                    </div>

                    <div className="flex mb-16 bg-gray-50 p-2.5 rounded-3xl ring-1 ring-gray-100/50">
                        <button
                            className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${role === 'patient' ? 'bg-white text-teal-600 shadow-xl' : 'text-gray-400'}`}
                            onClick={() => setRole('patient')}
                        >
                            <User className="inline-block mr-2 w-5 h-5" /> Patient
                        </button>
                        <button
                            className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${role === 'hospital' ? 'bg-white text-teal-600 shadow-xl' : 'text-gray-400'}`}
                            onClick={() => setRole('hospital')}
                        >
                            <Stethoscope className="inline-block mr-2 w-5 h-5" /> Hospital
                        </button>
                    </div>

                    <div className="space-y-4 mb-16">
                        <h2 className="text-6xl font-black tracking-tighter text-gray-900 leading-tight">
                            {isLogin ? 'Welcome back.' : 'Join the system.'}
                        </h2>
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em] ml-1">
                            {role} access portal
                        </p>
                    </div>

                    {error && <div className="bg-red-50 text-red-500 p-6 rounded-[2rem] mb-16 text-sm font-bold border border-red-100">{error}</div>}

                    <form onSubmit={handleAuth} className="space-y-10">
                        {!isLogin && (
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-6 w-6 h-6 text-gray-300" />
                                    <input
                                        type="text"
                                        className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-gray-50 rounded-[2rem] focus:border-teal-500 focus:bg-white outline-none transition-all font-bold text-lg text-gray-700 placeholder:text-gray-200"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Secure Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-6 w-6 h-6 text-gray-300" />
                                <input
                                    type="email"
                                    className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-gray-50 rounded-[2rem] focus:border-teal-500 focus:bg-white outline-none transition-all font-bold text-lg text-gray-700 placeholder:text-gray-200"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Access Password</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-6 w-6 h-6 text-gray-300" />
                                <input
                                    type="password"
                                    className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-gray-50 rounded-[2rem] focus:border-teal-500 focus:bg-white outline-none transition-all font-bold text-lg text-gray-700 placeholder:text-gray-200"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 text-white py-6 rounded-[2.5rem] text-xl font-black uppercase tracking-[0.25em] shadow-2xl shadow-teal-500/30 hover:bg-teal-800 hover:-translate-y-1.5 transition-all active:scale-95 flex items-center justify-center gap-5 mt-16 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : (isLogin ? 'Sign In' : 'Get Started')}
                            {!loading && <ChevronRight className="w-6 h-6" />}
                        </button>
                    </form>

                    <div className="mt-16 text-center font-bold text-base text-gray-400">
                        {isLogin ? "No account yet?" : "Already joined?"}
                        <button
                            className="ml-2 text-teal-600 hover:underline"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Create Account' : 'Sign In'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
