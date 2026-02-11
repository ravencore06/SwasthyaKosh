import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Activity, ShieldAlert } from 'lucide-react';

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
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#004d4d] font-sans selection:bg-purple-500/30">
            {/* Background Radial Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#008080_0%,#004d4d_100%)] opacity-80" />

            {/* ECG Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                    <motion.path
                        d="M0 500 L200 500 L220 450 L240 550 L260 400 L280 600 L300 500 L1000 500"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        initial={{ pathLength: 0, x: -1000 }}
                        animate={{
                            pathLength: [0, 1, 1],
                            x: [-1000, 0, 1000]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    <motion.path
                        d="M0 500 L200 500 L220 450 L240 550 L260 400 L280 600 L300 500 L1000 500"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        initial={{ pathLength: 0, x: -1500 }}
                        animate={{
                            pathLength: [0, 1, 1],
                            x: [-1500, -500, 500]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 5
                        }}
                    />
                </svg>
            </div>

            {/* Branding Section */}
            <div className="relative z-10 flex flex-col items-center mb-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-purple-600 p-4 rounded-2xl shadow-xl shadow-purple-900/20 mb-4"
                >
                    <Activity className="text-white w-10 h-10" />
                </motion.div>
                <motion.h1
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-black text-white tracking-tight mb-1"
                >
                    SwasthyaKosh
                </motion.h1>
                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-teal-100/60 font-medium text-sm tracking-wide"
                >
                    AI-Powered Digital Prescription Management
                </motion.p>
            </div>

            {/* Role Toggle Above Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex bg-white/10 backdrop-blur-md p-1 rounded-xl mb-6"
            >
                <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${role === 'patient' ? 'bg-white text-teal-950 shadow-sm' : 'text-teal-100/60 hover:text-white'}`}
                >
                    Patient
                </button>
                <button
                    type="button"
                    onClick={() => setRole('hospital')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${role === 'hospital' ? 'bg-white text-teal-950 shadow-sm' : 'text-teal-100/60 hover:text-white'}`}
                >
                    Hospital
                </button>
            </motion.div>

            {/* Login Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl p-10 mx-6"
            >
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 text-red-500 p-4 rounded-2xl mb-2 text-xs font-bold border border-red-100 flex items-center gap-2"
                            >
                                <ShieldAlert className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Full Name</label>
                            <div className="relative group">
                                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl focus:border-purple-600/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-purple-600 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl focus:border-purple-600/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-purple-600 transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl focus:border-purple-600/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white p-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-400 text-xs font-bold hover:text-purple-600 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                    </button>
                </div>
            </motion.div>

            {/* Demo Status Alert */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 mt-10 bg-amber-50/90 backdrop-blur-sm border border-amber-100 p-4 rounded-2xl max-w-[420px] mx-6"
            >
                <p className="text-[11px] text-amber-900/80 leading-relaxed text-center">
                    <span className="font-black">Demo System:</span> This is a prototype for educational purposes. Do not enter real medical data or personal information.
                </p>
            </motion.div>

            {/* Bottom-right BPM Widget */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="fixed bottom-8 right-8 hidden lg:flex items-center bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl gap-6"
            >
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-3 h-3 bg-teal-400 rounded-full"
                    />
                    <div className="w-10 h-[2px] bg-white/20 mt-2 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ x: [-40, 40] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full bg-teal-400"
                        />
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-white leading-none">72</p>
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mt-1">BPM</p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;