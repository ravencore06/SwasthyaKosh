import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, IdCard, ArrowRight, Lock, ShieldCheck, User, Hospital, Mail } from 'lucide-react';
import CircularText from '../components/CircularText';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // Auto-fill for demo purposes to match the mock db
    setEmail(newRole === 'patient' ? 'patient@demo.com' : 'hospital@demo.com');
    setPassword('123456');
    setError('');
  };

  React.useEffect(() => {
    // Initial auto-fill
    setEmail(role === 'patient' ? 'patient@demo.com' : 'hospital@demo.com');
    setPassword('123456');
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, role);
      navigate(`/${role}-dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="brand-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '380px' }}>
          <div className="circular-badge-container">
            <CircularText size={400} radius={90} text="Safe records--Appointments--Diagnosis--Guide--" />
          </div>
          <img src="/src/assets/ash_brush_bg.png" alt="Ash Paint Background" style={{ width: '450px', position: 'absolute', mixBlendMode: 'multiply', opacity: 0.9, zIndex: 1 }} />
          <img src="/src/assets/brush_logo.png" alt="SwasthyaKosh Brush Logo" style={{ width: '380px', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'grayscale(1) brightness(1.2) contrast(1.5)', position: 'relative', zIndex: 2 }} />
        </div>
        
        <div className="hero-content">
          <div className="hero-brand-label" style={{ color: '#5C4033', fontWeight: '900', letterSpacing: '5px', textTransform: 'uppercase', fontSize: '28px', marginBottom: '16px' }}>SwasthyKosh</div>
          <h1 className="hero-title">The Future of Secure Health Records.</h1>
          <p className="hero-subtitle">
            A high-end, secure digital vault for all your medical
            documentation, powered by decentralized security.
          </p>
        </div>

        <div className="trust-badges">
          <span><ShieldCheck size={14} /> ISO 27001 Certified</span>
          <span><Lock size={14} /> End-to-End Encrypted</span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Access your medical history securely.</p>
          </div>

          <div className="role-tabs">
            <button 
              className={`role-tab ${role === 'patient' ? 'active' : ''}`}
              onClick={() => handleRoleChange('patient')}
              type="button"
            >
              <User size={16} /> Patient
            </button>
            <button 
              className={`role-tab ${role === 'hospital' ? 'active' : ''}`}
              onClick={() => handleRoleChange('hospital')}
              type="button"
            >
              <Hospital size={16} /> Hospital
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-alert">{error}</div>}
            
            <div className="input-group">
              <label>Email ID</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="flex justify-between w-full">
                <label>Security PIN / OTP</label>
                <a href="#" className="forgot-link">Forgot?</a>
              </div>
              <div className="input-wrapper">
                <Key size={20} className="input-icon" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember this device</label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="register-prompt">
            Don't have a digital health ID? <a href="#">Create one now</a>
          </div>

          <div className="legal-links">
            <a href="#">PRIVACY POLICY</a> • <a href="#">TERMS OF SERVICE</a> • <a href="#">HELP CENTER</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
