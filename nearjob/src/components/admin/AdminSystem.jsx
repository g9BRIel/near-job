import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Shield, RefreshCw, Lock, Mail } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/* ══════════════════════════════════════════════════
   CLEAN ADMIN LOGIN FORM — no credential hints
══════════════════════════════════════════════════ */
function AdminLoginModal({ onSuccess, onClose }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE}/api/admin/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Access denied');
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_data',  JSON.stringify(data.admin));
      onSuccess(data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <div className="w-full max-w-[380px] bg-slate-950 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-10 pb-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-indigo-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white text-2xl font-black tracking-tight">Admin Access</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Sign in to the control panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-700"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-11 pr-12 py-3.5 text-white text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Signing in…</>
              : 'Sign In'
            }
          </button>
        </form>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════
   ROOT — session restore + show/hide
══════════════════════════════════════════════════ */
const AdminSystem = ({ onMount }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [adminData, setAdminData] = useState(() => {
    try {
      const s = localStorage.getItem('admin_data');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (onMount) onMount({ openDoor: () => setShowLogin(true) });
  }, [onMount]);

  if (adminData) {
    return (
      <AdminDashboard
        adminData={adminData}
        onLogout={() => {
          setAdminData(null);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_data');
        }}
      />
    );
  }

  return showLogin
    ? <AdminLoginModal onSuccess={setAdminData} onClose={() => setShowLogin(false)} />
    : null;
};

export default AdminSystem;
export { AdminLoginModal, AdminDashboard };
