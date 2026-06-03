import React from 'react';
import { 
  Home, Briefcase, MapPin, MessageSquare, BarChart3, 
  Building2, Settings, HelpCircle, FileText, Bookmark,
  Layers, User, LifeBuoy, ShieldCheck
} from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';
import { useLanguage } from '../../utils/LanguageContext';

const Sidebar = React.memo(({ activeTab, setActiveTab, userType, userData }) => {
  const { t } = useLanguage();

  const getMenuItems = () => {
    const main = [
      { id: 'dashboard', label: t.nav.dashboard, icon: Home },
      { id: 'jobs', label: userType === 'worker' ? t.nav.jobs : t.nav.myJobs, icon: Briefcase },
      { id: 'nearby', label: t.nav.nearby, icon: MapPin },
      { id: 'applications', label: t.nav.applications, icon: FileText },
    ].filter(item => !(item.id === 'nearby' && userType === 'company'));

    const social = [
      { id: 'messages', label: t.nav.messages, icon: MessageSquare },
      { id: 'companies', label: userType === 'worker' ? t.nav.companies : t.nav.workers, icon: Building2 },
      { id: 'saved', label: t.nav.saved, icon: Bookmark },
    ];

    const support = [
      { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
      { id: 'support', label: t.nav.support, icon: HelpCircle },
      { id: 'settings', label: t.nav.settings, icon: Settings },
    ];

    return { main, social, support };
  };

  const { main, social, support } = getMenuItems();

  const getAvatarDisplay = () => {
    const pfp = userData?.avatar || userData?.logo;
    const isImg = typeof pfp === 'string' && (pfp.startsWith('http') || pfp.startsWith('data:'));

    if (isImg) {
      return (
        <img 
          src={pfp} 
          alt="Profile" 
          className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-inner"
        />
      );
    }
    
    return (
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
        userType === 'worker' ? 'from-indigo-500 to-blue-600' : 'from-fuchsia-500 to-pink-600'
      } flex items-center justify-center text-xl border border-white/20 shadow-lg`}>
        {pfp || (userType === 'worker' ? '👤' : '🏢')}
      </div>
    );
  };

  const NavItem = ({ item }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => setActiveTab(item.id)}
        className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
          isActive 
            ? 'bg-white/[0.08] text-white shadow-xl shadow-black/10 overflow-hidden' 
            : 'text-muted hover:text-white hover:bg-white/5'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full" />
        )}
        <div className="relative">
          <item.icon className={`w-5 h-5 transition-transform duration-300 ${
            isActive ? 'text-blue-400 scale-110' : 'text-gray-500 group-hover:text-blue-400/80'
          }`} />
          {isActive && (
            <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full" />
          )}
        </div>
        <span className="flex-1 text-left truncate">{item.label}</span>
        {isActive && (
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        )}
      </button>
    );
  };

  const SectionLabel = ({ children }) => (
    <h3 className="px-6 mt-8 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/80">
      {children}
    </h3>
  );

  return (
    <div className="w-72 h-screen glass fixed left-0 top-0 z-50 flex flex-col border-r border-white/5">
      {/* Branding Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
          <Layers className="w-6 h-6 text-white -rotate-3" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1">
            Near<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Job</span>
          </h1>
          <div className="flex items-center gap-1 text-[8px] font-bold text-blue-500 uppercase tracking-widest -mt-1 opacity-80">
            <ShieldCheck className="w-2.5 h-2.5" /> {t.common.secureHub}
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-6 mb-4">
        <div 
          onClick={() => setActiveTab('edit')}
          className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer group flex items-center gap-4 active:scale-95 duration-200"
        >
          <div className="shrink-0 group-hover:scale-105 transition-transform">{getAvatarDisplay()}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-sm truncate">
              {userData?.fullName || userData?.companyName || (userType === 'worker' ? t.common.worker : t.common.company)}
            </h2>
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted uppercase tracking-tighter mt-1 bg-white/5 w-fit px-2 py-0.5 rounded-full border border-white/5 group-hover:border-blue-400/30 transition-colors">
              <User className="w-2.5 h-2.5 text-blue-400" /> {userType === 'worker' ? t.common.worker : t.common.company}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        <SectionLabel>Nexus Menu</SectionLabel>
        {main.map(item => <NavItem key={item.id} item={item} />)}
        
        <SectionLabel>Social Circle</SectionLabel>
        {social.map(item => <NavItem key={item.id} item={item} />)}

        <SectionLabel>Intelligence</SectionLabel>
        {support.map(item => <NavItem key={item.id} item={item} />)}

        <div className="pb-8" />
      </nav>

      <div className="p-6 border-t border-white/5 space-y-3">
        <button
          onClick={() => setActiveTab('info')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'info' ? 'bg-indigo-500/10 text-indigo-400' : 'text-muted hover:text-indigo-400 hover:bg-indigo-500/5'
          }`}
        >
          <LifeBuoy className="w-5 h-5 opacity-70" />
          {t.nav.documentation}
        </button>
        <LogoutButton />
      </div>
    </div>
  );
});

export default Sidebar;