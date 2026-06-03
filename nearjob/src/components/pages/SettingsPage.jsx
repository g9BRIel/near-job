import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Settings, Moon, Sun, Bell, Lock, User, LogOut, 
  ShieldAlert, Globe, Mail, Eye, Smartphone, 
  Trash2, Key, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../utils/LanguageContext';
import { 
  updateSettings, fetchSettings, changePassword, 
  API_BASE, authHeaders 
} from '../../utils/api';
import BlockedUsersModal from '../common/BlockedUsersModal';

const SettingsPage = ({ userType, userData, onNavigate, onUpdate, onChangingLang }) => {
  const { changeLanguage, language } = useLanguage();
  
  // Sections state
  const [activeSection, setActiveSection] = useState('appearance');
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: { email: true, inApp: true, messages: true, jobs: true },
    privacy: { profileVisible: true, allowMessages: true, searchable: true },
    preferences: { language: 'en', emailFrequency: 'weekly' },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState({ state: 'idle', msg: '' });

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const saveTimerRef = useRef(null);
  const pendingSettingsRef = useRef(null);

  const loadAllData = useCallback(async () => {
    try {
      const [sData, blocksRes] = await Promise.all([
        fetchSettings(),
        fetch(`${API_BASE}/api/users/blocked-users`, { headers: authHeaders() })
      ]);
      
      if (sData) setSettings(sData);
      
      if (blocksRes.ok) {
        const bData = await blocksRes.json();
        setBlockedUsers(bData || []);
      }
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const flushSave = useCallback(async () => {
    if (!pendingSettingsRef.current) return;
    const toSave = pendingSettingsRef.current;
    pendingSettingsRef.current = null;
    setSaving(true);
    try {
      const result = await updateSettings(toSave);
      if (result) {
        setSaveStatus('ok');
        if (onUpdate && result.settings) {
          // Sync with App legacy state
          onUpdate({ settings: result.settings });
        }
      } else {
        setSaveStatus('err');
      }
    } catch (err) {
      setSaveStatus('err');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [onUpdate]);

  const queueSave = (updated) => {
    setSettings(updated);
    pendingSettingsRef.current = updated;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushSave, 800);
  };

  const handleThemeChange = (newTheme) => {
    const updated = { ...settings, theme: newTheme };
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.classList.toggle('light', newTheme === 'light');
    queueSave(updated);
  };

  const handleToggle = (section, key) => {
    const updated = {
      ...settings,
      [section]: { ...settings[section], [key]: !settings[section][key] }
    };
    queueSave(updated);
  };

  const handlePreferenceChange = (key, value) => {
    if (key === 'language') {
      const langNames = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' };
      if (onChangingLang) onChangingLang(langNames[value] || value);
      setTimeout(() => changeLanguage(value), 500);
    }
    const updated = {
      ...settings,
      preferences: { ...settings.preferences, [key]: value }
    };
    queueSave(updated);
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPwStatus({ state: 'error', msg: 'Passwords do not match' });
      return;
    }
    setPwStatus({ state: 'loading', msg: 'Updating...' });
    try {
      await changePassword(passwordForm.current, passwordForm.new);
      setPwStatus({ state: 'success', msg: 'Password updated successfully!' });
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwStatus({ state: 'idle', msg: '' }), 4000);
    } catch (err) {
      setPwStatus({ state: 'error', msg: err.message });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('nearjob-logout'));
  };

  const MENU_ITEMS = [
    { id: 'appearance', label: 'Appearance', icon: Sun, color: 'text-yellow-400' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-green-400' },
    { id: 'privacy', label: 'Privacy & Safety', icon: Eye, color: 'text-blue-400' },
    { id: 'security', label: 'Security', icon: Lock, color: 'text-purple-400' },
    { id: 'preferences', label: 'Preferences', icon: Globe, color: 'text-orange-400' },
    { id: 'account', label: 'Account', icon: User, color: 'text-indigo-400' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-muted animate-pulse">Initializing settings engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-2">
          <h2 className="text-2xl font-bold text-white mb-6 px-2">Settings</h2>
          <div className="glass rounded-3xl p-3 space-y-1">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 shadow-lg border border-blue-500/30' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-slate-800/50 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${activeSection === item.id ? 'text-white' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
                {activeSection === item.id && <ChevronRight className="w-4 h-4 text-blue-400" />}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 mt-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 px-6 font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:flex-1 relative">
          <div className="absolute -top-12 right-0 flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 animate-pulse">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                Syncing setup...
              </span>
            )}
            {!saving && saveStatus === 'ok' && (
              <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                <CheckCircle2 className="w-3 h-3" /> Encrypted & Saved
              </span>
            )}
          </div>

          <div className="glass rounded-[2rem] p-8 min-h-[600px] border-white/5">
            
            {/* 1. Appearance */}
            {activeSection === 'appearance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Display Mode</h3>
                  <p className="text-gray-400 text-sm">Customize how NearJob looks on your screen</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`relative p-1 rounded-3xl transition-all duration-500 group overflow-hidden ${
                      settings.theme === 'dark' ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-900 shadow-2xl' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-video bg-slate-800 rounded-2xl flex flex-col p-4 gap-2 border border-white/10">
                      <div className="w-1/2 h-3 bg-slate-700 rounded-full" />
                      <div className="w-full h-8 bg-slate-900/50 rounded-lg flex items-center px-4">
                        <div className="w-full h-2 bg-blue-600/40 rounded-full" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-slate-700 rounded-full" />
                        <div className="flex-1 h-3 mt-2 bg-slate-700 rounded-full" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 font-semibold text-white">
                      <Moon className="w-4 h-4" /> Dark Void
                    </div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`relative p-1 rounded-3xl transition-all duration-500 group overflow-hidden ${
                      settings.theme === 'light' ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-white shadow-2xl' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-video bg-white rounded-2xl flex flex-col p-4 gap-2 border border-black/5">
                      <div className="w-1/2 h-3 bg-gray-200 rounded-full" />
                      <div className="w-full h-8 bg-gray-100 rounded-lg flex items-center px-4">
                        <div className="w-full h-2 bg-blue-200 rounded-full" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div className="flex-1 h-3 mt-2 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <Sun className="w-4 h-4" /> Crystal White
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Live Alert Matrix</h3>
                  <p className="text-gray-400 text-sm">Control how you stay connected with the ecosystem</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'SMTP Forwarding', desc: 'Encrypted email alerts for vital events', icon: Mail },
                    { key: 'inApp', label: 'Dashboard Feed', desc: 'Real-time action notifications in the cockpit', icon: Bell },
                    { key: 'messages', label: 'Neural Comms', desc: 'Visual pings when other users initiate chat', icon: Smartphone },
                    { key: 'jobs', label: 'Algorithm Matches', desc: 'Notify when new opportunities cross your radar', icon: ShieldAlert },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-800 border border-white/5 group-hover:border-white/20 transition-colors">
                          <item.icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{item.label}</p>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle('notifications', item.key)}
                        className={`w-14 h-8 rounded-full transition-all relative ${
                          settings.notifications[item.key] ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${
                          settings.notifications[item.key] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Privacy */}
            {activeSection === 'privacy' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Privacy Shield</h3>
                    <p className="text-gray-400 text-sm">Manage your digital footprint on the platform</p>
                  </div>
                  <button
                    onClick={() => setShowBlockedModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold text-sm"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Blocked Accounts ({blockedUsers.length})
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'profileVisible', label: 'Signal Broadcast', desc: 'Allow your profile to be visible to others', icon: Eye },
                    { key: 'allowMessages', label: 'Inbound Comms', desc: 'Permit users to initiate new neural links', icon: Mail },
                    { key: 'searchable', label: 'Indexing Status', desc: 'Appear in discovery searches and directories', icon: Globe },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-800">
                          <item.icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{item.label}</p>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle('privacy', item.key)}
                        className={`w-14 h-8 rounded-full transition-all relative ${
                          settings.privacy[item.key] ? 'bg-purple-600 shadow-lg shadow-purple-600/20' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                          settings.privacy[item.key] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Security */}
            {activeSection === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Access Credentials</h3>
                  <p className="text-gray-400 text-sm">Protect your account with modern encryption</p>
                </div>

                <form onSubmit={onPasswordSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Key className="w-3 h-3" /> Current Access Key
                      </label>
                      <input 
                        required
                        type="password"
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Lock className="w-3 h-3" /> New Key
                      </label>
                      <input 
                        required
                        type="password"
                        value={passwordForm.new}
                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Confirm Key
                      </label>
                      <input 
                        required
                        type="password"
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {pwStatus.msg && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                      pwStatus.state === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      pwStatus.state === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {pwStatus.state === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {pwStatus.msg}
                    </div>
                  )}

                  <button
                    disabled={pwStatus.state === 'loading'}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-900/20 disabled:opacity-50"
                  >
                    {pwStatus.state === 'loading' ? 'Encrypting...' : 'Update Access Credentials'}
                  </button>
                </form>
              </div>
            )}

            {/* 5. Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Regional Matrix</h3>
                  <p className="text-gray-400 text-sm">Configure your localized platform experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-5 h-5 text-orange-400" />
                      <h4 className="font-semibold text-white">System Language</h4>
                    </div>
                    <select
                      value={settings.preferences.language || language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (ES)</option>
                      <option value="fr">Français (FR)</option>
                      <option value="de">Deutsch (DE)</option>
                    </select>
                    <p className="mt-3 text-xs text-gray-500 italic">Changing language will reload the application engine.</p>
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-white">Update Frequency</h4>
                    </div>
                    <select
                      value={settings.preferences.emailFrequency}
                      onChange={(e) => handlePreferenceChange('emailFrequency', e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="instant">Instant Flux</option>
                      <option value="daily">Daily Pulse</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="monthly">Monthly Audit</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Account */}
            {activeSection === 'account' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Core Account</h3>
                  <p className="text-gray-400 text-sm">Unified identity and platform status</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Email Identifier</p>
                    <p className="text-white font-medium">{userData?.email}</p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Protocol Type</p>
                    <p className="text-white font-medium capitalize">{userType}</p>
                  </div>
                </div>

                <div className="pt-8 space-y-4">
                  <button
                    onClick={() => onNavigate?.('edit')}
                    className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-2xl border border-blue-500/20 group hover:from-blue-600/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <User className="w-5 h-5 text-blue-400" />
                      <div className="text-left">
                        <p className="text-white font-bold">Edit Digital Persona</p>
                        <p className="text-gray-500 text-sm">Update avatar, bio, and skill matrix</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </button>

                  <div className="p-8 mt-12 bg-red-600/5 rounded-[2rem] border border-red-500/20">
                    <div className="flex items-center gap-4 mb-4">
                      <Trash2 className="w-6 h-6 text-red-500" />
                      <h4 className="text-lg font-bold text-red-400">Hazard Zone</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                      Deleting your account will permanently erase your digital footprint from the NearJob ecosystem. 
                      This action is irreversible and will purge all messages, jobs, and historical data.
                    </p>
                    <button className="px-6 py-2.5 bg-red-600/10 text-red-500 border border-red-500/40 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all text-sm">
                      Initiate Self-Destruct
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <BlockedUsersModal 
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        blockedUsers={blockedUsers}
        onUnblock={async (id, type) => {
          try {
            const res = await fetch(`${API_BASE}/api/users/unblock`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({ blockedId: id, blockedType: type })
            });
            if (res.ok) {
              setBlockedUsers(prev => prev.filter(u => !(u.id === id && u.type === type)));
            }
          } catch (err) {
            console.error('Failed to unblock:', err);
          }
        }}
      />
    </div>
  );
};

export default SettingsPage;
