import React, { useState, useEffect } from 'react';
import { Headphones, MessageSquare, User, Clock, CheckCircle, Reply, Trash2, Search, Filter, Phone, Mail } from 'lucide-react';

export default function Support({ tickets = [], onReply, onDelete }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filtered = tickets.filter(t => 
    ((t.reason?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))) &&
    (filter === 'all' || (filter === 'pending' ? !t.isResolved : t.isResolved))
  );


  const handleReply = (id) => {
    if (!replyText) return;
    onReply(id, replyText);
    setReplyText('');
    setActiveTicket(null);
  };

  return (
    <div className="flex flex-col h-[75vh] animate-in fade-in duration-500 overflow-hidden glass rounded-2xl border border-white/5 shadow-2xl">
      <div className="flex-1 flex overflow-hidden">
        {/* Ticket List Area */}
        <div className="w-80 border-r border-white/5 flex flex-col overflow-hidden bg-white/[0.01]">
          <div className="p-6 border-b border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-black text-main flex items-center gap-3 uppercase tracking-widest">
              <Headphones className="w-4 h-4 text-indigo-500" /> Support Desk
            </h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Find node..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-[10px] font-black text-main outline-none focus:border-indigo-500 transition-all uppercase tracking-widest" 
              />
            </div>
            <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5">
               {['all', 'pending', 'resolved'].map(s => (
                 <button key={s} onClick={() => setFilter(s)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main'}`}>{s}</button>
               ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {filtered.map(t => (
              <button key={t.id} onClick={() => setActiveTicket(t)} className={`w-full p-6 text-left transition-all hover:bg-white/[0.03] border-r-4 ${activeTicket?.id === t.id ? 'border-r-indigo-600 bg-indigo-500/5' : 'border-r-transparent'}`}>
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${!t.isResolved ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest">#{typeof t.id === 'string' ? t.id.slice(-6).toUpperCase() : t.id}</p>
                   </div>
                   <p className="text-[9px] font-bold text-muted whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                </div>
                <h4 className="font-black text-main text-xs truncate mb-1">{t.reason}</h4>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-3 truncate opacity-60">Level_{t.reporterType}</p>
                <p className="text-[10px] text-muted line-clamp-2 leading-relaxed italic opacity-40">"{t.description}"</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative bg-white/[0.01]">
          {activeTicket ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
               <div className="p-6 glass border-b border-white/5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                        <User className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-main uppercase tracking-tight">{activeTicket.reporterType} <span className="text-indigo-400">Node_{activeTicket.reporterId}</span></h4>
                        <div className="flex items-center gap-4 text-[9px] font-black text-muted uppercase tracking-widest mt-1">
                           <span className="flex items-center gap-1.5"><CheckCircle className={`w-3 h-3 ${activeTicket.isResolved ? 'text-emerald-500' : 'text-white/10'}`} /> {activeTicket.isResolved ? 'RESOLVED_CLEARANCE' : 'ESTABLISHING_CONTACT'}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => onDelete(activeTicket.id)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-muted hover:text-rose-500 transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {/* User Message */}
                  <div className="flex gap-4 max-w-2xl">
                     <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg border border-white/10 flex items-center justify-center text-main font-black text-[10px]">U</div>
                     <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none border border-white/10">
                        <p className="text-xs font-black text-main mb-2 tracking-tight">{activeTicket.reason}</p>
                        <p className="text-xs text-muted leading-relaxed font-medium">{activeTicket.description}</p>
                        <p className="text-[9px] text-muted/40 font-black uppercase mt-4 text-right">Log_Sent @ {new Date(activeTicket.createdAt).toLocaleTimeString()}</p>
                     </div>
                  </div>

                  {activeTicket.isResolved && (
                    <div className="flex flex-row-reverse gap-4 max-w-2xl ml-auto">
                       <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg shadow-lg flex items-center justify-center text-white font-black text-[10px]">A</div>
                       <div className="bg-indigo-600/90 p-5 rounded-2xl rounded-tr-none shadow-xl text-white border border-indigo-500/30">
                          <p className="text-xs leading-relaxed font-medium">Incident analyzed and mitigated. Administrative Council has enforced resolution protocol for this report.</p>
                          <p className="text-[9px] text-indigo-300 font-black uppercase mt-4 tracking-widest">Signed: Council_Admin</p>
                       </div>
                    </div>
                  )}
               </div>

               {!activeTicket.isResolved && (
                  <div className="p-6 glass border-t border-white/5 z-10">
                     <div className="relative group">
                        <textarea 
                          value={replyText} 
                          onChange={e => setReplyText(e.target.value)}
                          placeholder={`Transmit response to node...`} 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pb-16 text-xs font-bold text-main outline-none focus:border-indigo-500 focus:bg-white/10 transition-all shadow-inner resize-none h-32 custom-scrollbar"
                        />
                        <div className="absolute bottom-4 right-4">
                           <button onClick={() => handleReply(activeTicket.id)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all">
                              <Reply className="w-4 h-4" /> Finalize Solution
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-20 group">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                  <Headphones className="w-8 h-8 text-muted" />
               </div>
               <h4 className="text-xl font-black text-main tracking-tight uppercase tracking-[0.2em]">Council_Support_Desk</h4>
               <p className="text-muted font-bold mt-2 max-w-[200px] text-[10px] leading-relaxed uppercase tracking-widest">Awaiting interaction with pending support nodes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

