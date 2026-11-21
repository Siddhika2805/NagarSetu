import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { citizenService } from '../services/api';
import { Issue, IssueStatus, IssueType, SeverityLevel } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Search, Filter, MapPin, PlusCircle, ArrowRight, Clock,
  RefreshCw, CheckSquare, Eye
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [items, setItems] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [sort, setSort] = useState('newest');

  const loadReports = () => {
    setLoading(true);
    citizenService
      .reports({
        search: search || undefined,
        status_filter: status || undefined,
        category: category || undefined,
        severity: severity || undefined,
        sort,
      })
      .then((data) => setItems(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [status, category, severity, sort]);

  return (
    <div className="bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Civic Reports</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete history of civic infrastructure issues filed from your NagarSetu account.
            </p>
          </div>
          <Link
            to="/report"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Report New Issue
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadReports()}
              placeholder="Search title..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            {Object.values(IssueStatus).map((v) => (
              <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Categories</option>
            {Object.values(IssueType).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Severities</option>
            {Object.values(SeverityLevel).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>

        {/* Reports Listing */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Complaints ({items.length})
            </span>
            <button
              onClick={loadReports}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
              <div className="text-xs">Loading reports...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No civic complaints matched your filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">#{item.id}</span>
                      <StatusBadge status={item.status} />
                      <PriorityBadge score={item.priority_score} severity={item.severity} />
                      {item.department && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.department.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.address || 'GPS Coordinates captured'}</span>
                      </span>
                      <span>Filed: {new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                      {item.support_count > 1 && (
                        <span className="text-blue-700 font-medium">
                          {item.support_count} citizen endorsements
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/issue/${item.id}`}
                      className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>
                    <Link
                      to={`/issue/${item.id}/track`}
                      className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
