import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { issueService, departmentService } from '../services/api';
import { Issue, IssueStatus, Department } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { MapPin, Cpu, Clock, Building, Shield, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

const STATUS_STEPS = [
  IssueStatus.REPORTED,
  IssueStatus.AI_ANALYZED,
  IssueStatus.UNDER_REVIEW,
  IssueStatus.ASSIGNED,
  IssueStatus.IN_PROGRESS,
  IssueStatus.RESOLVED,
  IssueStatus.CLOSED,
];

export const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Officer / Admin Status Change Form State
  const [newStatus, setNewStatus] = useState<IssueStatus>(IssueStatus.IN_PROGRESS);
  const [notes, setNotes] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const fetchIssue = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await issueService.getIssueById(parseInt(id));
      setIssue(data);
      setNewStatus(data.status);
      if (data.department_id) setSelectedDeptId(data.department_id);
    } catch (err: any) {
      setError('Failed to fetch issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
    departmentService.listDepartments().then(setDepartments).catch(console.error);
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!issue) return;
    setUpdating(true);
    try {
      await issueService.updateStatus(issue.id, newStatus, notes);
      setNotes('');
      await fetchIssue();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignDepartment = async () => {
    if (!issue || !selectedDeptId) return;
    setUpdating(true);
    try {
      await issueService.assignDepartment(issue.id, selectedDeptId, notes);
      setNotes('');
      await fetchIssue();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reassign department.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading issue ticket details...
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-400 font-semibold">{error || 'Issue not found'}</p>
        <Link to="/map" className="inline-flex items-center gap-2 text-cyan-400 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </Link>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(issue.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div>
        <Link to="/map" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Issue Map
        </Link>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                Issue #{issue.id} • {issue.issue_type}
              </span>
              <PriorityBadge score={issue.priority_score} severity={issue.severity} />
              <StatusBadge status={issue.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{issue.title}</h1>
            <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              {issue.address || `GPS (${issue.latitude}, ${issue.longitude})`}
            </p>
          </div>

          <Link to={`/issue/${issue.id}/track`} className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm">Track Issue</Link>

          <div className="text-right">
            <div className="text-xs text-slate-400">Reported On</div>
            <div className="text-sm font-semibold text-white">
              {new Date(issue.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Lifecycle Status Stepper */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
          Lifecycle Progression History
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {STATUS_STEPS.map((step, idx) => {
            const isPassed = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div
                key={step}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold shadow-lg shadow-cyan-500/10'
                    : isPassed
                    ? 'bg-slate-900 border-slate-700 text-emerald-400'
                    : 'bg-slate-950/50 border-slate-800 text-slate-600'
                }`}
              >
                <div className="text-[10px] font-semibold tracking-wider">STEP {idx + 1}</div>
                <div className="text-xs mt-1 truncate">{step.replace('_', ' ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Images & Inspection Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Inspection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              AI Object Detection Visual Analysis
            </h3>

            {issue.images && issue.images.length > 0 && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src={issue.images[0].annotated_image_path || issue.images[0].original_image_path}
                    alt={issue.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                    Confidence: {(issue.ai_confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">AI Confidence</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{(issue.ai_confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">Priority Score</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{issue.priority_score} / 100</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">Duplicates Linked</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">{issue.duplicate_count} Reports</div>
                  </div>
                </div>
              </div>
            )}

            {issue.description && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-300 mb-1">Citizen Description</h4>
                <p className="text-sm text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                  {issue.description}
                </p>
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Official Audit Log & History Notes
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {issue.status_history.map((hist) => (
                <div key={hist.id} className="relative pl-8 space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cyan-300">
                      {hist.new_status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500">{new Date(hist.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-300">{hist.notes}</p>
                  <p className="text-[10px] text-slate-500">Updated by: {hist.changed_by.full_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Department Assignment & Officer Controls */}
        <div className="space-y-6">
          {/* Department Information */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-400" />
              Assigned Department
            </h3>

            {issue.department ? (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-cyan-300">{issue.department.name}</div>
                <div className="text-xs text-slate-400">Code: {issue.department.code}</div>
                {issue.department.contact_email && (
                  <div className="text-xs text-slate-400">Contact: {issue.department.contact_email}</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                Unassigned municipal department
              </div>
            )}
          </div>

          {/* Admin / Officer Controls Panel */}
          {user && (user.role === UserRole.ADMIN || user.role === UserRole.OFFICER) && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Administrative Control Panel
              </h3>

              {/* Status Update Control */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {STATUS_STEPS.map((st) => (
                      <option key={st} value={st}>{st.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Progress Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter dispatch notes or completion details..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {updating ? 'Updating...' : 'Commit Status Progress'}
                </button>
              </div>

              {/* Reassign Department Control (Admin Only) */}
              {user.role === UserRole.ADMIN && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Reassign Department</label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value={0}>Select Department...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAssignDepartment}
                    disabled={updating || !selectedDeptId}
                    className="w-full py-2.5 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    Reassign Department
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
