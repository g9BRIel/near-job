import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // ← MUST IMPORT THIS!
import './mobile.css'; // ← Mobile responsive styles
import App from './App';
import { LanguageProvider } from './utils/LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);