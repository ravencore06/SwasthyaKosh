import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, Lock, Mail, ChevronRight } from 'lucide-react';
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
                navigate('/dashboard');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Save user role and name to Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email,
                    name,
                    role,
                    createdAt: new Date()
                });

                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0fdfa] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card w-full max-w-md p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#0f766e]">SwasthyaKosh</h1>
                    <p className="text-gray-500 mt-2">Secure Medical Records Storage</p>
                </div>

                <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        className={`flex-1 py-2 rounded-md font-medium transition-all ${role === 'patient' ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500'}`}
                        onClick={() => setRole('patient')}
                    >
                        <User className="inline-block mr-2 w-4 h-4" /> Patient
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md font-medium transition-all ${role === 'hospital' ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500'}`}
                        onClick={() => setRole('hospital')}
                    >
                        <Stethoscope className="inline-block mr-2 w-4 h-4" /> Hospital
                    </button>
                </div>

                <h2 className="text-xl font-semibold mb-6 text-center">
                    {isLogin ? `${role === 'patient' ? 'Patient' : 'Hospital'} Login` : 'Create Account'}
                </h2>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0f766e] outline-none"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0f766e] outline-none"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0f766e] outline-none"
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
                        className="w-full btn btn-primary justify-center mt-6"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        {!loading && <ChevronRight className="w-4 h-4" />}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        className="ml-1 text-[#0f766e] font-semibold hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Create one now' : 'Sign in instead'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
