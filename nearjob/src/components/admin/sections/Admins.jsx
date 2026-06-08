import React, { useState } from 'react';
import { Search, ShieldCheck, UserPlus, X, Power } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const adminHeaders = () => { 
  const t = localStorage.getItem('admin_token'); 
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }; 
};

export default function Admins({ admins, onRefresh, adminData }) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', adminType: 'admin' });
  const [loading, setLoading] = useState(false);

  if (!adminData?.isSuperAdmin) {
    return (
      <div className="glass rounded-2xl p-10 border border-white/5 shadow-xl text-center">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-black text-main">Access Denied</h3>
        <p className="text-muted mt-2">Only Super Admins can manage the administrative council.</p>
      </div>
    );
  }

  const filtered = (admins || []).filter(a => 
    (a.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/admins/${id}`, { method: 'PATCH', headers: adminHeaders() });
      if (r.ok) onRefresh();
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/admins`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(newAdmin)
      });
      if (r.ok) {
        setShowAddModal(false);
        setNewAdmin({ name: '', email: '', password: '', adminType: 'admin' });
        onRefresh();
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
           <button className="px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all bg-indigo-600 text-white shadow-lg">
             Council ({admins?.length || 0})
           </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)} 
              placeholder="Filter council..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-xs font-bold text-main outline-none focus:border-indigo-500 w-64 transition-all" 
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition"
          >
            <UserPlus className="w-4 h-4" /> Add Admin
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                {['Official', 'Contact', 'Type', 'Status', 'Protocol'].map(h => (
                  <th key={h} className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(admin => (
                <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-indigo-500/10 text-indigo-400">
                        {(admin.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-main">{admin.name}</p>
                        <p className="text-[9px] text-muted font-black uppercase">ID_{String(admin.id).slice(-4)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted font-bold truncate">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${admin.isSuperAdmin ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                      {admin.isSuperAdmin ? 'Superadmin' : admin.adminType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${admin.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                      {admin.isActive ? 'Active' : 'Dormant'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleToggleStatus(admin.id)}
                         disabled={admin.id === adminData.id}
                         className="p-1.5 bg-white/5 text-muted rounded-lg hover:text-indigo-400 transition-all border border-white/10 disabled:opacity-30 disabled:hover:text-muted"
                       >
                         <Power className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-20 text-center text-muted italic font-medium opacity-40 uppercase tracking-widest text-[10px]">No members found</div>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-indigo-600" /> New Administrator</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                <input required value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Initial Password</label>
                <input required type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Role / Type</label>
                <select value={newAdmin.adminType} onChange={e => setNewAdmin({...newAdmin, adminType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner">
                  <option value="admin">Standard Admin (Council)</option>
                  <option value="moderator">Moderator</option>
                  <option value="support">Support Agent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all">{loading ? 'Creating...' : 'Create Member'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
