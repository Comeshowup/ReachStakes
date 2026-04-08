import React from 'react';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '../types/submissions.types.js';

/**
 * Status badge for a submission.
 *
 * @param {{ status: import('../types/submissions.types.js').SubmissionStatus; size?: 'sm' | 'default'; className?: string; }} props
 */
const SubmissionStatusBadge = ({ status, size = 'default', className }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide border',
        config.bg,
        config.color,
        config.border,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]',
        className
      )}
    >
      {/* Status dot */}
      <span className={cn('rounded-full flex-shrink-0', config.dot, size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
      {config.label}
    </span>
  );
};

export default SubmissionStatusBadge;
