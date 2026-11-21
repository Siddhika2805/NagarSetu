import React from 'react';
import { IssueStatus } from '../../types';

interface StatusBadgeProps {
  status: IssueStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RESOLUTION_SUBMITTED':
      case 'CITIZEN_VERIFICATION':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-semibold ring-1 ring-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ACCEPTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ASSIGNED':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'UNDER_REVIEW':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'AWAITING_INSPECTION':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'REOPENED':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'REJECTED':
        return 'bg-slate-100 text-slate-500 border-slate-200 line-through';
      case 'AI_ANALYZED':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'SUBMITTED':
      case 'REPORTED':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getLabel = () => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'RESOLUTION_SUBMITTED':
        return 'Verify Ground Repair';
      case 'CITIZEN_VERIFICATION':
        return 'Awaiting Citizen Confirm';
      case 'AWAITING_INSPECTION':
        return 'Inspection Queued';
      default:
        return s.replace(/_/g, ' ');
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide uppercase ${getStyle()}`}>
      {getLabel()}
    </span>
  );
};
