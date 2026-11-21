import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Shield } from 'lucide-react';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 font-sans bg-slate-50">
      <div className="max-w-md w-full space-y-6 p-8 rounded-xl bg-white border border-slate-200 shadow-md">
        <div className="text-center space-y-2">
          {/* Bridge Emblem */}
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-blue-700 text-white shadow-xs mb-1">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 19h18" />
              <path d="M4 19V11a8 8 0 0 1 16 0v8" />
              <path d="M12 11v8" />
              <path d="M8 14v5" />
              <path d="M16 14v5" />
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Sign in to NagarSetu</h2>
            <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">नगरसेतु</span>
          </div>
          <p className="text-xs text-slate-500">Unified Municipal Infrastructure & Citizen Portal</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official / Citizen Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nagarsetu.gov.in"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            Quick-Login Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('citizen@nagarsetu.gov.in', 'Citizen@123')}
              className="px-2 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold text-center transition-colors"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('officer.road@nagarsetu.gov.in', 'Officer@123')}
              className="px-2 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-semibold text-center transition-colors"
            >
              Road Lead
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@nagarsetu.gov.in', 'Admin@123')}
              className="px-2 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[11px] font-semibold text-center transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          New citizen on NagarSetu?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register your profile
          </Link>
        </div>
      </div>
    </div>
  );
};
