import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { issueService, departmentService, citizenService } from '../services/api';
import { Issue, IssueStatus, Department, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  MapPin, Cpu, Clock, Building2, Shield, CheckCircle2, ArrowLeft,
  Users, CheckSquare, XCircle, Camera, AlertTriangle,
  MessageSquare, ShieldAlert, FileText, Check
} from 'lucide-react';

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
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium">Loading complaint ticket audit details...</span>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error || 'Complaint not found'}</p>
        <Link to="/map" className="inline-flex items-center gap-2 text-blue-600 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Smart Map
        </Link>
      </div>
    );
  }

  let aiComparisonObj = null;
  if (issue.resolution_ai_comparison) {
    try {
      aiComparisonObj = JSON.parse(issue.resolution_ai_comparison);
    } catch {
      // ignore parse
    }
  }

  return (
    <div className="bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <Link to="/map" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Smart Map
        </Link>

        {/* Header Block */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">
                Ticket #{issue.id} • {issue.issue_type}
              </span>
              <PriorityBadge score={issue.priority_score} severity={issue.severity} />
              <StatusBadge status={issue.status} />
              {issue.sla_hours && (
                <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  SLA: {issue.sla_hours}h
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{issue.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {issue.address || `GPS Coordinates (${issue.latitude}, ${issue.longitude})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSupport}
              disabled={supporting}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Endorse ({issue.support_count || 1})</span>
            </button>

            <Link
              to={`/issue/${issue.id}/track`}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Lifecycle Tracking</span>
            </Link>

            {(user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER) && (
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-colors"
              >
                Adjust Priority
              </button>
            )}
          </div>
        </div>

        {/* 1. CITIZEN GROUND VERIFICATION CALLOUT (IF RESOLUTION SUBMITTED) */}
        {issue.status === IssueStatus.RESOLUTION_SUBMITTED && (
          <div className="p-6 rounded-xl bg-blue-50/80 border border-blue-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <CheckSquare className="w-4 h-4 text-blue-700" />
                <span>Ground Verification Required</span>
              </div>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded border border-blue-200 font-semibold">
                Awaiting Citizen Confirmation
              </span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">
              Department officers have completed work on this civic defect and submitted after-repair evidence.
              Please inspect the photographic proof below and confirm whether the problem has been fixed.
            </p>

            {user?.role === UserRole.CITIZEN && (
              <div className="space-y-3 pt-1">
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Citizen feedback note (e.g., Cleanly asphalted / Debris left behind)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVerify(true)}
                    disabled={verifying}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Fixed & Close Ticket</span>
                  </button>
                  <button
                    onClick={() => handleVerify(false)}
                    disabled={verifying}
                    className="px-4 py-2 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reopen (Defect Persists)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. BEFORE VS AFTER REPAIR EVIDENCE COMPARISON */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Ground Photographic Evidence & AI Verification</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Original Defect Photograph</span>
                <span className="text-slate-400 font-mono text-[11px]">Reported Frame</span>
              </div>
              <div className="h-60 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
                <img
                  src={issue.images?.[0]?.annotated_image_path || issue.images?.[0]?.original_image_path || '/uploads/original/sample_infra.jpg'}
                  alt="Original Defect"
                  className="w-full h-full object-cover"
                />
                {issue.ai_confidence && (
                  <div className="absolute top-3 left-3 bg-white/95 text-slate-900 text-xs px-2.5 py-1 rounded border border-slate-200 font-mono font-semibold shadow-xs">
                    Detection: {intToPct(issue.ai_confidence)}%
                  </div>
                )}
              </div>
            </div>

            {/* After Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-800">After-Repair Remediation Photo</span>
                <span className="text-slate-400 font-mono text-[11px]">Officer Proof</span>
              </div>
              <div className="h-60 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative">
                {issue.resolution_image_path ? (
                  <img
                    src={issue.resolution_image_path}
                    alt="Remediation Proof"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-xs">Remediation in progress. Department repair photograph pending upload.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Comparison Assessment Callout */}
          {aiComparisonObj && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-blue-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> AI Ground Remediation Assessment
                </span>
                <span className="text-emerald-700 font-mono font-bold">
                  Remediation Confidence: {intToPct(aiComparisonObj.repair_confidence)}%
                </span>
              </div>
              <p className="text-slate-700">{aiComparisonObj.ai_assessment_notes}</p>
              <div className="text-[11px] text-slate-400 italic">
                * Note: AI evidence assessment assists decision making; citizen ground sign-off is the final authority.
              </div>
            </div>
          )}

          {issue.resolution_notes && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <strong className="text-slate-800">Department Repair Log:</strong>
              <p className="text-slate-600">{issue.resolution_notes}</p>
            </div>
          )}
        </div>

        {/* 3. DETAILS & AUDIT TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Complaint Attributes & Explanation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Explainable Priority Breakdown</span>
              </h3>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {issue.priority_explanation || `Priority Score: ${issue.priority_score}/100 based on standard weighted defect criteria.`}
              </div>

              {issue.priority_override_reason && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <strong className="block font-semibold">Priority Adjustment Notice:</strong>
                  {issue.priority_override_reason}
                </div>
              )}

              {issue.description && (
                <div className="space-y-1 pt-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citizen Description</h4>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              )}
            </div>

            {/* Complete Status History Audit Log */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Immutable NagarSetu Audit Log</span>
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {issue.status_history?.map((hist) => (
                  <div key={hist.id} className="relative pl-8 space-y-1">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 font-mono">
                        {hist.new_status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{new Date(hist.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-slate-600">{hist.notes || 'Status updated.'}</p>
                    <p className="text-[11px] text-slate-400">
                      Action by: {hist.changed_by?.full_name || 'System Auto-Triage'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Routing & Department Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Assigned Department</span>
              </h3>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="text-slate-500">Department:</span>
                <p className="font-bold text-slate-900 text-sm">{issue.department?.name || 'Pending Route'}</p>
                <p className="text-blue-700 font-mono text-xs font-semibold">{issue.department?.code}</p>
              </div>

              {issue.assigned_officer && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="text-slate-500">Assigned Field Engineer:</span>
                  <p className="font-bold text-slate-900">{issue.assigned_officer.full_name}</p>
                  <p className="text-slate-500">{issue.assigned_officer.email}</p>
                </div>
              )}

              <button
                onClick={handleRequestInspection}
                className="w-full py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Request Independent Physical Audit</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. PRIORITY OVERRIDE MODAL */}
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Override Priority Score</span>
                </h4>
                <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adjust priority based on special conditions (e.g. VVIP route, school peak hours). Recorded in immutable audit trail.
              </p>

              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-medium">New Score (0-100): <strong className="font-mono text-blue-700">{newPriority}</strong></label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newPriority}
                  onChange={(e) => setNewPriority(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-medium">Official Justification (Mandatory):</label>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State reason for overriding AI priority..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOverridePriority}
                  disabled={overrideSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
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
