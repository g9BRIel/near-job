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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            N
          </div>
          <h1 className="text-3xl font-bold text-white">NearJob</h1>
          <p className="text-gray-400 mt-2">Find work near you</p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="glass rounded-2xl p-1 flex mb-6 max-w-md mx-auto">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
              authMode === 'login' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
              authMode === 'register' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* User Type Selection (only for register) */}
        {authMode === 'register' && (
          <div className="glass rounded-2xl p-6 mb-6">
            <p className="text-white text-center mb-4 font-medium">I am a...</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setUserType('worker')}
                className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                  userType === 'worker'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <User className={`w-8 h-8 ${userType === 'worker' ? 'text-blue-400' : 'text-gray-400'}`} />
                <span className={`font-medium ${userType === 'worker' ? 'text-white' : 'text-gray-400'}`}>
                  Worker
                </span>
                <span className="text-xs text-gray-500">Looking for jobs</span>
              </button>
              
              <button
                onClick={() => setUserType('company')}
                className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                  userType === 'company'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <Briefcase className={`w-8 h-8 ${userType === 'company' ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className={`font-medium ${userType === 'company' ? 'text-white' : 'text-gray-400'}`}>
                  Company
                </span>
                <span className="text-xs text-gray-500">Hiring talent</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {authMode === 'login' ? 'Welcome Back!' : `Create ${userType === 'worker' ? 'Worker' : 'Company'} Account`}
          </h2>

          {authMode === 'register' ? (
            // Registration Form
            fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-gray-400 mb-2">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-slate-800">Select size</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt} className="bg-slate-800">{opt} employees</option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type={field.type === 'password' && showPassword ? 'text' : field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                )}
                {field.type === 'password' && (
                  <p className="text-xs text-gray-500 mt-1">Min 8 chars • uppercase • lowercase • number</p>
                )}
              </div>
            ))
          ) : (
            // Login Form
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min 6 characters"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400">
                  <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                  Remember me
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPass(true)} 
                  className="text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-gray-400 text-sm">
            {authMode === 'login' ? (
              <>Don't have an account? <button type="button" onClick={() => setAuthMode('register')} className="text-blue-400 hover:text-blue-300">Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="text-blue-400 hover:text-blue-300">Sign in</button></>
            )}
          </p>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPass && <ForgotPass onClose={() => setShowForgotPass(false)} />}
    </div>
  );
};

export default AuthPage;