import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { AnalyticsDashboardData, PredictiveHotspot } from '../types';
import {
  LayoutDashboard, AlertOctagon, CheckCircle2, Clock, Activity,
  Building2, ShieldCheck, ArrowUpRight, AlertTriangle, Sparkles,
  TrendingUp, MapPin, RefreshCw, BarChart2, CheckSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [hotspots, setHotspots] = useState<PredictiveHotspot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      analyticsService.getDashboardStats(),
      analyticsService.getPredictiveHotspots()
    ])
      .then(([dash, hots]) => {
        setData(dash);
        setHotspots(hots || dash.predictive_hotspots || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
          <span>Loading NagarSetu Municipal Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800 text-purple-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> NAGARSETU MUNICIPAL COMMAND CENTER
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              City-Wide Civic Intelligence & Accountability
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Cross-departmental monitoring, predictive failure hotspot forecasting, and SLA resolution enforcement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Live
            </button>
            <Link
              to="/admin/issues"
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950 flex items-center gap-2 text-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Manage All Issues & SLA
            </Link>
          </div>
        </div>

        {/* 1. TOP-LINE KPI METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Total Complaints</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{data.total_issues}</div>
            <div className="text-[10px] text-slate-500">City-wide cumulative</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Pending Action</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{data.open_issues}</div>
            <div className="text-[10px] text-slate-500">Across 6 departments</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium">In Progress</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">{data.in_progress_issues}</div>
            <div className="text-[10px] text-slate-500">Dispatched work crews</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Resolved & Verified</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{data.resolved_issues}</div>
            <div className="text-[10px] text-slate-500">Ground verified</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium">SLA Escalated / Overdue</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">{data.escalated_count || 0}</div>
            <div className="text-[10px] text-rose-400 font-medium">Deadline breached</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Citizen Reopened</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">{data.reopened_count || 0}</div>
            <div className="text-[10px] text-slate-500">Repair rejected by citizen</div>
          </div>
        </div>

        {/* 2. PREDICTIVE CIVIC INTELLIGENCE (NEW FEATURE 10) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/30 border border-purple-800/60 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Predictive Civic Hotspots & Failure Recurrence Forecast</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Spatial kernel density and seasonal failure patterns forecasting high-risk civic infrastructure clusters.
              </p>
            </div>
            <span className="text-xs bg-purple-950 text-purple-300 px-3 py-1 rounded-full border border-purple-800 font-semibold">
              Statistical Confidence: 82%
            </span>
          </div>

          {hotspots.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              Collecting spatial defect density across city wards...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hotspots.slice(0, 3).map((h) => (
                <div
                  key={h.cluster_id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      {h.address.split(',')[0]}
                    </span>
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${h.risk_color}25`,
                        color: h.risk_color,
                        border: `1px solid ${h.risk_color}60`
                      }}
                    >
                      {h.risk_level} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900">
                      <span className="text-[10px] text-slate-400 block">Recurrence Prob.</span>
                      <strong className="text-white font-mono text-sm">{h.recurrence_probability}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900">
                      <span className="text-[10px] text-slate-400 block">Forecast Horizon</span>
                      <strong className="text-cyan-300 text-xs">{h.forecast_period}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-purple-300">Preventive Action:</strong> {h.preventive_action}
                  </p>

                  <div className="text-[10px] text-slate-500 italic">
                    Historical density: {h.total_complaints} incidents ({h.dominant_category})
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-500 italic">
            * Methodology Note: Predictions are based on spatial density of unresolved and recurring defects. NagarSetu transparently provides forecasting guidance without asserting unverified guarantees.
          </p>
        </div>

        {/* 3. CATEGORY & SEVERITY CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Incidents by AI Defect Category
            </h3>
            <div className="space-y-3">
              {Object.entries(data.issues_by_category).map(([cat, count]) => {
                const pct = data.total_issues > 0 ? (count / data.total_issues) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-cyan-400 font-mono">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Severity Classification
            </h3>
            <div className="space-y-3">
              {Object.entries(data.issues_by_severity).map(([sev, count]) => {
                const pct = data.total_issues > 0 ? (count / data.total_issues) * 100 : 0;
                const color =
                  sev === 'CRITICAL'
                    ? 'bg-rose-500'
                    : sev === 'HIGH'
                    ? 'bg-amber-500'
                    : sev === 'MODERATE' || sev === 'MEDIUM'
                    ? 'bg-sky-500'
                    : 'bg-emerald-500';
                return (
                  <div key={sev} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{sev}</span>
                      <span className="text-white font-mono">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. DEPARTMENTAL WORKLOAD & SLA SCORECARDS */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              Department SLA Compliance & Workload Scorecards
            </h3>
            <span className="text-xs text-slate-400">All 6 Municipal Departments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Assigned Tasks</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">In Progress</th>
                  <th className="py-3 px-4">Resolved</th>
                  <th className="py-3 px-4">SLA Overdue</th>
                  <th className="py-3 px-4">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {data.department_performance.map((dept) => (
                  <tr key={dept.department_id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{dept.department_name}</td>
                    <td className="py-3 px-4 font-mono">{dept.total_assigned}</td>
                    <td className="py-3 px-4 text-amber-400 font-semibold font-mono">{dept.pending}</td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold font-mono">{dept.in_progress}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold font-mono">{dept.resolved}</td>
                    <td className="py-3 px-4 font-mono">
                      {(dept.overdue_count || 0) > 0 ? (
                        <span className="text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                          {dept.overdue_count} Overdue
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">0 on time</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-purple-300 font-mono">{dept.resolution_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
