import React, { useState, useEffect, useCallback } from 'react';
import { Crown, LogOut, Users as UsersIcon, Briefcase, ShieldAlert, ShieldCheck, RefreshCw, BarChart3, Activity, List as ListIcon, Grid, CreditCard, MessageSquare, Bell } from 'lucide-react';

import Users from './sections/Users';
import Jobs from './sections/Jobs';
import Reports from './sections/Reports';
import Admins from './sections/Admins';
import Overview from './sections/Overview';
import Analytics from './sections/Analytics';
import Verification from './sections/Verification';
import Settings from './sections/Settings';
import Applications from './sections/Applications';
import Categories from './sections/Categories';
import Payments from './sections/Payments';
import Support from './sections/Support';
import Notifications from './sections/Notifications';
import { normalizeJob } from '../../utils/api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const adminHeaders = () => { const t = localStorage.getItem('admin_token'); return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }; };

const NAV = [
  { id: 'overview',      icon: Activity,      label: 'Platform Overview' },
  { id: 'analytics',     icon: BarChart3,     label: 'Data Insights' },
  { id: 'users',         icon: UsersIcon,     label: 'Manage Users' },
  { id: 'jobs',          icon: Briefcase,     label: 'Manage Jobs' },
  { id: 'applications',  icon: ListIcon,      label: 'Applications' },
  { id: 'verification',  icon: ShieldCheck,   label: 'Verification' },
  { id: 'categories',    icon: Grid,          label: 'Categories' },
  { id: 'reports',       icon: ShieldAlert,   label: 'Manage Reports'},
  { id: 'payments',      icon: CreditCard,    label: 'Settlements' },
  { id: 'support',       icon: MessageSquare, label: 'Support Center' },
  { id: 'broadcasts',    icon: Bell,          label: 'Broadcasts' },
  { id: 'settings',      icon: RefreshCw,     label: 'Platform Settings' },
  { id: 'admins',        icon: Crown,         label: 'Manage Admins' }
];

