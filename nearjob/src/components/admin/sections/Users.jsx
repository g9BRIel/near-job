import React, { useState } from 'react';
import { Search, Trash2, AlertTriangle, LayoutGrid, List, Globe, MapPin, X } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const adminHeaders = () => { const t = localStorage.getItem('admin_token'); return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }; };

export default function Users({ workers, companies, onDelete, onStatusUpdate, onRefresh }) {
  const [subTab, setSubTab] = useState('workers');
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [warningModal, setWarningModal] = useState(null);
  const [warningMsg, setWarningMsg] = useState('');
  const [warningSending, setWarningSending] = useState(false);

  const list = subTab === 'workers' ? workers : companies;
  const filtered = list.filter(u => (u.fullName || u.companyName || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()));

  const submitWarning = async () => {
    if (!warningMsg.trim()) return;
    setWarningSending(true);
    try {
      await fetch(`${API_BASE}/api/admin/pardon/${warningModal.type}/${warningModal.item.id}`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ message: warningMsg, title: 'Official Warning' }) });
      setWarningModal(null); onRefresh();
    } finally { setWarningSending(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Sub-tabs + controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5 gap-1">
          {[{ key: 'workers', label: `Workers (${workers.length})` }, { key: 'companies', label: `Companies (${companies.length})` }].map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)} className={`px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${subTab === t.key ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main hover:bg-white/5'}`}>{t.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter directory..." className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-xs font-bold text-main outline-none focus:border-indigo-500 w-64 transition-all" />
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="glass rounded-2xl p-6 border border-white/5 shadow-sm hover:translate-y-[-4px] transition-all relative overflow-hidden group">
              {item.isBanned && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse" />}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner border border-white/5 ${subTab === 'workers' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>{(item.fullName || item.companyName || '?').charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-main text-sm leading-tight truncate">{item.fullName || item.companyName}</h4>
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">ID_{typeof item.id === 'string' ? item.id.slice(-6) : item.id}</p>
                </div>
              </div>
              <div className="space-y-2 mb-5 text-[11px]">
                <div className="flex items-center gap-2 text-muted font-bold truncate"><Globe className="w-3.5 h-3.5" /> {item.email || '—'}</div>
                <div className="flex items-center gap-2 text-muted font-bold truncate"><MapPin className="w-3.5 h-3.5" /> {item.location || '—'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onStatusUpdate(subTab === 'workers' ? 'worker' : 'company', item.id, item.isBanned)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${item.isBanned ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'}`}>
                  {item.isBanned ? 'Unban' : 'Ban'}
                </button>
                <button onClick={() => { setWarningModal({ type: subTab === 'workers' ? 'worker' : 'company', item }); setWarningMsg(''); }} className="flex-1 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                  Warn
                </button>
                <button onClick={() => onDelete(subTab === 'workers' ? 'workers' : 'companies', item.id)} className="p-3 bg-white/5 text-muted rounded-xl hover:bg-rose-500/20 hover:text-rose-500 transition-all border border-white/5"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>{['Identity', 'Connection', 'Location', 'Clearance', 'Protocol'].map(h => <th key={h} className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-muted">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${subTab === 'workers' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>{(item.fullName || item.companyName || '?').charAt(0)}</div>
                        <div><p className="font-black text-main">{item.fullName || item.companyName}</p><p className="text-[9px] text-muted font-black uppercase">ID_{typeof item.id === 'string' ? item.id.slice(-6) : item.id}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted font-bold truncate max-w-[150px]">{item.email || '—'}</td>
                    <td className="px-6 py-4 text-muted font-bold">{item.location || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${item.isBanned ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>{item.isBanned ? 'Restricted' : 'Cleared'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onStatusUpdate(subTab === 'workers' ? 'worker' : 'company', item.id, item.isBanned)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${item.isBanned ? 'bg-emerald-600 text-white' : 'bg-white/5 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20'}`}>
                           {item.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button onClick={() => { setWarningModal({ type: subTab === 'workers' ? 'worker' : 'company', item }); setWarningMsg(''); }} className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20">
                          Warn
                        </button>
                        <button onClick={() => onDelete(subTab === 'workers' ? 'workers' : 'companies', item.id)} className="p-1.5 bg-white/5 text-muted hover:text-rose-500 hover:bg-rose-500/20 rounded-lg transition-all border border-white/10"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-20 text-center text-muted italic font-medium opacity-40 uppercase tracking-widest text-[10px]">No matches in sector</div>}
        </div>
      )}


      {/* Warning Modal */}
      {warningModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3"><AlertTriangle className="w-6 h-6 text-amber-500" /> Issue Warning</h3>
              <button onClick={() => setWarningModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-slate-500 mb-6 font-medium">Send an official warning message to <span className="font-black text-slate-800">{warningModal.item.fullName || warningModal.item.companyName}</span>.</p>
            <textarea value={warningMsg} onChange={e => setWarningMsg(e.target.value)} placeholder="Write a professional warning message detailing the issue..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium text-black outline-none focus:border-amber-400 min-h-[120px] resize-none mb-6 transition-all" />
            <div className="flex gap-3">
              <button onClick={submitWarning} disabled={warningSending || !warningMsg.trim()} className="flex-1 py-4 bg-amber-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-amber-200 disabled:opacity-50 transition-all">{warningSending ? 'Sending...' : 'Send Warning'}</button>
              <button onClick={() => setWarningModal(null)} className="px-8 bg-slate-100 text-slate-500 font-black rounded-2xl text-sm uppercase tracking-widest transition-all hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
