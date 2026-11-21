import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  MapPin, PlusCircle, LayoutDashboard, UserCheck, LogOut,
  LogIn, BarChart3, Shield, Menu, X, ChevronDown, CheckCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] font-sans">
      {/* Top Institutional Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-6 lg:px-8 border-b border-slate-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-200">NagarSetu Public Infrastructure Portal</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">नागरिकों और प्रशासन के बीच एक सेतु</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="hidden md:inline">24x7 Citizen Infrastructure Monitoring</span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Shield className="w-3 h-3 text-blue-400" /> Ground Verification Mandate
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-800 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 19h18" />
                <path d="M4 19V11a8 8 0 0 1 16 0v8" />
                <path d="M12 11v8" />
                <path d="M8 14v5" />
                <path d="M16 14v5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  NagarSetu
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">
                  नगरसेतु
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-none hidden sm:block">
                Bridging Citizens. Empowering Cities.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/map"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/map')
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              Smart Map
            </Link>

            <Link
              to="/accountability"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/accountability')
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              Public Accountability
            </Link>

            {/* Authenticated Links */}
            {isAuthenticated && user?.role === UserRole.CITIZEN && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-slate-100 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  Dashboard
                </Link>
                <Link
                  to="/my-reports"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-reports')
                      ? 'bg-slate-100 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  My Reports
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === UserRole.OFFICER && (
              <Link
                to="/officer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive('/officer')
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                Department Queue
              </Link>
            )}

            {isAuthenticated && user?.role === UserRole.ADMIN && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  Municipal Command
                </Link>
                <Link
                  to="/admin/issues"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/issues')
                      ? 'bg-slate-100 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  All Complaints
                </Link>
              </>
            )}
          </nav>

          {/* Right Action & User Controls */}
          <div className="flex items-center gap-3">
            {/* Report Button */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-200/80 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <MapPin className="w-4 h-4 text-blue-600" /> Smart Map
          </Link>
          <Link
            to="/accountability"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" /> Public Accountability
          </Link>
          {isAuthenticated && (
            <Link
              to={user?.role === UserRole.ADMIN ? '/admin' : user?.role === UserRole.OFFICER ? '/officer' : '/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-600" /> Dashboard
            </Link>
          )}
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white"
          >
            <PlusCircle className="w-4 h-4" /> Report Civic Issue
          </Link>
        </div>
      )}
    </header>
  );
};
