import React, { createContext, useContext, useState, useCallback } from 'react';
import en from '../locales/en';
import hi from '../locales/hi';
import mr from '../locales/mr';
import es from '../locales/es';
import zh from '../locales/zh';
import fr from '../locales/fr';
import pt from '../locales/pt';
import ru from '../locales/ru';
import ar from '../locales/ar';

const locales = { en, hi, mr, es, zh, fr, pt, ru, ar };

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  const t = useCallback(
    (key) => {
      const keys = key.split('.');
      let value = locales[lang];
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    },
    [lang]
  );

  const changeLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
