import { useState } from 'react';
import { Briefcase, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { workerFields, companyFields } from '../../data/mockData';
import { API_BASE } from '../../utils/api';
import ForgotPass from './ForgotPass';

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [userType, setUserType] = useState('worker'); // 'worker' or 'company'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = authMode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { ...formData, userType };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        // Pass userType and profile data to App
        onLogin(data.userType, data.profile || data); 
      } else {
        // Show field-level validation errors if present (from server Joi validation)
        if (data.details && data.details.length > 0) {
          const msgs = data.details.map(d => `• ${d.message}`).join('\n');
          alert(`${data.error}\n\n${msgs}`);
        } else {
          alert(data.error || data.message || 'Authentication failed');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = userType === 'worker' ? workerFields : companyFields;

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px]">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <img src="/logo_main.png" alt="Logo" className="w-7 h-7 object-contain" />
              </div>
            </div>
            <span className="text-white font-black text-2xl tracking-tighter">Near<span className="text-indigo-400">Job</span></span>
          </div>
          <p className="text-gray-500 font-medium">{authMode === 'login' ? 'Welcome back to your local hub' : 'Join your local professional network'}</p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="glass-morphism rounded-2xl p-1.5 flex mb-8 max-w-sm mx-auto border-white/5">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              authMode === 'login' 
                ? 'premium-gradient text-white shadow-lg' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              authMode === 'register' 
                ? 'premium-gradient text-white shadow-lg' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-6">
          {/* User Type Selection (only for register) */}
          {authMode === 'register' && (
            <div className="glass-morphism rounded-3xl p-6 border-white/5 animate-in slide-in-from-top-4 duration-500">
              <p className="text-white/60 text-center mb-5 text-sm font-bold uppercase tracking-widest">I want to join as a...</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserType('worker')}
                  className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${
                    userType === 'worker'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <User className={`w-10 h-10 ${userType === 'worker' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <div className="text-center">
                    <span className={`block font-black text-lg ${userType === 'worker' ? 'text-white' : 'text-gray-400'}`}>Worker</span>
                  </div>
                  {userType === 'worker' && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
                </button>
                
                <button
                  onClick={() => setUserType('company')}
                  className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${
                    userType === 'company'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Briefcase className={`w-10 h-10 ${userType === 'company' ? 'text-purple-400' : 'text-gray-500'}`} />
                  <div className="text-center">
                    <span className={`block font-black text-lg ${userType === 'company' ? 'text-white' : 'text-gray-400'}`}>Company</span>
                  </div>
                  {userType === 'company' && <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-morphism rounded-[2.5rem] p-8 md:p-12 space-y-6 border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 premium-gradient opacity-50" />
            
            <div className="space-y-5">
              {authMode === 'register' ? (
                fields.map((field) => (
                  <div key={field.name} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2.5 ml-1">{field.label}</label>
                    {field.type === 'select' ? (
                      <div className="relative">
                        <select
                          name={field.name}
                          onChange={handleChange}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900">Select {field.label.toLowerCase()}</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt} className="bg-slate-900">{opt} employees</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <input
                          type={field.type === 'password' && showPassword ? 'text' : field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          onChange={handleChange}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all group-hover:border-white/20"
                        />
                        {field.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    )}
                    {field.type === 'password' && (
                      <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-tight ml-1">Protective security active • Enforced complexity</p>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2.5 ml-1">Work Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between mb-2.5 ml-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Access Key</label>
                      <button 
                        type="button" 
                        onClick={() => setShowForgotPass(true)} 
                        className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                      >
                        Recovery?
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all group-hover:border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-3 text-sm text-gray-500 font-bold cursor-pointer select-none">
                      <div className="relative w-5 h-5">
                        <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="w-full h-full border-2 border-white/10 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </div>
                      Persistent Session
                    </label>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-[1.25rem] premium-gradient text-white font-black text-lg premium-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? 'Authenticate' : 'Initialize Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-gray-500 text-sm font-bold">
              {authMode === 'login' ? (
                <>New to the network? <button type="button" onClick={() => setAuthMode('register')} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-2 transition-colors">Create Identity</button></>
              ) : (
                <>Existing user? <button type="button" onClick={() => setAuthMode('login')} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-2 transition-colors">Authenticate</button></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPass && <ForgotPass onClose={() => setShowForgotPass(false)} />}
    </div>
  );
};

export default AuthPage;