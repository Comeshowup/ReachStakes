import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, STATUS_FLOW } from '../types/submissions.types.js';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

// ─── Timeline Node ────────────────────────────────────────────────────────────

function TimelineNode({ status, isCurrent, isCompleted, isPending, timestamp }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  const date = timestamp ? new Date(timestamp) : null;
  const hasValidDate = date && !Number.isNaN(date.getTime());

  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
            isCompleted
              ? `${config.bg} ${config.border}`
              : isCurrent
              ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/20'
              : 'border-white/10 bg-white/5'
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className={cn('w-4 h-4', config.color)} />
          ) : isCurrent ? (
            <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-700" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-sm font-semibold',
              isCompleted ? config.color : isCurrent ? 'text-indigo-400' : 'text-slate-600'
            )}
          >
            {config.label}
          </span>
          {isCurrent && (
            <span className="text-[10px] font-bold text-indigo-400/70 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Current
            </span>
          )}
        </div>
        {hasValidDate && (isCompleted || isCurrent) && (
          <p className="text-[11px] text-slate-600 mt-0.5">
            {format(date, 'MMM d, yyyy · h:mm a')}
          </p>
        )}
        {isPending && !isCurrent && !isCompleted && (
          <p className="text-[11px] text-slate-700 mt-0.5">Waiting</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Timeline ─────────────────────────────────────────────────────────────

/**
 * Vertical status progression timeline.
 *
 * @param {{
 *   submission: import('../types/submissions.types.js').Submission;
 * }} props
 */
const SubmissionTimeline = ({ submission }) => {
  const currentStatus = STATUS_CONFIG[submission.status] ? submission.status : 'submitted';
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const submittedAt = submission.submittedAt || submission.updatedAt || submission.createdAt;
  const statusTimestamps = {
    submitted: submittedAt,
    under_review: currentStatus === 'under_review' ? submission.updatedAt || submittedAt : null,
    changes_requested: currentStatus === 'changes_requested' ? submission.updatedAt || submittedAt : null,
    approved: currentStatus === 'approved' ? submission.updatedAt || submittedAt : null,
    rejected: currentStatus === 'rejected' ? submission.updatedAt || submittedAt : null,
  };

  // For terminal states that aren't in the flow
  const isTerminal = ['approved', 'rejected'].includes(currentStatus);
  const flow = isTerminal
    ? [...STATUS_FLOW.slice(0, 2), currentStatus]
    : STATUS_FLOW;

  return (
    <div className="relative space-y-0">
      {/* Vertical connector line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-white/10 to-transparent" />

      {flow.map((status, idx) => {
        const stepIndex = isTerminal && idx === flow.length - 1
          ? STATUS_FLOW.length
          : STATUS_FLOW.indexOf(status);

        const isCompleted = isTerminal
          ? idx < flow.length - 1
          : currentIndex > stepIndex;

        const isCurrent = currentStatus === status;

        const isPending = !isCompleted && !isCurrent;

        return (
          <TimelineNode
            key={status}
            status={status}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
            isPending={isPending}
            timestamp={
              isCurrent || isCompleted ? statusTimestamps[status] || submittedAt : null
            }
          />
        );
      })}
    </div>
  );
};

export default SubmissionTimeline;
