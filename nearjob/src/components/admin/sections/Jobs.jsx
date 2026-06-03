import React, { useState } from 'react';
import { Search, Trash2, Briefcase, MapPin, DollarSign, Clock, Building2, LayoutGrid, List } from 'lucide-react';

export default function Jobs({ jobs, onDelete }) {
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const statuses = ['all', 'open', 'closed', 'pending'];
  const filtered = jobs.filter(j => {
    const matchSearch = (j.title || '').toLowerCase().includes(search.toLowerCase()) || (j.companyName || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (j.status || 'open') === filter;
    return matchSearch && matchFilter;
  });

  const statusColor = (s) => s === 'open' ? 'bg-emerald-100 text-emerald-600' : s === 'closed' ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap bg-white/5 p-1 rounded-2xl border border-white/5">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main'}`}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter postings..." className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-xs font-bold text-main outline-none focus:border-indigo-500 w-64 transition-all" />
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(job => (
            <div key={job.id} className="glass rounded-2xl p-6 border border-white/5 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/10"><Briefcase className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-black text-main text-sm leading-tight truncate max-w-[120px]">{job.title}</h4>
                    <p className="text-[10px] text-muted font-bold flex items-center gap-1 mt-1"><Building2 className="w-2.5 h-2.5" /> {job.companyName || 'Unknown'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-white/5 text-muted border-white/5'}`}>{job.status || 'open'}</span>
              </div>
              <div className="space-y-2 mb-6 text-[10px] text-muted font-bold">
                 <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-50" /> {job.location || 'Remote'}</div>
                 <div className="flex items-center gap-2 text-indigo-400"><DollarSign className="w-3.5 h-3.5 opacity-50" /> {job.salary || 'Unspecified'}</div>
                 <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 opacity-50" /> {new Date(job.createdAt).toLocaleDateString()}</div>
              </div>
              <button onClick={() => onDelete('jobs', job.id)} className="w-full py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                Terminate Exposure
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>{['Post Title', 'Employer', 'Coordinate', 'Compensation', 'Status', 'Protocol'].map(h => <th key={h} className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-muted">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(job => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4"><p className="font-black text-main">{job.title}</p><p className="text-[9px] text-muted uppercase mt-0.5">ID_{typeof job.id === 'string' ? job.id.slice(-6) : job.id}</p></td>
                    <td className="px-6 py-4 text-muted font-bold">{job.companyName || '—'}</td>
                    <td className="px-6 py-4 text-muted font-bold">{job.location || '—'}</td>
                    <td className="px-6 py-4 text-indigo-400 font-black">{job.salary || '—'}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-white/5 text-muted border-white/5'}`}>{job.status || 'open'}</span></td>
                    <td className="px-6 py-4"><button onClick={() => onDelete('jobs', job.id)} className="p-1.5 bg-white/5 text-muted rounded-lg hover:text-rose-500 transition-all border border-white/10"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-20 text-center text-muted italic font-medium opacity-40 uppercase tracking-widest text-[10px]">No records in database</div>}
        </div>
      )}

    </div>
  );
}
