import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading NagarSetu session...</div>;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>© 2026 NagarSetu (नगरसेतु) — Bridging Citizens. Empowering Cities.</div>
          <div className="flex gap-4">
            <span className="text-cyan-400 font-semibold">FastAPI 2.0 Backend</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Computer Vision & Multilingual NLP</span>
            <span>•</span>
            <span className="text-purple-400 font-semibold">Predictive Civic Intelligence</span>
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
