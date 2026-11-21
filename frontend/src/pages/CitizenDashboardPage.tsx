import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { citizenService } from '../services/api';
import { Issue, IssueStatus } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  PlusCircle, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  ShieldCheck, Eye, RefreshCw, MapPin, XCircle, CheckSquare,
  FileText, MessageSquare
} from 'lucide-react';

const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const CitizenDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verification Modal State
  const [verifyingIssue, setVerifyingIssue] = useState<Issue | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([citizenService.stats(), citizenService.reports({ limit: 12 })])
      .then(([s, r]) => {
        setStats(s);
        setReports(r);
      })
      .catch(() => setError('Unable to load your citizen dashboard. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmResolution = async (confirmed: boolean) => {
    if (!verifyingIssue) return;
    setActionLoading(true);
    try {
      await citizenService.verify(verifyingIssue.id, confirmed, feedbackNotes, reopenReason);
      setVerifyingIssue(null);
      setFeedbackNotes('');
      setReopenReason('');
      fetchDashboardData();
    } catch {
      alert('Failed to process verification response. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium">Loading citizen dashboard...</span>
        </div>
      </div>
    );
  }

  // Pending citizen verifications
  const pendingVerifications = reports.filter(
    (i) => i.status === IssueStatus.RESOLUTION_SUBMITTED || i.status === IssueStatus.CITIZEN_VERIFICATION
  );

  return (
    <div className="bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-1.5">
              <span>NAGARSETU CITIZEN WORKSPACE</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor your lodged civic reports, track field repair progress, and confirm physical ground resolutions.
            </p>
          </div>
          <Link
            to="/report"
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Action Center: Pending Verifications Alert */}
        {pendingVerifications.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900">
                  {pendingVerifications.length} Repair(s) Awaiting Your Physical Verification
                </h3>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Action Required
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Municipal officers have submitted repair photographic evidence for your report(s).
              As the reporting citizen, your verification is required before tickets can be officially closed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {pendingVerifications.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-amber-200/80 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">#{item.id}: {item.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.address}</div>
                  </div>
                  <button
                    onClick={() => setVerifyingIssue(item)}
                    className="shrink-0 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Verify Repair</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Reports</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {stats?.total_issues || reports.length || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Lodged by your account</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</div>
            <div className="text-2xl font-bold text-amber-700 mt-1 font-mono">
              {stats?.in_progress || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Assigned to field teams</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Verify</div>
            <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
              {pendingVerifications.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Pending your sign-off</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
              {stats?.resolved || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Confirmed closed</div>
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Lodged Civic Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time tracking of issues submitted from your account</p>
            </div>
            <Link
              to="/my-reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No Complaints Lodged Yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Notice a road pothole, garbage pile, or water leakage? Submit a photo or voice report in seconds.
              </p>
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Report Issue
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">#{item.id}</span>
                      <StatusBadge status={item.status} />
                      <PriorityBadge score={item.priority_score} severity={item.severity} />
                      {item.department && (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.department.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-xs">{item.address || 'GPS Coordinates captured'}</span>
                      </span>
                      <span>Lodged: {formatDate(item.created_at)}</span>
                      {item.support_count > 1 && (
                        <span className="text-blue-700 font-medium">
                          {item.support_count} citizens endorsed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === IssueStatus.RESOLUTION_SUBMITTED && (
                      <button
                        onClick={() => setVerifyingIssue(item)}
                        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Verify Fix</span>
                      </button>
                    )}
                    <Link
                      to={`/issue/${item.id}`}
                      className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Citizen Ground Resolution Verification Modal */}
      {verifyingIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Ground Audit Mandate</span>
                <h3 className="text-base font-bold text-slate-900">Verify Resolution for #{verifyingIssue.id}</h3>
              </div>
              <button
                onClick={() => setVerifyingIssue(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-600 leading-relaxed">
                The municipal department has uploaded repair photographic evidence and completed work on this complaint.
                Please review the evidence below and confirm if the defect has been remediated on ground.
              </div>

              {/* Evidence Comparison Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-600">Initial Defect Photo</div>
                  <div className="h-28 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {verifyingIssue.images && verifyingIssue.images[0] ? (
                      <img
                        src={verifyingIssue.images[0].original_image_path}
                        alt="Initial defect"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Photo on record</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-800">Officer Repair Evidence</div>
                  <div className="h-28 rounded-lg bg-emerald-50 border border-emerald-200 overflow-hidden flex items-center justify-center">
                    {verifyingIssue.resolution_image_path ? (
                      <img
                        src={verifyingIssue.resolution_image_path}
                        alt="Resolution proof"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs text-emerald-700">Repair photo submitted</span>
                    )}
                  </div>
                </div>
              </div>

              {verifyingIssue.resolution_notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Officer Work Notes: </span>
                  <span className="text-slate-600">{verifyingIssue.resolution_notes}</span>
                </div>
              )}

              {/* Feedback Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Verification Feedback (Optional)
                </label>
                <textarea
                  rows={2}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="e.g., Visited site, asphalt patch is completed and road is smooth."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  If Reopening, State Reason:
                </label>
                <input
                  type="text"
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g., Pothole only partially filled, road still damaged."
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => handleConfirmResolution(true)}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Resolved</span>
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleConfirmResolution(false)}
                className="w-full py-2.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reopen Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
