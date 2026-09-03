import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { AnalyticsDashboardData } from '../types';
import { LayoutDashboard, AlertOctagon, CheckCircle2, Clock, Activity, Building, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading Municipal Analytics Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> SMART CITY COMMAND CENTER
          </div>
          <h1 className="text-3xl font-extrabold text-white">Administrator Analytics & Management</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time infrastructure intelligence, department workloads, and priority analytics</p>
        </div>

        <Link
          to="/admin/issues"
          className="px-4 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 flex items-center gap-2 text-sm transition-all"
        >
          <LayoutDashboard className="w-4 h-4" /> Manage All Issues
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Issues</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data.total_issues}</div>
          <div className="text-xs text-slate-400">Recorded across all municipal zones</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pending</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{data.open_issues}</div>
          <div className="text-xs text-slate-400">Awaiting department action</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">{data.in_progress_issues}</div>
          <div className="text-xs text-slate-400">Dispatched repair crews</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Urgency</span>
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{data.critical_issues_count}</div>
          <div className="text-xs text-slate-400">Priority score &gt; 80/100</div>
        </div>
      </div>

      {/* Category & Severity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Issues by AI Category</h3>
          <div className="space-y-3">
            {Object.entries(data.issues_by_category).map(([cat, count]) => {
              const pct = data.total_issues > 0 ? (count / data.total_issues) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{cat}</span>
                    <span className="text-cyan-400">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Severity Level Distribution</h3>
          <div className="space-y-3">
            {Object.entries(data.issues_by_severity).map(([sev, count]) => {
              const pct = data.total_issues > 0 ? (count / data.total_issues) * 100 : 0;
              const color = sev === 'CRITICAL' ? 'bg-rose-500' : sev === 'HIGH' ? 'bg-amber-500' : sev === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-500';
              return (
                <div key={sev} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{sev}</span>
                    <span className="text-white">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Departmental Performance Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-purple-400" />
          Municipal Department Workload & Resolution Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Total Assigned</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">In Progress</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {data.department_performance.map((dept) => (
                <tr key={dept.department_id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-white">{dept.department_name}</td>
                  <td className="py-3 px-4">{dept.total_assigned}</td>
                  <td className="py-3 px-4 text-amber-400 font-semibold">{dept.pending}</td>
                  <td className="py-3 px-4 text-cyan-400 font-semibold">{dept.in_progress}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">{dept.resolved}</td>
                  <td className="py-3 px-4 font-bold text-purple-400">{dept.resolution_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
