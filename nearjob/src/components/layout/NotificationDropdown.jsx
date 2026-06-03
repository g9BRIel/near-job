import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '../../utils/api';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  const load = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data || []);
    setLoading(false);
  };

  const handleRead = async (id) => {
    const ok = await markNotificationAsRead(id);
    if (ok) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3 w-80 glass border border-main rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-main flex items-center justify-between bg-white/5">
        <h3 className="text-main font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" /> Notifications
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition text-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        {loading && (
          <div className="p-8 text-center text-muted">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-8 text-center text-muted italic">
            No notifications yet.
          </div>
        )}

        {!loading && notifications.map((n) => (
          <div 
            key={n.id} 
            className={`p-4 border-b border-main last:border-0 hover:bg-white/5 transition flex gap-3 ${!n.isRead ? 'bg-blue-500/5' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-blue-500 animate-pulse' : 'bg-transparent'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-main truncate">{n.title}</p>
                {!n.isRead && (
                  <button 
                    onClick={() => handleRead(n.id)}
                    className="p-1 text-blue-400 hover:bg-blue-400/20 rounded transition"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-2">{n.message}</p>
              <p className="text-[10px] text-muted opacity-60">
                {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-main bg-white/5 text-center">
        <button 
          onClick={load}
          className="text-xs text-blue-400 font-medium hover:underline"
        >
          Refresh notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
