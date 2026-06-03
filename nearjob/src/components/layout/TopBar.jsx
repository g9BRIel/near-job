import { useState, useEffect } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { getNotifications } from '../../utils/api';
import { useLanguage } from '../../utils/LanguageContext';

const TopBar = ({ activeTab, userType, userData, onNavigate }) => {
  const { t } = useLanguage();
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchData = async () => {
    // Notifications
    const nData = await getNotifications();
    setUnreadNotifs(nData?.filter(n => !n.isRead).length || 0);

    // Messages
    try {
      const res = await fetch(`${require('../../utils/api').API_BASE}/api/chats`, {
        headers: require('../../utils/api').authHeaders(),
      });
      if (res.ok) {
        const conversations = await res.json();
        const total = (Array.isArray(conversations) ? conversations : []).reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadMessages(total);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Check every 15s
    
    // Listen for manual sync events (like Pardon Agree)
    window.addEventListener('notification-read', fetchData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-read', fetchData);
    };
  }, []);

  return (
    <div className="flex items-center justify-between mb-8 relative">
      <div>
        <h2 className="text-3xl font-bold text-main capitalize">
          {t.nav[activeTab] || activeTab}
        </h2>
        <p className="text-muted mt-1">
          {t.dashboard.welcome} {userData?.fullName || userData?.companyName || (userType === 'worker' ? t.common.worker : t.common.company)}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`p-3 rounded-xl glass relative hover:bg-white/10 transition ${showNotifs ? 'bg-white/10' : ''}`}
          >
            <Bell className="w-5 h-5 text-main" />
            {unreadNotifs > 0 && (
              <span className="absolute top-2 right-2 flex items-center justify-center min-w-[16px] h-4 bg-red-500 rounded-full text-[10px] text-white px-1 font-bold border border-slate-900">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>
          <NotificationDropdown 
            isOpen={showNotifs} 
            onClose={() => setShowNotifs(false)} 
          />
        </div>
        <button 
          onClick={() => onNavigate?.('messages')}
          className={`p-3 rounded-xl glass relative hover:bg-white/10 transition ${activeTab === 'messages' ? 'bg-white/10 text-blue-400' : ''}`}
          title="Go to Messages"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessages > 0 && (
            <span className="absolute top-2 right-2 flex items-center justify-center min-w-[16px] h-4 bg-blue-500 rounded-full text-[10px] text-white px-1 font-bold border border-slate-900">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopBar;