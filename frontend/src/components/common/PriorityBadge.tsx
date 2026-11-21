import React from 'react';
import { SeverityLevel } from '../../types';

interface PriorityBadgeProps {
  score: number;
  severity: SeverityLevel | string;
  showScore?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ score, severity, showScore = true }) => {
  const getBadgeStyle = () => {
    const sevStr = String(severity).toUpperCase();
    switch (sevStr) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDotStyle = () => {
    const sevStr = String(severity).toUpperCase();
    switch (sevStr) {
      case 'CRITICAL':
        return 'bg-rose-500';
      case 'HIGH':
        return 'bg-amber-500';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-sky-500';
      case 'LOW':
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${getBadgeStyle()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
      <span className="font-semibold">{severity}</span>
      {showScore && <span className="opacity-75 font-mono text-[11px]">({score.toFixed(0)}/100)</span>}
    </div>
  );
};
