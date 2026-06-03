import React, { useState } from 'react';
import { Tag, Plus, Trash2, Search, Edit3, Grid, List as ListIcon, Sparkles, X, Check } from 'lucide-react';

export default function Categories({ categories, onCreate, onDelete }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });

  const filtered = categories.filter(cat => 
    (cat.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (cat.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onCreate(formData);
    setFormData({ name: '', description: '', icon: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
               placeholder="Filter taxonomies..." 
               className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-xs font-bold text-main outline-none focus:border-indigo-500 w-64 transition-all" 
              />
           </div>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-105 transition-all border border-white/10">
              <Plus className="w-3.5 h-3.5" /> Register_New
           </button>
        </div>
        <div className="flex bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-muted uppercase tracking-widest">
           {categories.length} Nodes_Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(cat => (
          <div key={cat.id} className="glass rounded-2xl p-6 border border-white/5 shadow-sm hover:translate-y-[-4px] transition-all group flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
            <div className="w-16 h-16 bg-white/5 text-indigo-400 rounded-xl flex items-center justify-center mb-5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all border border-white/5">
               {cat.icon ? <span className="text-2xl">{cat.icon}</span> : <Tag className="w-6 h-6" />}
            </div>
            <h4 className="text-sm font-black text-main mb-1 uppercase tracking-tight">{cat.name}</h4>
            <p className="text-[10px] text-muted font-bold leading-relaxed mb-6 h-10 line-clamp-2 opacity-50">
              {cat.description || "Manage job postings associated with this professional category."}
            </p>
            <div className="w-full flex gap-2">
               <button className="flex-1 py-2 bg-white/5 text-muted border border-white/10 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-white/10 hover:text-main transition-all">
                  <Edit3 className="w-3.5 h-3.5 mx-auto" />
               </button>
               <button onClick={() => onDelete(cat.id)} className="flex-1 py-2 bg-white/5 text-muted border border-white/10 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-rose-500/20 hover:text-rose-500 transition-all">
                  <Trash2 className="w-3.5 h-3.5 mx-auto" />
               </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-2xl border border-white/5 border-dashed">
             <Sparkles className="w-10 h-10 text-white/10 mx-auto mb-4" />
             <p className="text-muted font-black text-[10px] uppercase tracking-[0.2em] opacity-40">No taxonomies identified in this sector.</p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6">
          <div className="glass rounded-2xl p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black tracking-tight text-main uppercase racking-widest">Register_Taxonomy</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-1">Node_Identity</label>
                <input 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. INFRASTRUCTURE_MAINTENANCE" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-bold text-main outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:opacity-20" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-1">Scope_Protocol</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Describe node responsibilities..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-main outline-none focus:border-indigo-500 focus:bg-white/10 min-h-[80px] resize-none transition-all placeholder:opacity-20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-1">Visual_Identifier (Emoji)</label>
                <input 
                  value={formData.icon} 
                  onChange={e => setFormData({...formData, icon: e.target.value})} 
                  placeholder="e.g. 🛠️" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-bold text-main outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:opacity-20" 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-105 transition-all border border-white/10">
                  Authorize_Creation
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-white/5 text-muted font-black uppercase text-[10px] tracking-widest rounded-xl transition-all hover:bg-white/10 border border-white/10">
                  Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
