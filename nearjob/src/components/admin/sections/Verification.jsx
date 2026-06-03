import React, { useState } from 'react';
import { BadgeCheck, Shield, FileText, User, Building2, CheckCircle, XCircle, Search, AlertCircle } from 'lucide-react';

export default function Verification({ workers, companies, onVerify }) {
  const [subTab, setSubTab] = useState('workers');
  const [search, setSearch] = useState('');

  const list = (subTab === 'workers' ? workers : companies).filter(u => !u.isVerified);
  const filtered = list.filter(u => (u.fullName || u.companyName || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-indigo-500/10 border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <BadgeCheck className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-xl font-black tracking-tight uppercase tracking-wider">Clearance_Hub</h2>
          </div>
          <p className="text-indigo-100 font-bold text-sm leading-relaxed max-w-sm">
             Authorize user identity nodes to grant <span className="text-white font-black">Trusted Clearance</span>. Verification stabilizes the social graph by 40%.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-center min-w-[100px]">
              <p className="text-2xl font-black text-white">{workers.filter(w => !w.isVerified).length}</p>
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mt-1">Pending_Nodes</p>
           </div>
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-center min-w-[100px]">
              <p className="text-2xl font-black text-white">{companies.filter(c => !c.isVerified).length}</p>
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mt-1">Pending_Corps</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/5 gap-1">
          <button 
            onClick={() => setSubTab('workers')} 
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${subTab === 'workers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main'}`}
          >
            <User className="w-3.5 h-3.5" /> Workers
          </button>
          <button 
            onClick={() => setSubTab('companies')} 
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${subTab === 'companies' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main'}`}
          >
            <Building2 className="w-3.5 h-3.5" /> Companies
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder={`Filter pending ${subTab}...`} 
            className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-xs font-bold text-main outline-none focus:border-indigo-500 w-64 transition-all" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(item => (
          <div key={item.id} className="glass rounded-2xl p-6 border border-white/5 shadow-sm hover:translate-y-[-4px] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Shield className="w-20 h-20 text-main" />
            </div>
            <div className="flex items-center gap-6 mb-6 relative z-10">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl shadow-inner border border-white/5 ${subTab === 'workers' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {item.avatar || item.logo ? (
                  <img src={item.avatar || item.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  (item.fullName || item.companyName || '?').charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-main text-lg truncate leading-tight tracking-tight">{item.fullName || item.companyName}</h4>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                   <AlertCircle className="w-3 h-3 text-indigo-400" /> ID_{typeof item.id === 'string' ? item.id.slice(-6).toUpperCase() : item.id} • {item.email}
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 relative z-10 border border-white/5">
               <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted uppercase tracking-widest">Document_State</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase">
                     <FileText className="w-3 h-3" /> Integrity_Warning
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted uppercase tracking-widest">Logic_Analysis</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                     <CheckCircle className="w-3 h-3" /> Identity_Matched
                  </div>
               </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button 
                onClick={() => onVerify(subTab === 'workers' ? 'worker' : 'company', item.id)} 
                className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-[1.02] transform transition-all active:scale-[0.98]"
              >
                Approve_Clearance
              </button>
              <button className="px-5 py-3 bg-white/5 text-muted border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 hover:text-rose-500 hover:border-rose-500/30 transition-all">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="lg:col-span-2 py-24 text-center glass rounded-2xl border border-white/5 shadow-xl">
             <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/10">
                <BadgeCheck className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-black text-main tracking-tight uppercase tracking-widest">Integrity: Stabilized</h3>
             <p className="text-muted mt-2 font-bold text-[10px] max-w-xs mx-auto uppercase tracking-wider leading-relaxed">No pending verification cycles found. Buffer is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}


