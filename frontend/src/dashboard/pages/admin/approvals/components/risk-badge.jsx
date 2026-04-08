import React from 'react';
import { cn } from '@/lib/utils';

/**
 * RiskBadge — color-coded risk score pill.
 * green: 0–30 | amber: 31–70 | red: 71–100
 */
export default function RiskBadge({ score, className }) {
  const level =
    score <= 30 ? 'low' : score <= 70 ? 'medium' : 'high';

  const styles = {
    low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    high: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  const dot = {
    low: 'bg-emerald-400',
    medium: 'bg-amber-400',
    high: 'bg-red-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium tabular-nums',
        styles[level],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot[level])} />
      {score}
    </span>
  );
}
