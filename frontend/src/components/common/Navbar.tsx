import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, MapPin, PlusCircle, LayoutDashboard, UserCheck, LogOut, LogIn, Activity, BarChart3 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & NagarSetu Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Bridge Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Bridge Arch Vector */}
                  <path d="M3 19h18" />
                  <path d="M4 19V11a8 8 0 0 1 16 0v8" />
                  <path d="M12 11v8" />
                  <path d="M8 14v5" />
                  <path d="M16 14v5" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  NagarSetu
                </span>
                <span className="hidden lg:inline-block text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                  नगरसेतु
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium">
                Bridging Citizens. Empowering Cities.
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/map"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/map') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              Smart Map
            </Link>

            <Link
              to="/accountability"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/accountability') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-400" />
              Public Accountability
            </Link>

            {isAuthenticated && user?.role === UserRole.CITIZEN && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Citizen Portal
                </Link>
                <Link
                  to="/report"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/report')
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-900/40'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Report Issue
                </Link>
                <Link
                  to="/my-reports"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/my-reports') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  My Reports
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === UserRole.ADMIN && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Activity className="w-4 h-4 text-purple-400" />
                  City Intelligence
                </Link>
                <Link
                  to="/admin/issues"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/issues') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  Manage Complaints & SLA
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === UserRole.OFFICER && (
              <Link
                to="/officer"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/officer') ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                Department Queue
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-slate-200">{user?.full_name}</div>
                  <div className="text-[11px] text-cyan-400 font-medium tracking-wide">
                    {user?.role === UserRole.OFFICER ? 'Field Officer' : user?.role === UserRole.ADMIN ? 'Municipal Admin' : 'Verified Citizen'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Join NagarSetu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
