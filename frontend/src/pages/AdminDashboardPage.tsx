import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { AnalyticsDashboardData, PredictiveHotspot } from '../types';
import {
  LayoutDashboard, AlertOctagon, CheckCircle2, Clock, Activity,
  Building2, ShieldCheck, ArrowUpRight, AlertTriangle,
  TrendingUp, MapPin, RefreshCw, BarChart2, CheckSquare, Shield
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
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium">Loading Municipal Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>NAGARSETU MUNICIPAL COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              City-Wide Civic Intelligence & Accountability
            </h1>
            <p className="text-xs text-slate-500">
              Cross-departmental monitoring, predictive failure hotspot forecasting, and SLA resolution enforcement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/admin/issues"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Manage All Issues & SLA</span>
            </Link>
          </div>
        </div>

        {/* 1. TOP-LINE KPI METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Complaints</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{data.total_issues}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">City-wide cumulative</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Action</div>
            <div className="text-2xl font-bold text-amber-700 mt-1 font-mono">{data.open_issues}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Under department review</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{data.resolved_issues}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">With photo evidence</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolution Rate</div>
            <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
              {data.resolution_rate ?? (data.total_issues ? Math.round((data.resolved_issues / data.total_issues) * 100) : 0)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Completed successfully</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">SLA Overdue</div>
            <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">{data.sla_breached_count || 0}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Escalated tickets</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Citizen Verified</div>
            <div className="text-2xl font-bold text-indigo-700 mt-1 font-mono">{data.citizen_verified_count || 0}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ground-truth confirmed</div>
          </div>
        </div>

        {/* 2. DEPARTMENT PERFORMANCE & SLA SCORECARDS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Department Resolution Scorecards</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time SLA compliance tracking across municipal divisions</p>
            </div>
            <span className="text-xs text-slate-400">Target: Critical 24h • High 48h</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Department Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 text-center">Assigned</th>
                  <th className="py-3 px-4 text-center">Active</th>
                  <th className="py-3 px-4 text-center">Resolved</th>
                  <th className="py-3 px-4 text-center">SLA Rate</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.departments || data.department_performance || []).map((dept: any) => {
                  const rate = dept.resolution_rate || 0;
                  return (
                    <tr key={dept.id || dept.department_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {dept.name || dept.department_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {dept.code || dept.department_code}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                        {dept.total_assigned}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-amber-700">
                        {dept.active_count || (dept.total_assigned - dept.resolved)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-emerald-700">
                        {dept.resolved}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                        {rate}%
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rate >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rate >= 50
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rate >= 80 ? 'Optimal' : rate >= 50 ? 'Moderate' : 'Needs Attention'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. PREDICTIVE CIVIC INTELLIGENCE (DBSCAN HOTSPOTS) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide">
                <TrendingUp className="w-4 h-4" />
                <span>Predictive Failure Hotspot Clusters (DBSCAN Density Analysis)</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">Preventive Municipal Maintenance Guidance</h2>
            </div>
            <Link
              to="/map"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View On Interactive Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotspots.slice(0, 6).map((hot) => (
              <div
                key={hot.cluster_id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">{hot.cluster_id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      hot.risk_level === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : hot.risk_level === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {hot.risk_level} RISK
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">{hot.location_name || hot.address}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Dominant: <strong className="text-slate-700">{hot.dominant_issue_type || hot.dominant_category}</strong> • Recurrence: <strong className="font-mono text-slate-800">{hot.recurrence_probability}%</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Recommendation: </span>
                  {hot.preventive_recommendation || hot.preventive_action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
