import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';

import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { PublicIssueMapPage } from './pages/PublicIssueMapPage';
import { PublicAccountabilityPage } from './pages/PublicAccountabilityPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminIssueManagementPage } from './pages/AdminIssueManagementPage';
import { OfficerDashboardPage } from './pages/OfficerDashboardPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { IssueTrackingPage } from './pages/IssueTrackingPage';
import { Shield, Building2, MapPin, BarChart3, HelpCircle } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/map" element={<PublicIssueMapPage />} />
          <Route path="/accountability" element={<PublicAccountabilityPage />} />
          <Route path="/issue/:id" element={<IssueDetailsPage />} />
          <Route path="/issue/:id/track" element={<ProtectedRoute roles={[UserRole.CITIZEN]}><IssueTrackingPage /></ProtectedRoute>} />

          {/* Citizen Routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={[UserRole.CITIZEN]}><CitizenDashboardPage /></ProtectedRoute>} />
          <Route
            path="/report"
            element={
              <ProtectedRoute roles={[UserRole.CITIZEN, UserRole.ADMIN]}>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute roles={[UserRole.CITIZEN]}>
                <MyReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issues"
            element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                <AdminIssueManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Department Officer Routes */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute roles={[UserRole.OFFICER]}>
                <OfficerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Modern High-Trust Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs">
                  NS
                </div>
                <span>NagarSetu (नगरसेतु)</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Empowering urban local bodies and citizens through explainable AI defect triage, spatial deduplication, and citizen-verified ground resolutions.
              </p>
              <div className="text-[11px] text-slate-500">
                National Civic Infrastructure Charter • Standard SLA Compliance
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Citizen Services</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/report" className="hover:text-white transition-colors">Report Public Infrastructure Defect</Link></li>
                <li><Link to="/map" className="hover:text-white transition-colors">Live Municipal Issue Map</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Track Ground Repairs</Link></li>
                <li><Link to="/accountability" className="hover:text-white transition-colors">Public Department Scorecards</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Municipal Departments</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Roads & Infrastructure Maintenance (PWD)</li>
                <li>Water Supply & Pipeline Management (Jal Board)</li>
                <li>Solid Waste & Sanitation (Swachhata)</li>
                <li>Drainage, Culverts & Flood Mitigation</li>
                <li>Street Lighting & DISCOM Electrical Safety</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Governance & Privacy</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Citizen PII Protected
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  All public issue maps redact personal identifiers. Only verified ground evidence and municipal performance metrics are publicly accessible.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 NagarSetu. Bridging Citizens. Empowering Cities.
            </div>
            <div className="flex items-center gap-4">
              <span>SLA Target: 24h Critical / 48h High</span>
              <span>•</span>
              <span>100% Photographic Audit Trail</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
