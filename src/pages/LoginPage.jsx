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
        <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 relative overflow-hidden bg-[#004d4d] font-sans selection:bg-teal-500/30">
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
                </svg>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full flex flex-col items-center max-w-[540px] px-6">
                {/* Branding Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-teal-500 p-5 rounded-[2rem] shadow-2xl shadow-teal-900/40 mb-6"
                    >
                        <Activity className="text-white w-10 h-10" />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl font-black text-white tracking-tighter mb-2"
                    >
                        SwasthyaKosh
                    </motion.h1>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-teal-50/70 font-bold text-sm tracking-widest uppercase"
                    >
                        AI-Powered Digital Healthcare
                    </motion.p>
                </div>

                {/* Role Toggle Above Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative flex bg-white/10 backdrop-blur-xl p-1 rounded-2xl mb-12 border border-white/20 w-80"
                >
                    <div
                        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-xl transition-all duration-300 ease-out shadow-lg ${role === 'hospital' ? 'translate-x-full' : 'translate-x-0'}`}
                    />
                    <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`relative z-10 flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${role === 'patient' ? 'text-teal-950' : 'text-white/60 hover:text-white'}`}
                    >
                        Patient
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('hospital')}
                        className={`relative z-10 flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${role === 'hospital' ? 'text-teal-950' : 'text-white/60 hover:text-white'}`}
                    >
                        Hospital
                    </button>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] p-10 md:p-14 border border-slate-100"
                >
                    {/* Tabs */}
                    <div className="flex bg-slate-100/80 p-1.5 rounded-[2rem] gap-1 mb-10">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-4 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-white shadow-md text-teal-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-4 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-white shadow-md text-teal-900' : 'text-slate-500 hover:text-slate-700'}`}
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
                                    className="bg-red-50 text-red-600 p-5 rounded-3xl mb-2 text-xs font-bold border border-red-100 flex items-center gap-3"
                                >
                                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                    <span className="leading-tight">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                                <div className="relative group">
                                    <UserPlus className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-slate-100 border-2 border-transparent p-5 pl-16 rounded-3xl focus:border-teal-600/30 focus:bg-white outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-100 border-2 border-transparent p-5 pl-16 rounded-3xl focus:border-teal-600/30 focus:bg-white outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-100 border-2 border-transparent p-5 pl-16 rounded-3xl focus:border-teal-600/30 focus:bg-white outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 text-white p-6 rounded-[2rem] text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 mt-4"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-teal-600 transition-colors"
                        >
                            {isLogin ? "New here? Create an account" : "Back to Sign In"}
                        </button>
                    </div>
                </motion.div>

                {/* Demo Status Alert */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-[2rem] w-full"
                >
                    <p className="text-[11px] text-white/50 leading-relaxed text-center font-medium">
                        <span className="font-bold uppercase tracking-widest text-teal-400 block mb-1">Attention</span>
                        This is a secure prototype system. Please do not enter real sensitive data for this session.
                    </p>
                </motion.div>
            </div>

            {/* Bottom-right BPM Widget */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="fixed bottom-10 right-10 hidden lg:flex items-center bg-teal-950/20 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] gap-8 shadow-2xl"
            >
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    />
                    <div className="w-12 h-[3px] bg-white/10 mt-3 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ x: [-48, 48] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        />
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-black text-white tracking-tighter leading-none">72</p>
                    <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em] mt-2">BPM</p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;