import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { issueService, departmentService, citizenService } from '../services/api';
import { Issue, IssueStatus, Department, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  MapPin, Cpu, Clock, Building2, Shield, CheckCircle2, ArrowLeft,
  Users, CheckSquare, XCircle, Camera, AlertTriangle, Sparkles,
  MessageSquare, ShieldAlert
} from 'lucide-react';

const STATUS_STEPS = [
  IssueStatus.SUBMITTED,
  IssueStatus.AI_ANALYZED,
  IssueStatus.UNDER_REVIEW,
  IssueStatus.ASSIGNED,
  IssueStatus.IN_PROGRESS,
  IssueStatus.RESOLUTION_SUBMITTED,
  IssueStatus.RESOLVED,
];

export const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Priority override modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [newPriority, setNewPriority] = useState<number>(75);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  // Verification
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Support / Upvote
  const [supporting, setSupporting] = useState(false);

  const fetchIssue = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await issueService.getIssueById(parseInt(id));
      setIssue(data);
      setNewPriority(data.priority_score || 50);
    } catch {
      setError('Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
    departmentService.listDepartments().then(setDepartments).catch(console.error);
  }, [id]);

  const handleSupport = async () => {
    if (!issue) return;
    setSupporting(true);
    try {
      await citizenService.support(issue.id);
      await fetchIssue();
    } catch {
      alert('Could not add support endorsement.');
    } finally {
      setSupporting(false);
    }
  };

  const handleVerify = async (confirmed: boolean) => {
    if (!issue) return;
    setVerifying(true);
    try {
      await citizenService.verify(issue.id, confirmed, feedback, feedback);
      await fetchIssue();
      setFeedback('');
    } catch {
      alert('Verification action failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleOverridePriority = async () => {
    if (!issue) return;
    if (!overrideReason || overrideReason.length < 5) {
      alert('Please state a valid reason for adjusting the priority score.');
      return;
    }
    setOverrideSubmitting(true);
    try {
      await issueService.overridePriority(issue.id, newPriority, overrideReason);
      setShowOverrideModal(false);
      setOverrideReason('');
      await fetchIssue();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to override priority.');
    } finally {
      setOverrideSubmitting(false);
    }
  };

  const handleRequestInspection = async () => {
    if (!issue) return;
    try {
      await issueService.requestInspection(issue.id, 'Ground inspection requested via ticket details.');
      alert('Independent municipal inspection queued.');
      await fetchIssue();
    } catch {
      alert('Could not schedule inspection.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading complaint ticket audit details...
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-400 font-semibold">{error || 'Complaint not found'}</p>
        <Link to="/map" className="inline-flex items-center gap-2 text-cyan-400 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Smart Map
        </Link>
      </div>
    );
  }

  // Parse AI comparison JSON if present
  let aiComparisonObj = null;
  if (issue.resolution_ai_comparison) {
    try {
      aiComparisonObj = JSON.parse(issue.resolution_ai_comparison);
    } catch {
      // ignore parse
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <Link to="/map" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Smart Map
        </Link>

        {/* Header Block */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                Ticket #{issue.id} • {issue.issue_type}
              </span>
              <PriorityBadge score={issue.priority_score} severity={issue.severity} />
              <StatusBadge status={issue.status} />
              {issue.sla_hours && (
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                  SLA: {issue.sla_hours}h
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{issue.title}</h1>
            <p className="text-sm text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              {issue.address || `GPS Coordinates (${issue.latitude}, ${issue.longitude})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSupport}
              disabled={supporting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4" />
              Support Issue ({issue.support_count || 1})
            </button>

            <Link
              to={`/issue/${issue.id}/track`}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Clock className="w-4 h-4" /> Live Tracking
            </Link>

            {(user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER) && (
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800 text-xs font-bold transition-colors"
              >
                Adjust Priority
              </button>
            )}
          </div>
        </div>

        {/* 1. CITIZEN GROUND VERIFICATION CALLOUT (IF RESOLUTION SUBMITTED) */}
        {issue.status === IssueStatus.RESOLUTION_SUBMITTED && (
          <div className="p-6 rounded-2xl bg-teal-950/40 border border-teal-500/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-base">
                <CheckSquare className="w-5 h-5 text-teal-400" />
                <span>Ground Verification Required</span>
              </div>
              <span className="text-xs bg-teal-900 text-teal-200 px-3 py-1 rounded-full font-mono font-bold">
                Awaiting Citizen Confirmation
              </span>
            </div>
            <p className="text-sm text-slate-300">
              Department officers have completed work on this civic defect and submitted after-repair evidence.
              Please inspect the photographic proof below and confirm whether the problem is fixed.
            </p>

            {user?.role === UserRole.CITIZEN && (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Citizen feedback note (e.g., Cleanly asphalted / Debris left behind)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVerify(true)}
                    disabled={verifying}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Fixed & Close Ticket
                  </button>
                  <button
                    onClick={() => handleVerify(false)}
                    disabled={verifying}
                    className="px-4 py-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold text-xs flex items-center gap-1.5 border border-rose-700"
                  >
                    <XCircle className="w-4 h-4" /> Reopen (Defect Persists)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. BEFORE VS AFTER REPAIR EVIDENCE COMPARISON */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            Ground Photographic Evidence & AI Verification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-400">Original Defect Photograph</span>
                <span className="text-slate-400 font-mono">Reported Frame</span>
              </div>
              <div className="h-64 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img
                  src={issue.images?.[0]?.annotated_image_path || issue.images?.[0]?.original_image_path || '/uploads/original/sample_infra.jpg'}
                  alt="Original Defect"
                  className="w-full h-full object-cover"
                />
                {issue.ai_confidence && (
                  <div className="absolute top-3 left-3 bg-slate-950/90 text-cyan-300 text-xs px-2.5 py-1 rounded-md border border-cyan-800 font-mono">
                    Detection: {intToPct(issue.ai_confidence)}%
                  </div>
                )}
              </div>
            </div>

            {/* After Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">After-Repair Remediation Photo</span>
                <span className="text-slate-400 font-mono">Officer Proof</span>
              </div>
              <div className="h-64 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                {issue.resolution_image_path ? (
                  <img
                    src={issue.resolution_image_path}
                    alt="Remediation Proof"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">Remediation in progress. Department repair photograph pending upload.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Comparison Assessment Callout */}
          {aiComparisonObj && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Ground Remediation Assessment
                </span>
                <span className="text-cyan-300 font-mono font-bold">
                  Remediation Confidence: {intToPct(aiComparisonObj.repair_confidence)}%
                </span>
              </div>
              <p className="text-slate-300">{aiComparisonObj.ai_assessment_notes}</p>
              <div className="text-[11px] text-slate-500 italic">
                * Note: AI evidence assessment assists decision making; citizen ground sign-off is the final authority.
              </div>
            </div>
          )}

          {issue.resolution_notes && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <strong className="text-slate-300">Department Repair Log:</strong>
              <p className="text-slate-400">{issue.resolution_notes}</p>
            </div>
          )}
        </div>

        {/* 3. DETAILS & AUDIT TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Complaint Attributes & Explanation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-cyan-400" />
                Explainable Priority Breakdown
              </h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {issue.priority_explanation || `Priority Score: ${issue.priority_score}/100 based on standard weighted defect criteria.`}
              </div>

              {issue.priority_override_reason && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200">
                  <strong className="block font-semibold">Priority Adjustment Notice:</strong>
                  {issue.priority_override_reason}
                </div>
              )}

              {issue.description && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Citizen Description</h4>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              )}
            </div>

            {/* Complete Status History Audit Log */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Immutable NagarSetu Audit Log
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {issue.status_history?.map((hist) => (
                  <div key={hist.id} className="relative pl-8 space-y-1">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-300 font-mono">
                        {hist.new_status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-500 font-mono">{new Date(hist.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-300">{hist.notes || 'Status updated.'}</p>
                    <p className="text-[10px] text-slate-500">
                      Action by: {hist.changed_by?.full_name || 'System Auto-Triage'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Routing & Department Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Assigned Department
              </h3>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400">Department Name:</span>
                <p className="font-bold text-white text-sm">{issue.department?.name || 'Pending Route'}</p>
                <p className="text-cyan-400 font-mono">{issue.department?.code}</p>
              </div>

              {issue.assigned_officer && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <span className="text-slate-400">Assigned Field Engineer:</span>
                  <p className="font-bold text-white">{issue.assigned_officer.full_name}</p>
                  <p className="text-slate-500">{issue.assigned_officer.email}</p>
                </div>
              )}

              <button
                onClick={handleRequestInspection}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Request Independent Physical Audit
              </button>
            </div>
          </div>
        </div>

        {/* 4. PRIORITY OVERRIDE MODAL */}
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-600/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Override Priority Score
              </h4>
              <p className="text-xs text-slate-400">
                Adjust priority based on special conditions (e.g. VVIP route, school peak hours). Recorded in audit trail.
              </p>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">New Score (0-100): {newPriority}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newPriority}
                  onChange={(e) => setNewPriority(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Official Justification (Mandatory):</label>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State reason for overriding AI priority..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOverridePriority}
                  disabled={overrideSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function intToPct(val: number): number {
  return Math.round(val <= 1.0 ? val * 100 : val);
}

function FileTextIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
