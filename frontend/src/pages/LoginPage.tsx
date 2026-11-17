import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const raw = localStorage.getItem('nagarsetu_user') || localStorage.getItem('civic_user');
      const u = raw ? JSON.parse(raw) : null;
      if (u?.role === 'ADMIN') {
        navigate('/admin');
      } else if (u?.role === 'OFFICER') {
        navigate('/officer');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative">
        <div className="text-center space-y-2">
          {/* Bridge Emblem */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 19h18" />
                <path d="M4 19V11a8 8 0 0 1 16 0v8" />
                <path d="M12 11v8" />
                <path d="M8 14v5" />
                <path d="M16 14v5" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-black text-white">NagarSetu Portal</h2>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">नगरसेतु</span>
          </div>
          <p className="text-xs text-slate-400">नागरिकों और प्रशासन के बीच एक सेतु • Unified Civic Sign In</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official / Citizen Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nagarsetu.gov.in"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In to NagarSetu'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Quick Sign-In Demo Roles:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('citizen@nagarsetu.gov.in', 'Citizen@123')}
              className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition-colors text-center"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('road.officer@nagarsetu.gov.in', 'Officer@123')}
              className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-semibold text-slate-300 hover:border-indigo-500/40 hover:text-indigo-400 transition-colors text-center"
            >
              Road Officer
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@nagarsetu.gov.in', 'Admin@123')}
              className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-semibold text-slate-300 hover:border-purple-500/40 hover:text-purple-400 transition-colors text-center"
            >
              Municipal Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          New citizen?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
            Register your NagarSetu account
          </Link>
        </p>
      </div>
    </div>
  );
};
