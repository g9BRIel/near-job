import { useState } from 'react';
import { Mail, Phone, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { API_BASE } from '../../utils/api';

const ForgotPass = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, method })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage(`✓ Verification code sent to ${method === 'email' ? email : phone}`);
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(data.message || 'Failed to send code');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, method, code })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, method, code, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Password reset successfully! Please login with your new password.');
        onClose();
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-[100] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
              N
            </div>
            <h1 className="text-3xl font-bold text-white">NearJob</h1>
            <p className="text-gray-400 mt-2">Reset your password</p>
          </div>

          {/* Main Card */}
          <div className="glass rounded-2xl p-8">
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Forgot Password?</h2>
                <p className="text-gray-400 text-sm mb-6 text-center">
                  Enter your email or phone number to receive a verification code.
                </p>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 ${
                      method === 'email' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('phone')}
                    className={`flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 ${
                      method === 'phone' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    Phone
                  </button>
                </div>

                {method === 'email' ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
                  />
                ) : (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
                  />
                )}

                {message && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm">
                    {message}
                  </div>
                )}

                <button
                  onClick={sendCode}
                  disabled={loading || (method === 'email' ? !email : !phone)}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send Verification Code'
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full mt-3 py-2 text-gray-400 hover:text-white transition text-sm"
                >
                  Back to Login
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Verify Code</h2>
                <p className="text-gray-400 text-sm mb-6 text-center">
                  Enter the 6-digit code sent to {method === 'email' ? email : phone}
                </p>

                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-center text-3xl tracking-widest mb-4"
                />

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={verifyCode}
                  disabled={loading || code.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full mt-3 py-2 text-gray-400 hover:text-white transition text-sm flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h2>
                <p className="text-gray-400 text-sm mb-6 text-center">
                  Create a new password for your account
                </p>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min. 6 characters)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
                />

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={resetPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full mt-3 py-2 text-gray-400 hover:text-white transition text-sm"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;