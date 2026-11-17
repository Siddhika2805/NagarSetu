import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService, departmentService } from '../services/api';
import { Issue, Department, IssueStatus, IssueType } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Search, Filter, Shield, Eye, Building2, RefreshCw, Users, Clock, AlertTriangle } from 'lucide-react';

export const AdminIssueManagementPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.listIssues({
        search: search.trim() || undefined,
        status_filter: statusFilter !== 'ALL' ? statusFilter : undefined,
        type_filter: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
      setIssues(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    departmentService.listDepartments().then(setDepartments).catch(console.error);
  }, []);

  const now = new Date().getTime();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800 text-purple-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" /> NAGARSETU MUNICIPAL COMMAND
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Municipal Complaint Oversight & SLA Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit priority scores, inspect duplicate linkages, monitor department response times, and resolve ground escalations.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title, address, landmark..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchIssues()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(IssueStatus).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All AI Categories</option>
              {Object.values(IssueType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              onClick={fetchIssues}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Apply Filters
            </button>
          </div>
        </div>

        {/* Issues Management Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">ID & Category</th>
                  <th className="py-3.5 px-4">Title & Address</th>
                  <th className="py-3.5 px-4">Priority & SLA</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status & Proof</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">Loading complaints...</td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">No complaints found matching criteria.</td>
                  </tr>
                ) : (
                  issues.map((issue) => {
                    const isOverdue =
                      issue.sla_deadline &&
                      new Date(issue.sla_deadline).getTime() < now &&
                      issue.status !== IssueStatus.RESOLVED &&
                      issue.status !== IssueStatus.CLOSED;

                    return (
                      <tr key={issue.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-bold text-cyan-400 font-mono">#{issue.id}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{issue.issue_type}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-white truncate">{issue.title}</div>
                          <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                            {issue.address || `GPS (${issue.latitude}, ${issue.longitude})`}
                          </div>
                          {issue.support_count && issue.support_count > 1 && (
                            <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                              {issue.support_count} Citizen Endorsements
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <PriorityBadge score={issue.priority_score} severity={issue.severity} />
                            {isOverdue && (
                              <div className="text-[10px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800 w-fit">
                                SLA Overdue
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-purple-300">
                            {issue.department ? issue.department.name : 'Route Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <StatusBadge status={issue.status} />
                            {issue.resolution_image_path && (
                              <div className="text-[10px] text-emerald-400 font-medium">✓ Repair Proof Uploaded</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/issue/${issue.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 text-xs font-semibold border border-slate-800 transition-colors"
                          >
                            Audit <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