export default function AdminDashboard({ adminData, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [workers, setWorkers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWithSet = useCallback(async (endpoint, setter, transform) => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/${endpoint}`, { headers: adminHeaders() });
      if (r.ok) { const d = await r.json(); setter(transform ? transform(d) : d); }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchWithSet('workers', setWorkers);
    fetchWithSet('companies', setCompanies);
    fetchWithSet('jobs', setJobs, d => d.map(normalizeJob).filter(Boolean));
    fetchWithSet('reports', setReports);
    fetchWithSet('stats', setStats);
    fetchWithSet('logs', setLogs);
    fetchWithSet('applications', setApplications);
    fetchWithSet('categories', setCategories);
    fetchWithSet('transactions', setTransactions);
    fetchWithSet('support', setSupportTickets);
    fetchWithSet('broadcasts', setBroadcasts);
    if (adminData?.adminType === 'superadmin') {
      fetchWithSet('admins', setAdmins);
    }
  }, [fetchWithSet, adminData]);

  const reload = useCallback(() => {
    fetchWithSet('workers', setWorkers);
    fetchWithSet('companies', setCompanies);
    fetchWithSet('jobs', setJobs, d => d.map(normalizeJob).filter(Boolean));
    fetchWithSet('reports', setReports);
    fetchWithSet('stats', setStats);
    fetchWithSet('logs', setLogs);
    fetchWithSet('applications', setApplications);
    fetchWithSet('categories', setCategories);
    fetchWithSet('transactions', setTransactions);
    fetchWithSet('support', setSupportTickets);
    fetchWithSet('broadcasts', setBroadcasts);
    if (adminData?.adminType === 'superadmin') {
      fetchWithSet('admins', setAdmins);
    }
  }, [fetchWithSet, adminData]);

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Permanently delete this ${type.slice(0,-1)}?`)) return;
    try {
      const r = await fetch(`${API_BASE}/api/admin/${type}/${id}`, { method: 'DELETE', headers: adminHeaders() });
      if (r.ok) {
        if (type === 'workers') setWorkers(p => p.filter(i => String(i.id) !== String(id)));
        if (type === 'companies') setCompanies(p => p.filter(i => String(i.id) !== String(id)));
        if (type === 'jobs') setJobs(p => p.filter(i => String(i.id) !== String(id)));
      }
    } catch {}
  };

  const handleStatusUpdate = async (type, id, isBanned) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/suspend/${type}/${id}`, { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ message: null }) });
      if (r.ok) {
        const update = p => p.map(u => String(u.id) === String(id) ? { ...u, isBanned: !u.isBanned } : u);
        if (type === 'worker') setWorkers(update);
        if (type === 'company') setCompanies(update);
      }
    } catch {}
  };

  const current = NAV.find(n => n.id === tab);

  return (
    <div className="min-h-screen flex bg-color text-main font-sans">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-slate-200/10 flex flex-col shrink-0 shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><Crown className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-main">Near<span className="text-indigo-500">Hub</span></h1>
            <p className="text-[9px] text-muted font-black uppercase tracking-widest mt-1">Admin Chamber</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-300 ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' : 'text-muted hover:text-main hover:bg-white/5'}`}>
              <item.icon className={`w-4 h-4 flex-shrink-0 ${tab === item.id ? 'text-white' : 'text-indigo-400'}`} />
              <span>{item.label}</span>
              {tab === item.id && <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-4 border border-white/5">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-black border border-indigo-500/30">{adminData.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className="font-black text-main text-sm truncate">{adminData.name}</p><p className="text-[10px] text-muted font-bold uppercase tracking-wider truncate">{adminData.adminType || 'Council'}</p></div>
          </div>
          <button onClick={onLogout} className="w-full py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2">
            <LogOut className="w-3.5 h-3.5" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -z-10 pointer-events-none" />
        
        <header className="h-20 glass border-b border-white/5 flex items-center px-8 justify-between flex-shrink-0 z-10">
          <div>
            <h2 className="text-xl font-black text-main tracking-tight flex items-center gap-2">
              {current && <current.icon className="w-5 h-5 text-indigo-500" />} {current?.label}
            </h2>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-0.5">Control Center ➔ {current?.label}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest shadow-sm">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Environment
            </div>
            <button onClick={reload} className="p-3 bg-white/5 border border-white/10 rounded-xl text-muted hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {tab === 'overview'      && <Overview stats={stats} logs={logs} onRefresh={reload} loading={loading} adminData={adminData} />}
            {tab === 'analytics'     && <Analytics stats={stats} workers={workers} companies={companies} />}
            {tab === 'users'         && <Users workers={workers} companies={companies} onDelete={handleDelete} onStatusUpdate={handleStatusUpdate} onRefresh={reload} />}
            {tab === 'jobs'          && <Jobs jobs={jobs} onDelete={handleDelete} />}
            {tab === 'applications'  && <Applications applications={applications} onRefresh={reload} />}
            {tab === 'verification'  && <Verification workers={workers} companies={companies} onRefresh={reload} />}
            {tab === 'categories'    && <Categories categories={categories} onRefresh={reload} />}
            {tab === 'reports'       && <Reports reports={reports} onRefresh={() => fetchWithSet('reports', setReports)} />}
            {tab === 'payments'      && <Payments transactions={transactions} />}
            {tab === 'support'       && <Support tickets={supportTickets} onRefresh={reload} />}
            {tab === 'broadcasts'    && <Notifications broadcasts={broadcasts} onRefresh={reload} />}
            {tab === 'settings'      && <Settings />}
            {tab === 'admins'        && <Admins admins={admins} onRefresh={() => fetchWithSet('admins', setAdmins)} adminData={adminData} />}
          </div>
        </div>
      </main>
    </div>
  );
}

