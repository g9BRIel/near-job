import React, { useState } from 'react';
import { Search, Briefcase, User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function Applications({ applications, onUpdateStatus }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = applications.filter(app => {
    const matchSearch = (app.worker?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                       (app.job?.title || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || app.status === filter;
    return matchSearch && matchFilter;
  });

  const statusCls = (st) => st === 'accepted'
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    : st === 'rejected'
    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    : 'bg-amber-500/10 text-amber-500 border-amber-500/20';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/5 gap-1">
          {['all', 'pending', 'accepted', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${filter === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main'}`}
            >
              {s === 'all' ? 'Network_Global' : s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Protocol_Filter..."
            className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-xs font-bold text-main outline-none focus:border-indigo-500 w-64 transition-all"
          />
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[800px] border-collapse">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              {['Identity', 'Deployment', 'Timestamp', 'Payload', 'State', 'Controls'].map(h => (
                <th key={h} className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[8px] text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(app => {
              const st = app.status || 'pending';
              return (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-indigo-400 font-bold overflow-hidden border border-white/10">
                        {app.worker?.avatar
                          ? <img src={app.worker.avatar} alt="" className="w-full h-full object-cover" />
                          : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-black text-main text-xs">{app.worker?.fullName || 'Anonymous'}</p>
                        <p className="text-[8px] text-muted font-black uppercase tracking-widest truncate max-w-[150px] opacity-40">{app.worker?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400 opacity-50" />
                      <div>
                        <p className="font-black text-main text-xs uppercase tracking-tight">{app.job?.title || 'Unknown Job'}</p>
                        <p className="text-[8px] text-muted font-black uppercase opacity-30">HEX_{typeof app.jobId === 'string' ? app.jobId.slice(-6).toUpperCase() : app.jobId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted font-black text-[9px] whitespace-nowrap uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 opacity-30" />
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-muted font-medium line-clamp-1 max-w-[180px] text-[10px] italic opacity-60">
                      "{app.coverLetter || 'No payload data identified.'}"
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusCls(st)}`}>
                      {st}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white/5 text-muted rounded-lg hover:text-indigo-400 border border-white/10 transition-all opacity-0 group-hover:opacity-100">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {st === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => onUpdateStatus(app.id, 'accepted')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onUpdateStatus(app.id, 'rejected')} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted font-black text-[10px] uppercase tracking-widest opacity-20">
            Buffer_Empty: No applications identified matching the current protocol search.
          </div>
        )}
      </div>
    </div>
  );
}
