import React, { useState, useEffect, useCallback } from 'react';
import {
  Crown, LogOut, Users as UsersIcon, Briefcase,
  ShieldAlert, RefreshCw, FileText, Shield,
} from 'lucide-react';

import Users   from './sections/Users';
import Jobs    from './sections/Jobs';
import Reports from './sections/Reports';
import Admins  from './sections/Admins';

const API_BASE     = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const adminHeaders = () => {
  const t = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

/* Only the 5 tabs the owner wants */
const NAV = [
  { id: 'users',   icon: UsersIcon,   label: 'Manage Users'  },
  { id: 'jobs',    icon: Briefcase,   label: 'Manage Jobs'   },
  { id: 'admins',  icon: Shield,      label: 'Manage Admins' },
  { id: 'reports', icon: ShieldAlert, label: 'User Reports'  },
];

export default function AdminDashboard({ adminData, onLogout }) {
  const [tab,       setTab]       = useState('users');
  const [workers,   setWorkers]   = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs,      setJobs]      = useState([]);
  const [reports,   setReports]   = useState([]);
  const [admins,    setAdmins]    = useState([]);
  const [loading,   setLoading]   = useState(false);

  const fetchData = useCallback(async (endpoint, setter, transform) => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/${endpoint}`, { headers: adminHeaders() });
      if (r.ok) {
        const d = await r.json();
        setter(transform ? transform(d) : d);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  const loadAll = useCallback(() => {
    fetchData('workers',   setWorkers);
    fetchData('companies', setCompanies);
    fetchData('jobs',      setJobs);
    fetchData('reports',   setReports);
    if (adminData?.isSuperAdmin) {
      fetchData('admins', setAdmins);
    }
  }, [fetchData, adminData]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Delete a job ───────────────────────────────────────────────────────── */
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Permanently delete this ${type.slice(0, -1)}?`)) return;
    try {
      const r = await fetch(`${API_BASE}/api/admin/${type}/${id}`, { method: 'DELETE', headers: adminHeaders() });
      if (r.ok) {
        if (type === 'workers')   setWorkers(p   => p.filter(i => String(i.id) !== String(id)));
        if (type === 'companies') setCompanies(p => p.filter(i => String(i.id) !== String(id)));
        if (type === 'jobs')      setJobs(p      => p.filter(i => String(i.id) !== String(id)));
      }
    } catch {}
  };

  /* ── Ban / Unban toggle ─────────────────────────────────────────────────── */
  const handleStatusUpdate = async (type, id) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/suspend/${type}/${id}`, {
        method:  'PATCH',
        headers: adminHeaders(),
        body:    JSON.stringify({ message: null }),
      });
      if (r.ok) {
        const update = (list) => list.map(u => String(u.id) === String(id) ? { ...u, isBanned: !u.isBanned } : u);
        if (type === 'worker')  setWorkers(update);
        if (type === 'company') setCompanies(update);
      }
    } catch {}
  };

  const current = NAV.find(n => n.id === tab);

  return (
    <div className="min-h-screen flex bg-color text-main font-sans">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-60 glass border-r border-white/5 flex flex-col shrink-0 z-20">

        {/* Brand */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-main leading-none">
              Near<span className="text-indigo-400">Job</span>
            </h1>
            <p className="text-[9px] text-muted font-black uppercase tracking-widest mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] transition-all duration-200
                ${tab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-muted hover:text-main hover:bg-white/5'}`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${tab === item.id ? 'text-white' : 'text-indigo-400'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin user card + logout */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-black text-sm border border-indigo-500/20">
              {adminData?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-main text-sm truncate">{adminData?.name || 'Admin'}</p>
              <p className="text-[9px] text-muted font-bold uppercase tracking-wider truncate">
                {adminData?.adminType || 'admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-16 glass border-b border-white/5 flex items-center px-8 justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            {current && <current.icon className="w-5 h-5 text-indigo-400" />}
            <h2 className="text-lg font-black text-main">{current?.label}</h2>
          </div>
          <button
            onClick={loadAll}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-muted hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-20">
            {tab === 'users' && (
              <Users
                workers={workers}
                companies={companies}
                onDelete={handleDelete}
                onStatusUpdate={handleStatusUpdate}
                onRefresh={loadAll}
              />
            )}
            {tab === 'jobs' && (
              <Jobs jobs={jobs} onDelete={handleDelete} />
            )}
            {tab === 'admins' && (
              <Admins
                admins={admins}
                adminData={adminData}
                onRefresh={() => fetchData('admins', setAdmins)}
              />
            )}
            {tab === 'reports' && (
              <Reports
                reports={reports}
                onRefresh={() => fetchData('reports', setReports)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
