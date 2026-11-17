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
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-950';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/40';
      case 'LOW':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{severity}</span>
      {showScore && <span className="opacity-90 font-mono">({score.toFixed(0)}/100)</span>}
    </div>
  );
};
