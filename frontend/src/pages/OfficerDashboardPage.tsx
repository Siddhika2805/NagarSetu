import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { officerService, issueService } from '../services/api';
import { Issue, IssueStatus, SeverityLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Building2, CheckCircle2, Clock, AlertTriangle, Upload, Eye,
  RefreshCw, ShieldAlert, FileText, ArrowRight, XCircle, CheckSquare,
  Camera, Check
} from 'lucide-react';

const formatDateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'OVERDUE' | 'IN_PROGRESS'>('ALL');

  // Submit Resolution Evidence Modal
  const [resolvingIssue, setResolvingIssue] = useState<Issue | null>(null);
  const [repairPhotoFile, setRepairPhotoFile] = useState<File | null>(null);
  const [repairPhotoPreview, setRepairPhotoPreview] = useState<string | null>(null);
  const [repairNotes, setRepairNotes] = useState('');
  const [submittingRepair, setSubmittingRepair] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDepartmentQueue = async () => {
    setLoading(true);
    try {
      const data = await officerService.assigned();
      setIssues(data);
    } catch {
      try {
        const fallback = await issueService.listIssues({ dept_id: user?.department_id || undefined });
        setIssues(fallback);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentQueue();
  }, [user]);

  const handleAccept = async (id: number) => {
    try {
      await officerService.accept(id);
      fetchDepartmentQueue();
    } catch {
      alert('Failed to accept complaint.');
    }
  };

  const handleRepairPhotoSelect = (file: File | null) => {
    if (!file) return;
    setRepairPhotoFile(file);
    setRepairPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmitResolutionEvidence = async () => {
    if (!resolvingIssue) return;
    if (!repairNotes || repairNotes.length < 5) {
      setModalError('Please describe the physical remediation steps undertaken.');
      return;
    }
    setSubmittingRepair(true);
    setModalError('');

    try {
      let resolutionUrl = '/uploads/original/sample_infra.jpg';
      if (repairPhotoFile) {
        try {
          const uploaded = await issueService.analyzeImage(repairPhotoFile);
          resolutionUrl = uploaded.original_image_url;
        } catch {
          // Fallback path
        }
      }

      await officerService.submitResolution(resolvingIssue.id, resolutionUrl, repairNotes);
      setResolvingIssue(null);
      setRepairPhotoFile(null);
      setRepairPhotoPreview(null);
      setRepairNotes('');
      fetchDepartmentQueue();
    } catch {
      setModalError('Unable to submit resolution evidence. Please try again.');
    } finally {
      setSubmittingRepair(false);
    }
  };

  const now = new Date();
  const overdueCount = issues.filter(
    (i) => i.sla_deadline && new Date(i.sla_deadline) < now && i.status !== IssueStatus.RESOLVED && i.status !== IssueStatus.CLOSED
  ).length;

  const criticalCount = issues.filter(
    (i) => String(i.severity).toUpperCase() === 'CRITICAL' || String(i.severity).toUpperCase() === 'HIGH'
  ).length;

  const inProgressCount = issues.filter(
    (i) => i.status === IssueStatus.IN_PROGRESS || i.status === IssueStatus.ACCEPTED
  ).length;

  const filteredIssues = issues.filter((i) => {
    if (filter === 'CRITICAL') return String(i.severity).toUpperCase() === 'CRITICAL' || String(i.severity).toUpperCase() === 'HIGH';
    if (filter === 'OVERDUE') return i.sla_deadline && new Date(i.sla_deadline) < now && i.status !== IssueStatus.RESOLVED;
    if (filter === 'IN_PROGRESS') return i.status === IssueStatus.IN_PROGRESS || i.status === IssueStatus.ACCEPTED;
    return true;
  });

  return (
    <div className="bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span>OFFICIAL DEPARTMENT OPERATIONAL QUEUE</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {user?.department?.name || 'Department Infrastructure Queue'}
            </h1>
            <p className="text-xs text-slate-500">
              Responsible Officer: <strong className="text-slate-800 font-medium">{user?.full_name}</strong> • Strict SLA Adherence Mandate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDepartmentQueue}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/map"
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>View On Smart Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Queue Total</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{issues.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Assigned to department</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Critical / High</div>
            <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">{criticalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">24h / 48h priority target</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active In Progress</div>
            <div className="text-2xl font-bold text-amber-700 mt-1 font-mono">{inProgressCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Field teams dispatched</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">SLA Overdue</div>
            <div className="text-2xl font-bold text-rose-800 mt-1 font-mono">{overdueCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Breached deadline</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'CRITICAL', 'OVERDUE', 'IN_PROGRESS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                filter === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' && `All Issues (${issues.length})`}
              {tab === 'CRITICAL' && `Critical & High (${criticalCount})`}
              {tab === 'OVERDUE' && `SLA Overdue (${overdueCount})`}
              {tab === 'IN_PROGRESS' && `In Progress (${inProgressCount})`}
            </button>
          ))}
        </div>

        {/* Issues Queue Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Department Work Orders ({filteredIssues.length})
            </h2>
            <span className="text-xs text-slate-500">Sorted by Priority & Urgency</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
              <div className="text-xs font-medium">Updating work queue...</div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No Complaints Match Filter</div>
              <p className="text-xs text-slate-400">All work orders in this category have been addressed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => {
                const isOverdue =
                  issue.sla_deadline &&
                  new Date(issue.sla_deadline) < now &&
                  issue.status !== IssueStatus.RESOLVED &&
                  issue.status !== IssueStatus.CLOSED;

                return (
                  <div
                    key={issue.id}
                    className={`p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isOverdue ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : ''
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{issue.id}</span>
                        <StatusBadge status={issue.status} />
                        <PriorityBadge score={issue.priority_score} severity={issue.severity} />
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <Clock className="w-3 h-3" /> SLA BREACHED
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 truncate">{issue.title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>Address: {issue.address || 'GPS Coordinates captured'}</span>
                        <span>SLA Target: {issue.sla_hours}h</span>
                        {issue.sla_deadline && (
                          <span>Deadline: {formatDateTime(issue.sla_deadline)}</span>
                        )}
                        {issue.support_count > 1 && (
                          <span className="text-blue-700 font-medium">{issue.support_count} citizens endorsed</span>
                        )}
                      </div>

                      {issue.priority_explanation && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100 max-w-xl">
                          Priority Logic: {issue.priority_explanation}
                        </p>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {issue.status === IssueStatus.AI_ANALYZED || issue.status === IssueStatus.SUBMITTED ? (
                        <button
                          onClick={() => handleAccept(issue.id)}
                          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Assignment</span>
                        </button>
                      ) : null}

                      {issue.status === IssueStatus.ACCEPTED ||
                      issue.status === IssueStatus.IN_PROGRESS ||
                      issue.status === IssueStatus.AWAITING_INSPECTION ||
                      issue.status === IssueStatus.REOPENED ? (
                        <button
                          onClick={() => setResolvingIssue(issue)}
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Resolution Evidence</span>
                        </button>
                      ) : null}

                      <Link
                        to={`/issue/${issue.id}`}
                        className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submit Resolution Photographic Proof Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Ground Audit Evidence</span>
                <h3 className="text-base font-bold text-slate-900">Submit Repair Proof for #{resolvingIssue.id}</h3>
              </div>
              <button
                onClick={() => setResolvingIssue(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Physical Repair Photograph
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  {repairPhotoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={repairPhotoPreview}
                        alt="Repair preview"
                        className="h-36 mx-auto object-cover rounded-md border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRepairPhotoFile(null);
                          setRepairPhotoPreview(null);
                        }}
                        className="text-xs text-rose-600 font-semibold hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-1 block">
                      <Camera className="w-7 h-7 text-slate-400 mx-auto" />
                      <div className="text-xs font-semibold text-blue-600">Click to capture or upload repair photo</div>
                      <div className="text-[11px] text-slate-400">JPG, PNG up to 10MB</div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleRepairPhotoSelect(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Remediation Notes (Mandatory)
                </label>
                <textarea
                  rows={3}
                  required
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="e.g., Pothole excavated, sub-base compacted, hot-mix asphalt laid and roller compacted. Road cleared for traffic."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                <div className="font-semibold">Automated AI Evidence Comparison:</div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Upon submission, NagarSetu AI will compute structural image differencing against the original defect photo and notify the citizen to confirm the fix.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResolvingIssue(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingRepair}
                onClick={handleSubmitResolutionEvidence}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{submittingRepair ? 'Uploading Evidence...' : 'Submit Resolution Proof'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
