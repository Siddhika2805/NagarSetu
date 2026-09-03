import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService, departmentService } from '../services/api';
import { Issue, Department, IssueStatus, IssueType } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Search, Filter, Shield, Eye, Building, RefreshCw } from 'lucide-react';

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
      setIssues(data);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Admin Issue Management</h1>
        <p className="text-slate-400 text-sm mt-1">Review priority scores, inspect duplicates, and reassign municipal department tickets</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, address, landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            {Object.values(IssueStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All AI Categories</option>
            {Object.values(IssueType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            onClick={fetchIssues}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Apply Filters
          </button>
        </div>
      </div>

      {/* Issues Management Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ID & Category</th>
                <th className="py-3.5 px-4">Title & Address</th>
                <th className="py-3.5 px-4">Priority & Severity</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading issues...</td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No issues found matching criteria.</td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-900/50">
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-cyan-400">#{issue.id}</div>
                      <div className="text-[11px] text-slate-400">{issue.issue_type}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{issue.title}</div>
                      <div className="text-xs text-slate-400 truncate">{issue.address || `GPS (${issue.latitude}, ${issue.longitude})`}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge score={issue.priority_score} severity={issue.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-purple-300">
                        {issue.department ? issue.department.name : 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/issue/${issue.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Inspect <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
