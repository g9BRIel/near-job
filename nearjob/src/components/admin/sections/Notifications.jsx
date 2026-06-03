import React, { useState } from 'react';
import { Bell, Send, Users, Shield, Zap, Megaphone, Trash2, Clock, CheckCircle, Search, Mail, X } from 'lucide-react';

export default function Notifications({ history = [], onSend }) {
  const [activeTab, setActiveTab] = useState('compose');
  const [formData, setFormData] = useState({ title: '', body: '', target: 'all', type: 'info' });

  const handleSend = (e) => {
    e.preventDefault();
    onSend(formData);
    setFormData({ title: '', body: '', target: 'all', type: 'info' });
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex bg-white/5 rounded-xl p-1 border border-white/5 w-fit gap-1">
         <button onClick={() => setActiveTab('compose')} className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'compose' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main'}`}>Dispatch_Center</button>
         <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-main'}`}>Signal_Archive</button>
      </div>

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <form onSubmit={handleSend} className="glass rounded-2xl p-8 border border-white/5 shadow-xl space-y-6">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 border border-white/10">
                    <Megaphone className="w-5 h-5" />
                 </div>
                 <h3 className="text-sm font-black text-main tracking-widest uppercase">Disseminate_Signal</h3>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-1">Headline_Header</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Input headline data..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-bold text-main outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:opacity-30"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-1">Payload_Content</label>
                    <textarea 
                      required
                      value={formData.body}
                      onChange={e => setFormData({...formData, body: e.target.value})}
                      placeholder="Input message payload..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-main outline-none focus:border-indigo-500 focus:bg-white/10 transition-all min-h-[120px] resize-none placeholder:opacity-30 custom-scrollbar"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-1">Node_Targeting</label>
                       <select 
                        value={formData.target}
                        onChange={e => setFormData({...formData, target: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] font-black text-muted outline-none focus:border-indigo-400 transition-all uppercase tracking-widest cursor-pointer"
                       >
                          <option value="all">Global_All</option>
                          <option value="workers">Sector_Workers</option>
                          <option value="companies">Sector_Corps</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-1">Signal_Protocol</label>
                       <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] font-black text-muted outline-none focus:border-indigo-400 transition-all uppercase tracking-widest cursor-pointer"
                       >
                          <option value="info">Info_Signal</option>
                          <option value="alert">Security_Alert</option>
                          <option value="promo">Platform_Patch</option>
                       </select>
                    </div>
                 </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-white/10">
                 <Send className="w-4 h-4" /> Initialize_Broadcast
              </button>
           </form>

           <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden h-fit border border-white/5">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="w-24 h-24" /></div>
                 <div className="relative z-10">
                    <h4 className="text-sm font-black tracking-[0.2em] mb-4 uppercase">Pulse_Metrics</h4>
                    <p className="text-slate-400 font-bold text-[10px] mb-8 leading-relaxed uppercase tracking-wider opacity-60">Signals propagate via Push, Mail, and Socket protocols. Delivery integrity: 98.4%.</p>
                    <div className="flex gap-3">
                       <div className="bg-white/5 p-4 rounded-xl flex-1 text-center border border-white/5">
                          <p className="text-xl font-black">12.5k</p>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Active_Nodes</p>
                       </div>
                       <div className="bg-white/5 p-4 rounded-xl flex-1 text-center border border-white/5">
                          <p className="text-xl font-black">240ms</p>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Ping_Rate</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/5 flex items-center gap-6 group">
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 shadow-lg group-hover:rotate-12 transition-all border border-white/10">
                    <Mail className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-main tracking-tight uppercase">Direct_Comms_Bypass</h4>
                    <p className="text-muted text-[10px] font-bold mt-1 uppercase tracking-wider leading-relaxed opacity-50">Target single nodes via the <span className="text-indigo-400 font-black underline cursor-pointer">Council_Pardon</span> terminal in Sector_Users.</p>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
           <div className="p-6 bg-white/[0.02] border-b border-white/5">
              <h3 className="text-xs font-black text-main uppercase tracking-widest">Signal_Log_Archive.dat</h3>
           </div>
           <div className="divide-y divide-white/5 overflow-x-auto">
              {history.map(h => (
                <div key={h.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-white/[0.02] transition-all group min-w-[600px]">
                   <div className="flex items-center gap-5 mb-4 md:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${h.type === 'alert' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                         <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-black text-main text-sm truncate max-w-[250px]">{h.title}</h4>
                         <p className="text-[9px] text-muted font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                           <Users className="w-3.5 h-3.5 opacity-50" /> Target: {h.target} • {new Date(h.createdAt).toLocaleDateString()}
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <p className="text-lg font-black text-main tracking-tighter leading-none">{h.readCount}</p>
                         <p className="text-[8px] font-black text-muted uppercase tracking-widest mt-1">Read_Cycles</p>
                      </div>

                      <button className="p-2 bg-white/5 text-muted rounded-lg hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 border border-white/10">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
              {history.length === 0 && <div className="py-20 text-center text-muted font-black uppercase tracking-widest text-[10px] opacity-20">Transmission archive empty</div>}
           </div>
        </div>
      )}
    </div>
  );
}


