import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Key, IdCard, ArrowRight, Lock, ShieldCheck, User, Hospital, Mail } from 'lucide-react';
import CircularText from '../components/CircularText';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail(newRole === 'patient' ? 'patient@demo.com' : 'hospital@demo.com');
    setPassword('123456');
    setError('');
  };

  React.useEffect(() => {
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
          <div className="hero-brand-label" style={{ fontFamily: "'Borgen', 'Outfit', sans-serif", color: '#5C4033', fontWeight: '900', letterSpacing: '5px', textTransform: 'uppercase', fontSize: '28px', marginBottom: '16px' }}>SwasthyaKosh</div>
          <h1 className="hero-title">{t('login.hero_title')}</h1>
          <p className="hero-subtitle">
            {t('login.hero_subtitle')}
          </p>
        </div>

        <div className="trust-badges">
          <span><ShieldCheck size={14} /> {t('login.iso_certified')}</span>
          <span><Lock size={14} /> {t('login.encrypted')}</span>
        </div>
      </div>

      <div className="login-right">
        <LanguageSwitcher className="login-lang-switcher" />
        <div className="login-form-container">
          <div className="form-header">
            <h2>{t('login.welcome_back')}</h2>
            <p>{t('login.subtitle')}</p>
          </div>

          <div className="role-tabs">
            <button
              className={`role-tab ${role === 'patient' ? 'active' : ''}`}
              onClick={() => handleRoleChange('patient')}
              type="button"
            >
              <User size={16} /> {t('login.patient')}
            </button>
            <button
              className={`role-tab ${role === 'hospital' ? 'active' : ''}`}
              onClick={() => handleRoleChange('hospital')}
              type="button"
            >
              <Hospital size={16} /> {t('login.hospital')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-alert">{error}</div>}

            <div className="input-group">
              <label>{t('login.email_id')}</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.email_placeholder')}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="flex justify-between w-full">
                <label>{t('login.security_pin')}</label>
                <a href="#" className="forgot-link">{t('login.forgot')}</a>
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
              <label htmlFor="remember">{t('login.remember_device')}</label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? t('login.authenticating') : t('login.sign_in')}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="register-prompt">
            {t('login.no_health_id')} <a href="#">{t('login.create_one')}</a>
          </div>

          <div className="legal-links">
            <a href="#">{t('login.privacy_policy')}</a> &bull; <a href="#">{t('login.terms_of_service')}</a> &bull; <a href="#">{t('login.help_center')}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
