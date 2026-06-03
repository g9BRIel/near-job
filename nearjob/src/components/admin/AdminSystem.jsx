import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Crown, ShieldAlert, RefreshCw, ShieldCheck } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/* ════════════════════════════════════
   NEXIA CYBER-AI FACE (100% POWER)
════════════════════════════════════ */
const CyberFace = () => (
  <div className="relative w-32 h-32 flex items-center justify-center select-none pointer-events-none transform scale-110">
    {/* Head Shield / Glow */}
    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
    
    <div className="relative w-24 h-24 bg-slate-950 rounded-[3rem] border-2 border-indigo-500/30 overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.2)]">
      {/* Internal Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:10px_10px]" />
      
      {/* Eyes Container */}
      <div className="flex justify-between w-full px-6 absolute top-1/2 -translate-y-6">
        {[0, 1].map(i => (
          <div key={i} className="relative">
            <div className="w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_15px_#818cf8] animate-[eyeBlink_4s_infinite]">
               {/* Pixel Pupil */}
               <div className="absolute inset-1 bg-white rounded-sm opacity-80" />
            </div>
            {/* Eye Ring */}
            <div className="absolute -inset-1 border border-indigo-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        ))}
      </div>

      {/* Processing Cheeks (Data Nodes) */}
      <div className="flex justify-between w-full px-4 absolute bottom-8 opacity-40">
        <div className="w-3 h-1 bg-indigo-500 rounded-full animate-pulse" />
        <div className="w-3 h-1 bg-indigo-500 rounded-full animate-pulse" />
      </div>

      {/* Holographic Speech Pulse (Mouth) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
        {[2, 4, 3, 5, 2].map((h, i) => (
          <div 
            key={i} 
            className="w-1 bg-indigo-400/60 rounded-full" 
            style={{ 
              height: `${h * 2}px`, 
              animation: `voiceWave 1.2s infinite ease-in-out ${i * 0.1}s` 
            }} 
          />
        ))}
      </div>

      {/* Scanner Sweep */}
      <div className="absolute inset-0 w-full h-[30%] bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent -translate-y-full animate-[faceScan_4s_infinite_linear]" />
    </div>

    {/* Floating HUD Elements */}
    <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-indigo-400/50 rounded-tr-xl animate-bounce" />
    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-indigo-400/50 rounded-bl-xl animate-bounce" style={{ animationDelay: '0.5s' }} />

    <style>{`
      @keyframes eyeBlink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
      @keyframes voiceWave { 0%, 100% { transform: scaleY(1); opacity: 0.4; } 50% { transform: scaleY(2.5); opacity: 1; } }
      @keyframes faceScan { 0% { transform: translateY(-100%); } 100% { transform: translateY(300%); } }
    `}</style>
  </div>
);


/* ════════════════════════════════════
   LOGIN MODAL (Medium Compact)
════════════════════════════════════ */
function AdminLoginModal({ onSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Access denied');
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_data', JSON.stringify(data.admin));
      onSuccess(data.admin);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
      <div className="w-full max-w-[380px] bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden border border-white/50 animate-in zoom-in-95 fade-in duration-500">
        <div className="bg-slate-900 p-8 flex flex-col items-center relative overflow-hidden">
          {/* Grid Background Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />
          
          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors z-10"><X className="w-5 h-5" /></button>
          
          <CyberFace />
          
          <h2 className="text-white font-black text-xl mt-6 tracking-tight relative z-10">System Gateway</h2>
          <div className="mt-2 flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20 relative z-10">
            <Crown className="w-3 h-3" /> Secure Command Access
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identification</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@nearjob.io"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Access Protocol</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black text-center animate-shake">{error}</div>}
          <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            {loading ? 'Authenticating...' : 'Enter System'}
          </button>
        </form>
      </div>
    </div>
  );
}


/* ════════════════════════════════════
   ROOT SYSTEM
════════════════════════════════════ */
const AdminSystem = ({ onMount }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [adminData, setAdminData] = useState(() => {
    try { const s = localStorage.getItem('admin_data'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  useEffect(() => {
    if (onMount) onMount({ openDoor: () => setShowLogin(true) });
  }, [onMount]);

  if (adminData) {
    return <AdminDashboard adminData={adminData} onLogout={() => { setAdminData(null); localStorage.removeItem('admin_token'); localStorage.removeItem('admin_data'); }} />;
  }
  return showLogin ? <AdminLoginModal onSuccess={setAdminData} onClose={() => setShowLogin(false)} /> : null;
};

export default AdminSystem;
export { AdminLoginModal, AdminDashboard };
