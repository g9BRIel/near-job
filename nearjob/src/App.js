import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import TopBar from './components/layout/TopBar';
import AuthPage from './components/auth/AuthPage';
import LandingPage from './components/pages/LandingPage';
import Dashboard from './components/pages/Dashboard';
import JobsPage from './components/pages/JobsPage';
import NearbyPage from './components/pages/NearbyPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import CompaniesPage from './components/pages/CompaniesPage';
import MessagesPage from './components/pages/MessagesPage';
import SettingsPage from './components/pages/SettingsPage';
import Info from './components/pages/Info';
import Edit from './components/pages/Edit';
import AIAssistant from './components/communicationai/ChatDeepSeek';
import WorkersPage from './components/pages/WorkersPage';
import MyJobsPage from './components/pages/MyJobsPage';
import ApplicationsPage from './components/pages/ApplicationsPage';
import SavedPage from './components/pages/SavedPage';
import SupportPage from './components/pages/SupportPage';
import BannedScreen from './components/auth/BannedScreen';
import { fetchCurrentProfile } from './utils/api';
import PardonNotification from './components/common/PardonNotification';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('lastActiveTab') || 'dashboard';
  });

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('lastActiveTab', activeTab);
    }
  }, [activeTab]);
  const [userType, setUserType] = useState('worker');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [companyJobsFocus, setCompanyJobsFocus] = useState(null);
  const [isChangingLang, setIsChangingLang] = useState(null); // name of the language

  const [userData, setUserData] = useState({
    worker: {
      fullName: 'John Doe',
      email: 'john@email.com',
      bio: 'Full Stack Developer with 5 years experience',
      location: 'Downtown, New York',
      skills: ['React', 'Node.js', 'Python'],
      avatar: null,
      phone: '+1 234 567 890',
    },
    company: {
      fullName: 'TechCorp Inc.',
      email: 'hr@techcorp.com',
      about: 'Leading software solutions company',
      location: 'Downtown, New York',
      activityType: 'Software Development',
      phone: '+1 234 567 890',
      avatar: null,
    },
  });

  const consumeChatTarget = useCallback(() => setChatTarget(null), []);

  const selectTabFromMenu = useCallback(
    (tab) => {
      if (tab === 'jobs' && userType === 'worker') {
        setCompanyJobsFocus(null);
      }
      setActiveTab(tab);
    },
    [userType]
  );

  const navigateTo = useCallback(
    (tab, meta = null) => {
      if (tab === 'jobs' && userType === 'worker') {
        setCompanyJobsFocus(null);
      }
      if (tab === 'messages' && meta) {
        setChatTarget(meta);
      }
      setActiveTab(tab);
    },
    [userType]
  );

  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (!cancelled) setAuthReady(true);
        return;
      }
      const profile = await fetchCurrentProfile();
      if (cancelled) return;

      if (profile && profile.networkError) {
        // Backend unreachable — read userType from JWT payload to keep user in
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const type = payload.userType || payload.type || 'worker';
          setUserType(type);
          setIsLoggedIn(true);
        } catch {
          // Malformed token — wipe it
          localStorage.removeItem('token');
        }
      } else if (profile && profile.userType) {
        const type = profile.userType;
        setUserType(type);
        setUserData((prev) => ({ ...prev, [type]: profile }));
        setIsLoggedIn(true);
      } else {
        // null = 401/403 or missing token — clear and go to landing
        localStorage.removeItem('token');
      }
      setAuthReady(true);
    };
    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Priority: localStorage (immediate) > userData (syncing) > default dark
    const savedTheme = localStorage.getItem('theme');
    const userTheme = userData[userType]?.settings?.theme;
    const theme = savedTheme || userTheme || 'dark';
    
    // Always sync back to localStorage if it was missing
    if (!savedTheme && userTheme) {
      localStorage.setItem('theme', userTheme);
    }

    // Sync Language as well
    const userLang = userData[userType]?.settings?.preferences?.language;
    const savedLang = localStorage.getItem('language');
    if (userLang && userLang !== savedLang && userLang !== 'undefined') {
      localStorage.setItem('language', userLang);
    }
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [userData, userType]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setActiveTab('dashboard');
      setShowAuth(false);
      setMobileMenuOpen(false);
    };
    window.addEventListener('nearjob-logout', handleLogout);
    return () => window.removeEventListener('nearjob-logout', handleLogout);
  }, []);

  const handleLogin = (type, profile) => {
    setUserType(type);
    setIsLoggedIn(true);
    setShowAuth(false);
    if (profile) {
      setUserData((prev) => ({
        ...prev,
        [type]: profile,
      }));
    }
  };

  const handleUpdateProfile = (newData) => {
    setUserData((prev) => ({
      ...prev,
      [userType]: { ...prev[userType], ...newData },
    }));
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-white">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Restoring session…</p>
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (!isLoggedIn) {
    return <LandingPage onEnter={() => setShowAuth(true)} />;
  }

  const currentUser = userData[userType];

  if (isLoggedIn && currentUser?.isBanned) {
    return (
      <BannedScreen 
        onLogout={() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            userType={userType} 
            userData={currentUser} 
            onNavigate={navigateTo} 
            onContactCompany={(company) => {
              const name = company.companyName || company.name || company.email || 'Company';
              setChatTarget({ id: company.id, name, userType: 'company' });
              setActiveTab('messages');
            }}
          />
        );
      case 'jobs':
        return userType === 'worker' ? (
          <JobsPage
            userType={userType}
            companyFilter={companyJobsFocus}
            onClearCompanyFilter={() => setCompanyJobsFocus(null)}
          />
        ) : (
          <MyJobsPage userData={currentUser} />
        );
      case 'nearby':
        return <NearbyPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'companies':
        return userType === 'worker' ? (
          <CompaniesPage
            onViewCompanyJobs={(company) => {
              setCompanyJobsFocus({ id: company.id, name: company.name });
              setActiveTab('jobs');
            }}
            onContactCompany={(company) => {
              const name = company.companyName || company.name || company.email || 'Company';
              setChatTarget({ id: company.id, name, userType: 'company' });
              setActiveTab('messages');
            }}
          />
        ) : (
          <WorkersPage
            onContactWorker={(worker) => {
              const name = worker.fullName || worker.companyName || worker.email || 'User';
              setChatTarget({ id: worker.id, name, userType: 'worker' });
              setActiveTab('messages');
            }}
          />
        );
      case 'messages':
        return (
          <MessagesPage
            chatTarget={chatTarget}
            onConsumedChatTarget={consumeChatTarget}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            userType={userType}
            userData={currentUser}
            onUpdate={handleUpdateProfile}
            onNavigate={navigateTo}
            onChangingLang={(name) => {
              setIsChangingLang(name);
              setTimeout(() => setIsChangingLang(null), 2500);
            }}
          />
        );
      case 'applications':
        return <ApplicationsPage userType={userType} onNavigate={navigateTo} />;
      case 'saved':
        return <SavedPage userType={userType} onNavigate={navigateTo} />;
      case 'support':
        return <SupportPage userType={userType} onNavigate={navigateTo} />;
      case 'info':
        return <Info onClose={() => setActiveTab('dashboard')} />;
      case 'edit':
        return (
          <Edit
            userType={userType}
            userData={currentUser}
            onUpdate={handleUpdateProfile}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      default:
        return <Dashboard userType={userType} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      <MobileHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {mobileMenuOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/95 pt-20 px-4">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              selectTabFromMenu(tab);
              setMobileMenuOpen(false);
            }}
            userType={userType}
            userData={currentUser}
          />
        </div>
      ) : null}

      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={selectTabFromMenu}
          userType={userType}
          userData={currentUser}
        />
      </div>

      <div className="lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <TopBar 
            activeTab={activeTab} 
            userType={userType} 
            userData={currentUser}
            onNavigate={navigateTo}
          />
          {renderContent()}
        </div>
      </div>
      <AIAssistant userType={userType} />
      {isLoggedIn && <PardonNotification />}

      {isChangingLang && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 transform animate-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
              Translating to {isChangingLang}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
