import React from 'react';
import { BarChart3, TrendingUp, Zap, ArrowUpRight, ArrowDownRight, MapPin } from 'lucide-react';

export default function Analytics({ stats, workers = [], companies = [] }) {
  const growthData = [
    { label: 'Weekly Active', val: stats?.newUsersLastWeek || '0', trend: 'up', color: 'text-emerald-500' },
    { label: 'Worker Saturation', val: Math.round((workers.length / (workers.length + companies.length || 1)) * 100) + '%', trend: 'up', color: 'text-indigo-500' },
    { label: 'Platform Trust', val: Math.round((workers.filter(w => w.isVerified).length / (workers.length || 1)) * 100) + '%', trend: 'down', color: 'text-rose-500' },
    { label: 'Company Reach', val: companies.length || '0', trend: 'up', color: 'text-emerald-500' },
  ];

  // Group by city
  const cityCounts = workers.reduce((acc, w) => { 
    const c = w.city || w.location?.split(',')[0] || 'Unknown';
    acc[c] = (acc[c] || 0) + 1; 
    return acc; 
  }, {});
  const cityData = Object.entries(cityCounts).map(([city, count]) => ({
    city,
    share: Math.round((count / workers.length) * 100) + '%',
    workers: count
  })).sort((a,b) => b.workers - a.workers).slice(0, 5);


  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {growthData.map((d, i) => (
           <div key={i} className="glass rounded-2xl p-6 border border-white/5 shadow-sm hover:translate-y-[-4px] transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BarChart3 className="w-16 h-16 text-main" />
             </div>
             <div className="flex justify-between items-start mb-3">
                <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">{d.label}</p>
                {d.trend === 'up' ? <ArrowUpRight className={`w-3.5 h-3.5 ${d.color}`} /> : <ArrowDownRight className={`w-3.5 h-3.5 ${d.color}`} />}
             </div>
             <p className="text-2xl font-black text-main tracking-tight">{d.val}</p>
             <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]`} style={{ width: d.val.replace('%', '') + '%' }} />
             </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-8 border border-white/5 shadow-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-10 z-10 relative">
              <h3 className="text-sm font-black text-main uppercase tracking-[0.2em] flex items-center gap-3">
                 <TrendingUp className="w-4 h-4 text-indigo-500" /> Platform_Clearance_Growth
              </h3>
              <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-muted outline-none uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-all">
                 <option>Sector_30_Days</option>
                 <option>Sector_6_Months</option>
                 <option>Total_Uptime</option>
              </select>
           </div>
           
           <div className="h-64 flex items-end justify-between gap-4 px-2 relative z-10">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center">
                   <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all bg-indigo-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-lg tracking-widest">
                      LOG_{i+1}: +{20 + Math.floor(Math.random()*30)}%
                   </div>
                   <div className="w-full bg-white/5 border border-white/10 rounded-t-lg group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all cursor-crosshair relative overflow-hidden" style={{ height: `${30 + Math.random()*70}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <p className="text-[8px] font-black text-muted/30 uppercase mt-4">Node_{i+1}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-900/40 relative overflow-hidden group border border-white/10">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 border border-white/10">
                    <Zap className="w-5 h-5 text-white" />
                 </div>
                 <h3 className="text-xl font-black tracking-tight leading-tight mb-2 uppercase tracking-widest">Net_Liquidity</h3>
                 <p className="text-3xl font-black mb-8 leading-none tracking-tighter">$12,450.00</p>
                 <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all">Audit Ledger</button>
              </div>
           </div>

           <div className="glass rounded-2xl p-8 border border-white/5 shadow-sm">
              <h4 className="text-[10px] font-black text-main uppercase tracking-widest mb-6 flex items-center gap-2">
                 <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Sector Reach
              </h4>
              <div className="space-y-5">
                 {cityData.length > 0 ? cityData.map((c, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em]">
                         <span className="text-muted">{c.city}</span>
                         <span className="text-indigo-400">{c.share}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-indigo-500/80 rounded-full" style={{ width: c.share }} />
                      </div>
                   </div>
                 )) : (
                   <div className="py-4 text-center text-muted italic text-[10px] font-black uppercase opacity-30">No Geodata Found</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

