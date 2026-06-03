import React, { useState } from 'react';
import { CreditCard, DollarSign, Download, ArrowUpRight, ArrowDownRight, Filter, Wallet, PieChart, Activity } from 'lucide-react';

export default function Payments({ transactions = [] }) {
  // Real data passed from parent dashboard logic


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/10 col-span-1 lg:col-span-2 flex flex-col justify-between overflow-hidden relative group border border-white/10">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all">
               <Wallet className="w-40 h-40 rotate-12" />
            </div>
            <div className="relative z-10">
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">Platform Treasury Engine</p>
               <h3 className="text-4xl font-black tracking-tighter mb-4">$42,890.50</h3>
               <div className="flex items-center gap-4 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/5"><ArrowUpRight className="w-3.5 h-3.5" /> +12.5%</span>
                  <span className="text-white/40">Market Delta</span>
               </div>
            </div>
            <div className="relative z-10 flex gap-3 mt-10">
               <button className="flex-1 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 border border-white">Release Payouts</button>
               <button className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Audit Report</button>
            </div>
         </div>

         <div className="glass rounded-2xl p-8 border border-white/5 shadow-sm flex flex-col justify-between">
            <div>
               <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-6">Queue Registry</p>
               <div className="space-y-5">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center font-bold border border-amber-500/10">W</div>
                        <div><p className="font-black text-main text-xs">Withdrawals</p><p className="text-[9px] text-muted font-bold uppercase tracking-wider">2 requests</p></div>
                     </div>
                     <p className="font-black text-main text-sm">$1,200</p>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold border border-indigo-500/10">R</div>
                        <div><p className="font-black text-main text-xs">Refunds</p><p className="text-[9px] text-muted font-bold uppercase tracking-wider">0 requests</p></div>
                     </div>
                     <p className="font-black text-main text-sm">$0</p>
                  </div>
               </div>
            </div>
            <button className="w-full py-3 bg-white/5 border border-white/10 text-main rounded-xl font-black text-[9px] uppercase tracking-[0.2em] mt-8 hover:bg-indigo-600 hover:text-white transition-all">Inspect Pipeline</button>
         </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
         <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-sm font-black text-main flex items-center gap-3 uppercase tracking-widest">
               <Activity className="w-4 h-4 text-indigo-500" /> Transaction_Ledger.db
            </h3>
            <div className="flex gap-2">
               <button className="p-2 bg-white/5 text-muted rounded-lg border border-white/5 hover:text-indigo-400 transition-all"><Filter className="w-3.5 h-3.5" /></button>
               <button className="p-2 bg-white/5 text-muted rounded-lg border border-white/5 hover:text-indigo-400 transition-all"><Download className="w-3.5 h-3.5" /></button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-white/5 border-b border-white/5 text-[9px] font-black text-muted uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-4">Ref_ID</th>
                     <th className="px-8 py-4">Node_Entity</th>
                     <th className="px-8 py-4">Operation</th>
                     <th className="px-8 py-4">Timestamp</th>
                     <th className="px-8 py-4 text-right">Value</th>
                     <th className="px-8 py-4 text-center">Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-xs">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-4 font-mono font-bold text-muted text-[10px]">TX_{typeof tx.id === 'string' ? tx.id.slice(-6).toUpperCase() : tx.id}</td>
                       <td className="px-8 py-4 font-black text-main">{tx.user}</td>
                       <td className="px-8 py-4">
                          <span className={`flex items-center gap-1.5 font-black text-[10px] uppercase ${tx.type === 'Payout' ? 'text-rose-500' : 'text-emerald-500'}`}>
                             {tx.type === 'Payout' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />} {tx.type}
                          </span>
                       </td>
                       <td className="px-8 py-4 text-muted font-bold text-[10px]">{new Date(tx.createdAt).toLocaleDateString()}</td>
                       <td className="px-8 py-4 text-right font-black text-main">${Number(tx.amount).toFixed(2)}</td>
                       <td className="px-8 py-4">
                          <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase mx-auto w-fit border ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : tx.status === 'failed' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                             {tx.status}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {transactions.length === 0 && <div className="py-16 text-center text-muted font-black uppercase tracking-widest text-[10px] opacity-20">No financial flux recorded</div>}
      </div>
    </div>
  );
}

