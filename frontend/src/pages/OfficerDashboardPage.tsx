import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../services/api';
import { Issue, IssueStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Building, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartmentIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.listIssues({
        dept_id: user?.department_id || undefined,
      });
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentIssues();
  }, [user]);

  const handleQuickStatusUpdate = async (issueId: number, nextStatus: IssueStatus) => {
    try {
      await issueService.updateStatus(issueId, nextStatus, `Updated by department officer ${user?.full_name}`);
      await fetchDepartmentIssues();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
          <Building className="w-3.5 h-3.5" /> DEPARTMENT OFFICER PORTAL
        </div>
        <h1 className="text-3xl font-extrabold text-white">Assigned Department Tasks</h1>
        <p className="text-slate-400 text-sm mt-1">Review tickets assigned to your department, dispatch repair teams, and mark issues as resolved</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading department task queue...</div>
      ) : issues.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Pending Issues</h3>
          <p className="text-slate-400 text-sm">All issues assigned to your municipal department are currently resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => {
            const imgUrl = issue.images && issue.images.length > 0
              ? issue.images[0].annotated_image_path || issue.images[0].original_image_path
              : undefined;

            return (
              <div key={issue.id} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
                <div>
                  {imgUrl && (
                    <div className="h-44 bg-slate-900 relative">
                      <img src={imgUrl} alt={issue.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={issue.status} />
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase">{issue.issue_type}</span>
                      <PriorityBadge score={issue.priority_score} severity={issue.severity} />
                    </div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{issue.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{issue.address}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickStatusUpdate(issue.id, IssueStatus.IN_PROGRESS)}
                      disabled={issue.status === IssueStatus.IN_PROGRESS}
                      className="py-1.5 px-3 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-600/30 transition-colors disabled:opacity-40"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleQuickStatusUpdate(issue.id, IssueStatus.RESOLVED)}
                      disabled={issue.status === IssueStatus.RESOLVED}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-colors disabled:opacity-40"
                    >
                      Mark Resolved
                    </button>
                  </div>

                  <Link
                    to={`/issue/${issue.id}`}
                    className="block text-center w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
                  >
                    View Full Audit Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
