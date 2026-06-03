import React from 'react';
import { Users, Building2, Briefcase, MessageSquare, Activity, ShieldAlert, RefreshCw, TrendingUp } from 'lucide-react';

export default function Overview({ stats, logs, onRefresh, loading, adminData }) {
  const statCards = [
    { label: 'Total Workers',   val: stats?.workers       ?? '—', icon: Users,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  glow: 'shadow-indigo-500/10' },
    { label: 'Companies',      val: stats?.companies      ?? '—', icon: Building2,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    glow: 'shadow-rose-500/10'   },
    { label: 'Active Jobs',    val: stats?.jobs           ?? '—', icon: Briefcase,     color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10'},
    { label: 'Conversations',  val: stats?.conversations  ?? '—', icon: MessageSquare, color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  glow: 'shadow-violet-500/10' },
    { label: 'Messages Sent',  val: stats?.messages       ?? '—', icon: Activity,      color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     glow: 'shadow-sky-500/10'    },
    { label: 'Active Admins',  val: stats?.activeAdmins   ?? '—', icon: ShieldAlert,   color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   glow: 'shadow-amber-500/10'  },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white flex items-center justify-between shadow-xl shadow-indigo-500/10 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-2">Admin Control Center</p>
          <h2 className="text-xl font-black tracking-tight">Council Session: {adminData?.name}</h2>
          <p className="text-indigo-200 text-xs mt-1 font-bold uppercase tracking-widest opacity-80">Operational Status: All Systems Optimal</p>
        </div>
        <button
          onClick={onRefresh}
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 transition rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Engine
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((s, i) => (
          <div key={i} className={`glass border border-white/5 rounded-2xl p-6 shadow-sm hover:translate-y-[-4px] transition-all duration-300 group hover:shadow-lg hover:${s.glow}`}>
            <div className="flex items-center justify-between mb-5">
              <div className={`w-11 h-11 ${s.bg} ${s.color} rounded-xl flex items-center justify-center border ${s.border} group-hover:scale-110 transition-transform`}>
                <s.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-muted opacity-30 group-hover:opacity-60 transition-opacity" />
            </div>
            <p className="text-3xl font-black text-main tracking-tighter">{s.val === '—' ? '0' : s.val?.toLocaleString?.() ?? s.val}</p>
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mt-1.5">{s.label}</p>
            <div className="mt-4 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${s.bg.replace('/10', '/60')} rounded-full w-3/4 group-hover:w-full transition-all duration-700`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Log */}
      <div className="glass rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-indigo-500" /> Platform_Heartbeat.log
          </h3>
          <span className="text-[9px] font-black text-muted uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live_Stream
          </span>
        </div>
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
          {logs.length > 0 ? logs.slice(0, 15).map(log => (
            <div key={log.id} className="px-8 py-4 flex items-center gap-5 hover:bg-white/[0.03] transition-colors group">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black text-xs flex-shrink-0 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                {log.adminName?.charAt(0) || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-main text-sm truncate">
                  <span className="text-indigo-400 font-black">{log.adminName}</span>
                  <span className="opacity-40 mx-2">➔</span>
                  {log.action?.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-muted mt-0.5 font-bold uppercase tracking-wider">{log.details}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-black text-main font-mono">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          )) : (
            <div className="px-8 py-16 text-center text-muted italic font-medium opacity-40">No activity recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
