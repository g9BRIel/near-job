import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, ShieldCheck, Globe, DollarSign, Key, ToggleLeft, ToggleRight } from 'lucide-react';

const GROUP_META = {
  general:  { label: 'General',  icon: Globe,        color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  security: { label: 'Security', icon: ShieldCheck,  color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'   },
  finance:  { label: 'Finance',  icon: DollarSign,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20'},
  api:      { label: 'API',      icon: Key,          color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'  },
};

export default function Settings({ settings = [], onUpdate }) {
  const [localSettings, setLocalSettings] = useState(settings.length > 0 ? settings : [
    { key: 'platform_name',      value: 'NearJob',              group: 'general',  label: 'Platform Name' },
    { key: 'support_email',      value: 'support@nearjob.com',  group: 'general',  label: 'Support Email' },
    { key: 'maintenance_mode',   value: 'false',                group: 'security', label: 'Maintenance Mode' },
    { key: 'allow_registrations',value: 'true',                 group: 'security', label: 'Allow Registrations' },
    { key: 'commission_rate',    value: '5',                    group: 'finance',  label: 'Commission Rate (%)' },
    { key: 'api_key_maps',       value: '••••••••••••••••',     group: 'api',      label: 'Maps API Key' },
  ]);

  const groups = ['general', 'security', 'finance', 'api'];
  const [activeGroup, setActiveGroup] = useState('general');

  const handleUpdate = (key, val) =>
    setLocalSettings(s => s.map(i => i.key === key ? { ...i, value: val } : i));

  const saveAll = () => onUpdate(localSettings);

  const active = GROUP_META[activeGroup];
  const ActiveIcon = active.icon;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700">

      {/* Sidebar nav */}
      <div className="w-full lg:w-64 flex flex-col gap-2">
        {groups.map(g => {
          const meta = GROUP_META[g];
          const Icon = meta.icon;
          const isActive = activeGroup === g;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]'
                  : 'glass border border-white/5 text-muted hover:text-main hover:bg-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : `${meta.bg} ${meta.color}`} border ${isActive ? 'border-white/20' : meta.border}`}>
                <Icon className="w-4 h-4" />
              </div>
              {meta.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
            </button>
          );
        })}

        {/* Security card */}
        <div className="mt-4 glass rounded-2xl p-6 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="font-black text-main text-xs uppercase tracking-widest mb-2">Council Protocol</h4>
            <p className="text-[10px] text-muted font-bold leading-relaxed opacity-60 uppercase tracking-wider">All changes are cryptographically logged at Security Level 5.</p>
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 space-y-6">
        <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${active.bg} ${active.color} rounded-xl flex items-center justify-center border ${active.border}`}>
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-main text-sm uppercase tracking-widest">{active.label} Configuration</h3>
                <p className="text-[9px] text-muted font-black uppercase tracking-widest mt-0.5">System Control Panel → {active.label}</p>
              </div>
            </div>
            <button
              onClick={saveAll}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10"
            >
              <Save className="w-4 h-4" /> Commit Changes
            </button>
          </div>

          {/* Fields */}
          <div className="p-8 space-y-8">
            {localSettings.filter(s => s.group === activeGroup).map(s => (
              <div key={s.key} className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{s.label}</label>
                  <span className="text-[9px] font-mono font-black text-indigo-400/60">key: {s.key}</span>
                </div>

                {s.value === 'true' || s.value === 'false' ? (
                  <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 w-fit">
                    <button
                      onClick={() => handleUpdate(s.key, 'true')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${s.value === 'true' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-muted hover:text-main'}`}
                    >
                      <ToggleRight className="w-3.5 h-3.5" /> Enabled
                    </button>
                    <button
                      onClick={() => handleUpdate(s.key, 'false')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${s.value === 'false' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' : 'text-muted hover:text-main'}`}
                    >
                      <ToggleLeft className="w-3.5 h-3.5" /> Disabled
                    </button>
                  </div>
                ) : (
                  <input
                    type={s.key.includes('key') ? 'password' : 'text'}
                    value={s.value}
                    onChange={e => handleUpdate(s.key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm font-bold text-main outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
