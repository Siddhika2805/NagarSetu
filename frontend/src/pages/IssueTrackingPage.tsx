import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { citizenService } from '../services/api';
import { Issue, IssueStatus } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowLeft, Clock, CheckCircle2, ShieldCheck, MapPin, Building2,
  AlertTriangle, CheckSquare, XCircle, Users, RefreshCw
} from 'lucide-react';

const TRACKING_FLOW = [
  IssueStatus.SUBMITTED,
  IssueStatus.AI_ANALYZED,
  IssueStatus.UNDER_REVIEW,
  IssueStatus.ASSIGNED,
  IssueStatus.IN_PROGRESS,
  IssueStatus.RESOLUTION_SUBMITTED,
  IssueStatus.RESOLVED,
];

export const IssueTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadTracking = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([citizenService.details(+id), citizenService.timeline(+id)])
      .then(([i, t]) => {
        setIssue(i);
        setTimeline(t || []);
      })
      .catch(() => setError('Unable to load this complaint tracking timeline.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTracking();
  }, [id]);

  const handleVerify = async (confirmed: boolean) => {
    if (!issue) return;
    setVerifying(true);
    try {
      await citizenService.verify(issue.id, confirmed, feedback, feedback);
      loadTracking();
      setFeedback('');
    } catch {
      alert('Verification action failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium">Tracking complaint resolution lifecycle...</span>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error || 'Complaint not found'}</p>
        <Link to="/dashboard" className="text-blue-600 text-xs font-semibold hover:underline">
          Return to Citizen Dashboard
        </Link>
      </div>
    );
  }

  const currentIdx = TRACKING_FLOW.indexOf(issue.status);

  return (
    <div className="bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to={`/issue/${issue.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Issue Overview
        </Link>

        {/* Ticket Header Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">Ticket #{issue.id}</span>
              <StatusBadge status={issue.status} />
              <PriorityBadge score={issue.priority_score} severity={issue.severity} />
            </div>
            {issue.department && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {issue.department.name}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900">{issue.title}</h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {issue.address || 'GPS Coordinates on record'}
          </p>
        </div>

        {/* Horizontal Lifecycle Steps */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            7-Stage Resolution Lifecycle Progress
          </h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[620px] justify-between relative before:absolute before:left-3 before:right-3 before:top-4 before:h-0.5 before:bg-slate-200 before:-z-0">
              {TRACKING_FLOW.map((st, idx) => {
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;
                return (
                  <div key={st} className="flex flex-col items-center text-center space-y-2 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold max-w-[80px] leading-tight ${
                        isCurrent ? 'text-blue-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Timeline Events */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Official Resolution Event Log</span>
          </h2>

          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {timeline.map((evt) => (
              <div key={evt.id} className="relative pl-8 space-y-1">
                <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 font-mono">
                    {evt.new_status?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(evt.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{evt.notes || 'Status updated by department.'}</p>
                {evt.changed_by && (
                  <p className="text-[11px] text-slate-400">
                    Logged by: {evt.changed_by.full_name} ({evt.changed_by.role})
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
