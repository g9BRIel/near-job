import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children, initialLanguage = 'en' }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || initialLanguage);
  const [t, setT] = useState(getTranslation(language));

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setT(getTranslation(lang));
    localStorage.setItem('language', lang);
  };

  // Sync when language state changes
  useEffect(() => {
    setT(getTranslation(language));
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
