import React, { useState } from 'react';
import { X, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

const ReportModal = ({ target, targetName, onClose }) => {
  const [title] = useState(`Reporting ${targetName}`);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          title, 
          description: `Target: ${targetName} (${target.id})\n\nUser Notes: ${description}`, 
          priority 
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      console.error('Report failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Report Transmitted</h3>
          <p className="text-slate-400 text-sm">Thank you for keeping NearJob safe. Our council will review this within 24h.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-500 font-bold mb-1 uppercase tracking-tighter text-sm">
              <AlertTriangle className="w-4 h-4" /> Safety Protocol
            </div>
            <h3 className="text-2xl font-black text-white">File Incident Report</h3>
            <p className="text-slate-400 text-sm mt-1">Reporting: {targetName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`p-4 rounded-2xl border text-xs font-black uppercase transition ${
                priority === 'medium' 
                  ? 'bg-amber-500 text-black border-amber-500' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              Suspicious
            </button>
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`p-4 rounded-2xl border text-xs font-black uppercase transition ${
                priority === 'high' 
                  ? 'bg-red-500 text-white border-red-500' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              Harmful / Scam
            </button>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 ml-1">Details of Incident</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please provide specific details about why you are reporting this..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-red-500 outline-none transition h-32 resize-none"
            />
          </div>

          <button
            disabled={loading || !description.trim()}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-2xl uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Transmit Report to Council
          </button>
          <p className="text-[10px] text-center text-slate-500 italic">NearJob safety AI and human moderators review every report.</p>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
