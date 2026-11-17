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
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'RESOLUTION_SUBMITTED':
      case 'CITIZEN_VERIFICATION':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/50 animate-pulse';
      case 'IN_PROGRESS':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'ACCEPTED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'ASSIGNED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
      case 'UNDER_REVIEW':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'AWAITING_INSPECTION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'REOPENED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold';
      case 'REJECTED':
      case 'CLOSED':
        return 'bg-slate-700/40 text-slate-400 border-slate-600/50';
      case 'AI_ANALYZED':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      case 'SUBMITTED':
      case 'REPORTED':
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold tracking-wide ${getStyle()}`}>
      {getLabel()}
    </span>
  );
};
