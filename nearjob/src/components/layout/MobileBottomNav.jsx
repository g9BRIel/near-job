import React from 'react';
import { Home, Briefcase, MessageSquare, Settings } from 'lucide-react';

const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'messages', label: 'Chat', icon: MessageSquare },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="mobile-bottom-nav lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={activeTab === item.id ? 'active' : ''}
          data-active={activeTab === item.id}
        >
          <item.icon />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
