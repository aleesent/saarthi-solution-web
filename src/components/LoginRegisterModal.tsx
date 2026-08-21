import React, { useState } from 'react';
import { User, Shield, ArrowRight, CheckCircle2, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { SarthiLogo } from './SarthiLogo';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onSuccess: (role: string) => void;
  onClose: () => void;
}

export const LoginRegisterModal: React.FC<LoginProps> = ({ onSuccess, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'Candidate' | 'Admin'>('Candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string>('');

  const handleQuickAutofill = (selectedRole: 'Candidate' | 'Admin') => {
    setErrorMsg('');
    setRole(selectedRole);
    if (selectedRole === 'Admin') {
      setEmail('admin@sarthisolutions.com');
      setPassword('admin123');
      setName('Raajesh V');
    } else {
      setEmail('candidate@gmail.com');
      setPassword('user123');
      setName('Rajesh Kumar');
      setPhone('+91 98765 43210');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanId = email.trim().toLowerCase();
    const isAdminCredentials = cleanId === 'admin' || cleanId === 'admin@sarthisolutions.com' || cleanId.includes('admin');
    
    // Determine effective role
    let finalRole = role;
    if (isAdminCredentials) {
      finalRole = 'Admin';
    }

    // Verify Admin Password if Admin role
    if (finalRole === 'Admin') {
      if (password !== 'admin123' && password !== 'admin') {
        setErrorMsg('Invalid Admin Password! Please use "admin123" for demo Admin login.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'register') {
        const res = await register(
          email, 
          password.length >= 6 ? password : `${password}123`, 
          finalRole, 
          name || (finalRole === 'Admin' ? 'Raajesh V' : 'Candidate User'), 
          phone
        );
        setDetectedRole(res.role);
        setLoggedIn(true);
        setTimeout(() => {
          onSuccess(res.role);
          onClose();
        }, 1000);
      } else {
        const res = await login(email, password);
        setDetectedRole(res.role);
        setLoggedIn(true);
        setTimeout(() => {
          onSuccess(res.role);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 max-w-lg mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D9A21B]/10 rounded-bl-full pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer transition-colors z-10"
        >
          ✕
        </button>

        <div className="text-center mb-6 relative z-10">
          <div className="mb-3 flex justify-center">
            <SarthiLogo heightDesktop={52} heightMobile={42} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A3D91]">
            Candidate & Admin Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with Candidate account or Admin ID & Password.
          </p>
        </div>

        {/* Demo Quick Fill Buttons */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D9A21B]" />
            <span>Click to Quick-Fill Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickAutofill('Candidate')}
              className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                role === 'Candidate' && email.includes('candidate')
                  ? 'bg-blue-50 border-[#0A3D91] text-[#0A3D91] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[#0A3D91] font-extrabold">
                <User className="w-3.5 h-3.5" /> Candidate Portal
              </div>
              <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">candidate@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAutofill('Admin')}
              className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                role === 'Admin' || email.includes('admin')
                  ? 'bg-amber-100 border-[#D9A21B] text-[#0A3D91] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[#0A3D91] font-extrabold">
                <Shield className="w-3.5 h-3.5 text-[#D9A21B]" /> Admin ID
              </div>
              <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">admin@sarthisolutions.com</div>
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 mb-5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          {(['Candidate', 'Admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === r
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'Candidate' && <User className="w-3.5 h-3.5" />}
              {r === 'Admin' && <Shield className="w-3.5 h-3.5 text-[#D9A21B]" />}
              <span>{r === 'Candidate' ? 'Candidate Sign In' : 'Admin Login'}</span>
            </button>
          ))}
        </div>

        {loggedIn ? (
          <div className="p-6 text-center text-[#0A3D91] bg-blue-50/80 rounded-2xl border border-blue-100">
            <CheckCircle2 className="w-10 h-10 text-[#0A3D91] mx-auto mb-2 animate-bounce" />
            <h3 className="text-base font-bold">Authentication Successful!</h3>
            <p className="text-xs text-slate-700 mt-1">
              Logged in as <strong className="text-[#0A3D91] font-black">{detectedRole}</strong>. Opening Dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {role === 'Admin' ? 'Admin ID / Email *' : 'Candidate Email or Mobile Number *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    role === 'Admin'
                      ? 'admin@sarthisolutions.com or admin'
                      : 'e.g. candidate@gmail.com or +91 98765 43210'
                  }
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                  {role === 'Admin' ? <Shield className="w-4 h-4 text-[#D9A21B]" /> : <User className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder={role === 'Admin' ? 'Enter Admin Password (admin123)' : 'Enter Account Password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {role === 'Admin' ? '🔒 Admin Default Pass: admin123' : '🔒 Candidate Pass: user123 (or any)'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A3D91] hover:bg-[#083275] disabled:opacity-60 text-white font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Authenticating...' : mode === 'login' ? `Login as ${role}` : `Register as ${role}`}</span>
              <ArrowRight className="w-4 h-4 text-[#D9A21B]" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs font-semibold text-[#0A3D91] hover:underline cursor-pointer"
              >
                {mode === 'login' ? "Don't have an account? Register here" : 'Already have an account? Login here'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
