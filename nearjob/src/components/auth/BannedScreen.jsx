import { useState } from 'react';
import { ShieldAlert, Trash2, LogOut, Info } from 'lucide-react';
import { API_BASE, authHeaders } from '../../utils/api';

const BannedScreen = ({ onLogout }) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteAll = async () => {
    if (!agreed) return;
    if (!window.confirm('🚨 WARNING: This will permanently delete your account, jobs, applications, and all personal data. This action CANNOT be undone. Are you sure?')) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        alert('Your data has been purged from the platform. Goodbye.');
        onLogout();
      } else {
        alert('Failed to delete data. Please try again later.');
      }
    } catch (err) {
      console.error(err);
      alert('A technical error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-6 font-sans">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl bg-neutral-950 border border-red-500/30 rounded-3xl p-8 md:p-12 shadow-2xl shadow-red-900/20 text-center">
        <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-red-600 uppercase tracking-tighter mb-4">
          You Banned
        </h1>
        
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 mb-8 text-left">
          <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> Banning Policy Warning
          </h3>
          <ul className="text-gray-400 text-sm space-y-2 list-disc pl-4">
            <li>Posting fraudulent or misleading job advertisements.</li>
            <li>Harassment, hate speech, or unprofessional conduct in chat.</li>
            <li>Multiple reports of scamming or identity theft.</li>
            <li>Violation of payment terms or manual transaction bypass.</li>
            <li>Spamming users with unwanted promotional content.</li>
          </ul>
        </div>

        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto italic">
          "Your access to the NearJob Matrix has been terminated due to a violation of our sacred protocols."
        </p>

        <div className="flex flex-col items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer hidden" 
              />
              <div className="w-6 h-6 border-2 border-red-500/30 rounded-md peer-checked:bg-red-600 peer-checked:border-red-600 transition-all flex items-center justify-center">
                {agreed && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
            </div>
            <span className="text-red-400 text-sm font-semibold group-hover:text-red-300 transition">
              I won't be bad again and I accept my data deletion.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={handleDeleteAll}
              disabled={!agreed || loading}
              className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
                agreed && !loading
                  ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/40 translate-y-0 active:translate-y-1'
                  : 'bg-neutral-900 text-gray-700 border border-white/5 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              {loading ? 'Purging Matrix...' : 'Delete all my data and exit'}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-gray-400 hover:text-white transition-colors bg-white/5"
            >
              <LogOut className="w-5 h-5" />
              Just Log Out
            </button>
          </div>
          
          <p className="text-red-900 font-mono text-[10px] uppercase mt-4">
            Security Status: Account Nullified // Access Restricted
          </p>
        </div>
      </div>
    </div>
  );
};

export default BannedScreen;
