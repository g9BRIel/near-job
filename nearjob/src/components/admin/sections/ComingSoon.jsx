import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ComingSoon({ icon: Icon, title, description, features = [] }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-500 mb-8 shadow-inner border border-indigo-100">
        {Icon && <Icon className="w-12 h-12" />}
      </div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">{title}</h2>
      <p className="text-slate-400 font-medium text-lg mb-10 max-w-md">{description}</p>
      {features.length > 0 && (
        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm text-left text-slate-600 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" /> {f}
            </div>
          ))}
        </div>
      )}
      <div className="mt-12 px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-xl shadow-indigo-500/20 animate-pulse">
        In Development
      </div>
    </div>
  );
}
