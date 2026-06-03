import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, Eye, Flag, X } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const adminHeaders = () => { const t = localStorage.getItem('admin_token'); return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }; };

const priorityStyle = (p) => p === 'critical' ? 'bg-rose-100 text-rose-600 border-rose-200' : p === 'high' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-500 border-slate-200';
const statusIcon = (s) => s === 'resolved' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : s === 'assigned' ? <Flag className="w-5 h-5 text-indigo-500" /> : <Clock className="w-5 h-5 text-amber-500" />;

export default function Reports({ reports, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [resolving, setResolving] = useState(null);

  const filtered = reports.filter(r => filter === 'all' || r.status === filter);

  const resolve = async (id) => {
    setResolving(id);
    try {
      await fetch(`${API_BASE}/api/admin/reports/${id}/status`, { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ status: 'resolved' }) });
      onRefresh();
    } finally { setResolving(null); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats row */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Network_All', key: 'all', count: reports.length, style: 'bg-white/5 border-white/10 text-main' },
          { label: 'Buffer_Pending', key: 'pending', count: reports.filter(r => r.status === 'pending').length, style: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
          { label: 'Assigned_Node', key: 'assigned', count: reports.filter(r => r.status === 'assigned').length, style: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
          { label: 'Stabilized', key: 'resolved', count: reports.filter(r => r.status === 'resolved').length, style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${f.style} ${filter === f.key ? 'ring-2 ring-indigo-500/50 shadow-lg' : 'hover:opacity-80'}`}>
            {f.label} <span className="opacity-40">[{f.count}]</span>
          </button>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(r => (
          <div key={r.id} className="glass rounded-2xl border border-white/5 shadow-sm hover:translate-y-[-4px] transition-all overflow-hidden relative group">
            <div className={`h-1 w-full absolute top-0 left-0 ${r.priority === 'critical' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : r.priority === 'high' ? 'bg-orange-500' : 'bg-muted/20'}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${priorityStyle(r.priority).replace('bg-rose-100', 'bg-rose-500/10').replace('text-rose-600', 'text-rose-500').replace('border-rose-200', 'border-rose-500/20').replace('bg-orange-100', 'bg-orange-500/10').replace('text-orange-600', 'text-orange-500').replace('border-orange-200', 'border-orange-500/20').replace('bg-slate-100', 'bg-white/5').replace('text-slate-500', 'text-muted').replace('border-slate-200', 'border-white/10')}`}>{r.priority || 'normal'}</span>
                  <span className="text-[8px] font-black text-muted uppercase tracking-widest opacity-40">SIG_{typeof r.id === 'string' ? r.id.slice(-6).toUpperCase() : r.id}</span>
                </div>
                <div className="opacity-70">{statusIcon(r.status)}</div>
              </div>
              <h4 className="font-black text-main text-lg mb-2 leading-tight tracking-tight uppercase">{r.title}</h4>
              <p className="text-muted font-bold text-[10px] uppercase leading-relaxed mb-6 line-clamp-2 opacity-50 tracking-wider font-mono">{r.description || 'No description provided.'}</p>
              
              <div className="flex items-center gap-2 text-[9px] text-muted font-black uppercase tracking-[0.15em] mb-6 border-b border-white/5 pb-4">
                <Clock className="w-3 h-3 text-indigo-400" /> {new Date(r.createdAt).toLocaleString()}
                {r.reporterId && <><span className="mx-2 opacity-20">•</span> Node_{typeof r.reporterId === 'string' ? r.reporterId.slice(-4).toUpperCase() : r.reporterId}</>}
              </div>

              <div className="flex gap-2">
                {r.status !== 'resolved' && (
                  <button onClick={() => resolve(r.id)} disabled={resolving === r.id} className="flex-1 py-3 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border border-white/10">
                    {resolving === r.id ? 'STABILIZING...' : 'Authorize_Resolution'}
                  </button>
                )}
                {r.status === 'resolved' && (
                  <div className="flex-1 py-3 bg-white/5 text-emerald-500 font-black rounded-xl text-[10px] uppercase tracking-widest text-center border border-emerald-500/20">Stabilized</div>
                )}
                <button onClick={() => setSelected(selected?.id === r.id ? null : r)} className="px-4 py-3 bg-white/5 text-muted rounded-xl hover:text-indigo-400 border border-white/10 transition-all"><Eye className="w-4 h-4" /></button>
              </div>

              {/* Detail Expand */}
              {selected?.id === r.id && (
                <div className="mt-5 pt-5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4 text-[9px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-3"><span className="text-muted w-20">Protocol_State</span><span className="text-main capitalize">{r.status}</span></div>
                    <div className="flex items-center gap-3"><span className="text-muted w-20">Node_Assignee</span><span className="text-main">{r.assignedToType || 'None'}</span></div>
                    {r.notes && <div className="flex items-start gap-3"><span className="text-muted w-20 pt-0.5">Core_Notes</span><span className="text-main lowercase tracking-normal font-medium">{r.notes}</span></div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center glass rounded-2xl border border-white/5 shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
             <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-main uppercase tracking-widest leading-none mb-2">Network: Stabilized</h3>
          <p className="text-muted font-bold text-[10px] uppercase tracking-widest opacity-40">No unresolved anomaly signals in the current buffer sector.</p>
        </div>
      )}
    </div>
  );
}

