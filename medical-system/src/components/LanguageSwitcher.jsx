import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
];

const LanguageSwitcher = ({ className = '' }) => {
  const { lang, changeLanguage } = useLanguage();

  return (
    <div className={`language-switcher ${className}`}>
      <Globe size={16} />
      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
