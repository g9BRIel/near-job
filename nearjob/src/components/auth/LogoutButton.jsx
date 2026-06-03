import { LogOut } from 'lucide-react';

const LogoutButton = () => {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out from NearJob? 𓂀')) {
      // Dispatch custom event that App.jsx listens for
      window.dispatchEvent(new CustomEvent('nearjob-logout'));
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
    >
      <LogOut className="w-5 h-5" />
      Log Out
    </button>
  );
};

export default LogoutButton;