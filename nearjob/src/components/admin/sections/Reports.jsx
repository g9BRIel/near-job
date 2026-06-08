import React, { useState } from 'react';
import {
  CheckCircle, Clock, Eye, Flag,
  ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';

const API_BASE     = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const adminHeaders = () => {
  const t = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

export default function Reports({ reports, onRefresh }) {
  const [filter,    setFilter]    = useState('all');
  const [expanded,  setExpanded]  = useState(null);
  const [resolving, setResolving] = useState(null);

  const filtered = reports.filter(r => filter === 'all' || r.status === filter);

  const resolve = async (id) => {
    setResolving(id);
    try {
      await fetch(
        `${API_BASE}/api/admin/reports/${id}/status`,
        { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ status: 'resolved' }) }
      );
      onRefresh();
    } finally { setResolving(null); }
  };

  const statusBadge = (s) => {
    if (s === 'resolved') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'assigned') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const StatusIcon = ({ s }) => {
    if (s === 'resolved') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (s === 'assigned') return <Flag        className="w-4 h-4 text-indigo-400"  />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  /* filter pill counts */
  const counts = {
    all:      reports.length,
    pending:  reports.filter(r => r.status === 'pending').length,
    assigned: reports.filter(r => r.status === 'assigned').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Filter pills ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',      label: 'All',      color: 'bg-white/5 border-white/10 text-main' },
          { key: 'pending',  label: 'Pending',  color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
          { key: 'assigned', label: 'Assigned', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
          { key: 'resolved', label: 'Resolved', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${f.color}
              ${filter === f.key ? 'ring-2 ring-indigo-500/40 shadow-lg' : 'hover:opacity-80'}`}
          >
            {f.label} <span className="opacity-50 ml-1">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {/* ── Report table ─────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                {['Reporter', 'Subject / Title', 'Message', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filtered.map(r => {
                const isOpen = expanded === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors">

                      {/* Reporter */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/10">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-muted font-bold">
                            {r.reporterName || r.reporterId ? `#${String(r.reporterId).slice(-6)}` : 'Anonymous'}
                          </p>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <p className="font-black text-main max-w-[150px] truncate">{r.title || 'No title'}</p>
                      </td>

                      {/* Description preview */}
                      <td className="px-6 py-4">
                        <p className="text-muted font-medium max-w-[200px] truncate">
                          {r.description || r.message || '—'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${statusBadge(r.status)}`}>
                          <StatusIcon s={r.status} />
                          {r.status || 'pending'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-muted font-bold whitespace-nowrap">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {r.status !== 'resolved' && (
                            <button
                              onClick={() => resolve(r.id)}
                              disabled={resolving === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-50 transition-all"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {resolving === r.id ? '…' : 'Resolve'}
                            </button>
                          )}
                          {r.status === 'resolved' && (
                            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-black text-[9px] uppercase tracking-widest">
                              Done
                            </span>
                          )}
                          {/* Expand to read full message */}
                          <button
                            onClick={() => setExpanded(isOpen ? null : r.id)}
                            className="p-1.5 bg-white/5 text-muted hover:text-main rounded-lg transition-all border border-white/10"
                            title="Read full report"
                          >
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded: full report message ───────────────────── */}
                    {isOpen && (
                      <tr className="bg-white/[0.015]">
                        <td colSpan={6} className="px-8 py-5">
                          <div className="space-y-3">
                            <p className="text-[9px] text-muted font-black uppercase tracking-widest">Full Report</p>
                            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
                              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                {r.description || r.message || 'No description provided.'}
                              </p>
                            </div>
                            {r.notes && (
                              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-1">Admin Notes</p>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium">{r.notes}</p>
                              </div>
                            )}
                            <div className="flex gap-4 text-[10px] text-muted font-bold">
                              {r.reportedId     && <span>Reported user: <span className="text-main">#{String(r.reportedId).slice(-6)}</span></span>}
                              {r.reportedType   && <span>Type: <span className="text-main capitalize">{r.reportedType}</span></span>}
                              {r.priority       && <span>Priority: <span className="text-amber-400 capitalize">{r.priority}</span></span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <p className="text-muted text-[10px] font-black uppercase tracking-widest opacity-40">
              No reports in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
