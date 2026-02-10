import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden font-display">
            {/* Left Column: Branding/Marketing */}
            <div className="hidden lg:flex lg:w-1/2 bg-[var(--deep-teal)] relative flex-col justify-between p-12 text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <img
                        alt=""
                        className="w-full h-full object-cover scale-150 rotate-12"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjIIWe_MPIwvRCQAbBreUmVqF9NEUVXRYRCePA0ASDNYNM00Dz4wLOZoYUpSUM1t3B5JYuQdeRCllbziymNplWfby8vQYJMIPpjYGyFQB6WI21XsFnzgwE0tuMZO0WNGxV1BoU9o2wjWO8h2cjIn9x5nXzTOAviCaDr2CoKikDuu0HIqwveJLzyN93zUzayHO2hBusmCka-CqPPfSJKpjQZGNH3V1pT4pMJ0NkMaUcjXvkV4q09f6ySU-gklj4hQnPuXV75owsCQ"
                    />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl">ecg</span>
                    <span className="text-2xl font-800 tracking-tight">SwasthyaKosh</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="mb-8 opacity-40">
                        <svg className="w-full h-auto" fill="none" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 50 L120 50 L140 10 L170 90 L200 30 L220 70 L240 50 L400 50" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                        </svg>
                    </div>
                    <h1 className="text-5xl font-800 leading-tight mb-6">The future of medical records.</h1>
                    <p className="text-xl text-teal-50/80 mb-10 leading-relaxed">
                        Your centralized health vault for storing and managing medical prescriptions with SwasthyaKosh security.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <span className="material-symbols-outlined">fingerprint</span>
                            </div>
                            <div>
                                <h3 className="font-700 text-lg">Secure Patient Access</h3>
                                <p className="text-teal-50/60 text-sm">Log in using your Aadhaar ID with encrypted authentication.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <span className="material-symbols-outlined">domain</span>
                            </div>
                            <div>
                                <h3 className="font-700 text-lg">Hospital Infrastructure</h3>
                                <p className="text-teal-50/60 text-sm">Professional dashboard for healthcare providers and clinical staff.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-8 text-[10px] font-700 uppercase tracking-[0.2em] opacity-60">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        GOVT COMPLIANT
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        AES-256 ENCRYPTED
                    </div>
                </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
                <div className="w-full max-w-[440px]">
                    <div className="lg:hidden flex items-center gap-2 mb-8 text-[var(--deep-teal)]">
                        <span className="material-symbols-outlined text-3xl">ecg</span>
                        <span className="text-xl font-800">SwasthyaKosh</span>
                    </div>

                    <div className="mb-8 font-display">
                        <h2 className="text-5xl font-800 text-slate-900 tracking-tight mb-2">
                            {isLogin ? 'Welcome back.' : 'Join the system.'}
                        </h2>
                        <p className="text-slate-500 font-500 text-sm uppercase tracking-widest">
                            Access your SwasthyaKosh Portal
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-xl mb-10">
                        <button
                            onClick={() => setRole('patient')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-700 transition-all ${role === 'patient' ? 'bg-white shadow-sm text-[var(--deep-teal)]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="material-symbols-outlined text-lg">person</span>
                            PATIENT
                        </button>
                        <button
                            onClick={() => setRole('hospital')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-700 transition-all ${role === 'hospital' ? 'bg-white shadow-sm text-[var(--deep-teal)]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="material-symbols-outlined text-lg">local_hospital</span>
                            HOSPITAL
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-xs font-700 border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-6">
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-800 text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-[var(--primary-teal)] transition-colors">person</span>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-[var(--primary-teal)] focus:bg-white text-slate-900 placeholder-slate-400 transition-all text-sm font-500 outline-none"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-800 text-slate-400 uppercase tracking-widest mb-2">
                                {role === 'patient' ? 'Aadhaar ID (or Email)' : 'Hospital ID (or Email)'}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-[var(--primary-teal)] transition-colors">
                                        {role === 'patient' ? 'fingerprint' : 'badge'}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-[var(--primary-teal)] focus:bg-white text-slate-900 placeholder-slate-400 transition-all text-sm font-500 outline-none"
                                    placeholder={role === 'patient' ? "XXXX XXXX XXXX or email@ex.com" : "HOSP-789-XXX or email@hosp.com"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-800 text-slate-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-xs font-700 text-[var(--primary-teal)] hover:underline">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-[var(--primary-teal)] transition-colors">lock</span>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-12 pr-12 py-4 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-[var(--primary-teal)] focus:bg-white text-slate-900 placeholder-slate-400 transition-all text-sm font-500 outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600" type="button">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-[var(--primary-teal)] hover:bg-[var(--deep-teal)] text-white font-800 py-4 rounded-xl transition-all shadow-lg shadow-teal-700/20 active:scale-[0.99] uppercase tracking-widest text-sm disabled:opacity-50"
                        >
                            {loading ? (isLogin ? 'Signing In...' : 'Joining...') : (isLogin ? 'SIGN IN' : 'GET STARTED')}
                            {!loading && <span className="material-symbols-outlined text-lg">login</span>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-500">
                            {isLogin ? 'New to SwasthyaKosh?' : 'Already have an account?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-[var(--primary-teal)] font-800 hover:underline"
                            >
                                {isLogin ? 'Get Started' : 'Sign In'}
                            </button>
                        </p>
                    </div>

                    <div className="lg:hidden mt-8 pt-8 border-t border-slate-100">
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-sm font-700 text-slate-700">
                            <img alt="" className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZnpJMM2Rb5eLlgECd1rQt-Wx_V6YvSMGWlUte42vID8-8gVXPWBilB_YfO5n8K8TdimRS16OfVquCNoEv-rRVc991d030DeE7alR1FOt4JSGdIJ29Wr0Ych9shB2b1KRB6d0NwEmuddumZgxOSAzls-8vihas46TJcw74oPCkif7ca_xg23vnyZyKesw2vDLUlRSZ-bxEZTTqrqaUFi-XZ863rCIOl2mDNxnm2Pn5t487APMRCt-zpqe9uMiIOtTXt1uKSTojAg" />
                            Continue with DigiLocker
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
