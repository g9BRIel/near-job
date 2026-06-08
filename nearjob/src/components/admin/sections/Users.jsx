import React, { useState } from 'react';
import {
  Search, Trash2, AlertTriangle, Globe, MapPin,
  X, Ban, CheckCircle, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';

const API_BASE     = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const adminHeaders = () => {
  const t = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

export default function Users({ workers, companies, onDelete, onStatusUpdate, onRefresh }) {
  const [subTab,         setSubTab]         = useState('workers');
  const [search,         setSearch]         = useState('');

  /* Unban + message modal */
  const [unbanModal,     setUnbanModal]     = useState(null);  // { type, item }
  const [unbanMsg,       setUnbanMsg]       = useState('');
  const [unbanSending,   setUnbanSending]   = useState(false);

  /* Standalone "send warning" modal (for active users) */
  const [warnModal,      setWarnModal]      = useState(null);  // { type, item }
  const [warnMsg,        setWarnMsg]        = useState('');
  const [warnSending,    setWarnSending]    = useState(false);

  /* Expanded rows */
  const [expanded,       setExpanded]       = useState(null);

  const list     = subTab === 'workers' ? workers : companies;
  const filtered = list.filter(u =>
    (u.fullName || u.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  /* ── Ban (no message needed) ─────────────────────────────────────────── */
  const doBan = (type, item) => {
    onStatusUpdate(type, item.id);           // toggles isBanned on the state
  };

  /* ── Unban: open modal so admin can type a warning message ───────────── */
  const openUnban = (type, item) => {
    setUnbanModal({ type, item });
    setUnbanMsg('');
  };

  const submitUnban = async () => {
    if (!unbanModal) return;
    setUnbanSending(true);
    try {
      /* 1. Unban the user */
      await fetch(
        `${API_BASE}/api/admin/suspend/${unbanModal.type}/${unbanModal.item.id}`,
        { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ message: null }) }
      );
      /* 2. Send warning message if admin typed one */
      if (unbanMsg.trim()) {
        await fetch(
          `${API_BASE}/api/admin/pardon/${unbanModal.type}/${unbanModal.item.id}`,
          {
            method:  'POST',
            headers: adminHeaders(),
            body:    JSON.stringify({ message: unbanMsg.trim(), title: 'Warning Notice' }),
          }
        );
      }
      onRefresh();
      setUnbanModal(null);
    } finally {
      setUnbanSending(false);
    }
  };

  /* ── Warn an active user (not banned) ───────────────────────────────── */
  const openWarn = (type, item) => {
    setWarnModal({ type, item });
    setWarnMsg('');
  };

  const submitWarn = async () => {
    if (!warnModal || !warnMsg.trim()) return;
    setWarnSending(true);
    try {
      await fetch(
        `${API_BASE}/api/admin/pardon/${warnModal.type}/${warnModal.item.id}`,
        {
          method:  'POST',
          headers: adminHeaders(),
          body:    JSON.stringify({ message: warnMsg.trim(), title: 'Warning Notice' }),
        }
      );
      setWarnModal(null);
    } finally {
      setWarnSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Sub-tab + search ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5 gap-1">
          {[
            { key: 'workers',   label: `Workers (${workers.length})`   },
            { key: 'companies', label: `Companies (${companies.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setSubTab(t.key); setSearch(''); }}
              className={`px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all
                ${subTab === t.key ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main hover:bg-white/5'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-xs font-bold text-main outline-none focus:border-indigo-500 w-64 transition-all"
          />
        </div>
      </div>

      {/* ── User table ───────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                {['User', 'Email', 'Location', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(item => {
                const type    = subTab === 'workers' ? 'worker' : 'company';
                const name    = item.fullName || item.companyName || '?';
                const initial = name.charAt(0).toUpperCase();
                const isOpen  = expanded === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr className={`hover:bg-white/[0.02] transition-colors ${item.isBanned ? 'opacity-60' : ''}`}>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0
                            ${item.isBanned ? 'bg-rose-500/10 text-rose-400' : subTab === 'workers' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {initial}
                          </div>
                          <div>
                            <p className="font-black text-main">{name}</p>
                            {item.isBanned && (
                              <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Banned</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-muted font-bold truncate max-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 opacity-40 flex-shrink-0" />
                          {item.email || '—'}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-muted font-bold">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 opacity-40 flex-shrink-0" />
                          {item.location || '—'}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border
                          ${item.isBanned
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {item.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">

                          {item.isBanned ? (
                            /* UNBAN → opens modal to also type a warning message */
                            <button
                              onClick={() => openUnban(type, item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all hover:bg-emerald-500"
                              title="Unban user"
                            >
                              <CheckCircle className="w-3 h-3" /> Unban
                            </button>
                          ) : (
                            /* BAN */
                            <button
                              onClick={() => doBan(type, item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all"
                              title="Ban user"
                            >
                              <Ban className="w-3 h-3" /> Ban
                            </button>
                          )}

                          {/* Warn (active users only) */}
                          {!item.isBanned && (
                            <button
                              onClick={() => openWarn(type, item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all"
                              title="Send warning"
                            >
                              <MessageSquare className="w-3 h-3" /> Warn
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => onDelete(subTab, item.id)}
                            className="p-1.5 bg-white/5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all border border-white/10"
                            title="Delete account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Expand row */}
                          <button
                            onClick={() => setExpanded(isOpen ? null : item.id)}
                            className="p-1.5 bg-white/5 text-muted hover:text-main rounded-lg transition-all border border-white/10"
                          >
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isOpen && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan={5} className="px-8 py-5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                            {[
                              { label: 'ID',          value: item.id },
                              { label: 'Type',        value: subTab  },
                              { label: 'Industry',    value: item.industry || item.jobTitle || '—' },
                              { label: 'Registered',  value: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—' },
                            ].map(f => (
                              <div key={f.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-1">{f.label}</p>
                                <p className="text-main font-bold truncate">{f.value}</p>
                              </div>
                            ))}
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
          <div className="py-20 text-center text-muted text-[10px] font-black uppercase tracking-widest opacity-40">
            No users found
          </div>
        )}
      </div>


      {/* ════════════════════════════════════════════════════════════════════
          UNBAN MODAL  —  confirms unban + optional warning message
      ════════════════════════════════════════════════════════════════════ */}
      {unbanModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-black flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Unban User
              </h3>
              <button onClick={() => setUnbanModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-2">
              You're about to unban{' '}
              <span className="text-white font-black">
                {unbanModal.item.fullName || unbanModal.item.companyName}
              </span>.
            </p>
            <p className="text-slate-500 text-xs mb-5">
              Optionally write a warning message that will be sent to this user. Leave blank to unban silently.
            </p>

            <textarea
              value={unbanMsg}
              onChange={e => setUnbanMsg(e.target.value)}
              placeholder="Write your warning message here… (optional)"
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white text-sm outline-none focus:border-indigo-500 min-h-[110px] resize-none mb-5 transition-all placeholder-slate-600"
            />

            <div className="flex gap-3">
              <button
                onClick={submitUnban}
                disabled={unbanSending}
                className="flex-1 py-3.5 bg-emerald-600 text-white font-black rounded-xl text-sm uppercase tracking-widest shadow-lg hover:bg-emerald-500 disabled:opacity-50 transition-all"
              >
                {unbanSending ? 'Processing…' : unbanMsg.trim() ? 'Unban & Send Warning' : 'Unban'}
              </button>
              <button
                onClick={() => setUnbanModal(null)}
                className="px-6 bg-white/5 border border-white/10 text-slate-400 font-black rounded-xl text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════════════════════════════
          WARN MODAL  —  send warning to an active (not banned) user
      ════════════════════════════════════════════════════════════════════ */}
      {warnModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-black flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Send Warning
              </h3>
              <button onClick={() => setWarnModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-5">
              Write a warning message to{' '}
              <span className="text-white font-black">
                {warnModal.item.fullName || warnModal.item.companyName}
              </span>.
            </p>

            <textarea
              value={warnMsg}
              onChange={e => setWarnMsg(e.target.value)}
              placeholder="Write a clear warning message explaining the issue…"
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white text-sm outline-none focus:border-amber-500 min-h-[110px] resize-none mb-5 transition-all placeholder-slate-600"
            />

            <div className="flex gap-3">
              <button
                onClick={submitWarn}
                disabled={warnSending || !warnMsg.trim()}
                className="flex-1 py-3.5 bg-amber-500 text-white font-black rounded-xl text-sm uppercase tracking-widest shadow-lg hover:bg-amber-400 disabled:opacity-50 transition-all"
              >
                {warnSending ? 'Sending…' : 'Send Warning'}
              </button>
              <button
                onClick={() => setWarnModal(null)}
                className="px-6 bg-white/5 border border-white/10 text-slate-400 font-black rounded-xl text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
