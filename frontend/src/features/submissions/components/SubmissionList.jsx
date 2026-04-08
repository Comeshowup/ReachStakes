import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SubmissionCard from './SubmissionCard.jsx';
import SubmissionEmptyState from './SubmissionEmptyState.jsx';

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SubmissionSkeleton({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/30"
    >
      <div className="w-28 h-20 rounded-xl bg-slate-800/80 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 w-48 bg-slate-800/80 rounded-lg animate-pulse" />
        <div className="h-3 w-32 bg-slate-800/60 rounded-lg animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-slate-800/60 rounded-full animate-pulse" />
          <div className="h-5 w-12 bg-slate-800/40 rounded-lg animate-pulse ml-auto" />
          <div className="h-5 w-12 bg-slate-800/40 rounded-lg animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Version Group ────────────────────────────────────────────────────────────

/**
 * Groups related submissions (original + revisions) visually.
 */
function VersionGroup({ submissions, onView, onEdit, onResubmit }) {
  const [expanded, setExpanded] = useState(true);
  const primary = submissions[0]; // Most recent version first
  const hasVersions = submissions.length > 1;

  return (
    <div className="space-y-2">
      <SubmissionCard
        submission={primary}
        onView={onView}
        onEdit={onEdit}
        onResubmit={onResubmit}
        index={0}
      />
      {hasVersions && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 ml-6 text-[11px] font-semibold text-slate-600 hover:text-slate-400 transition-colors"
          >
            <span className={cn('transition-transform', expanded ? 'rotate-90' : '')}>›</span>
            {expanded ? 'Hide' : 'Show'} {submissions.length - 1} earlier {submissions.length - 1 === 1 ? 'version' : 'versions'}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 pl-4 border-l border-white/5 space-y-2 overflow-hidden"
              >
                {submissions.slice(1).map((sub, idx) => (
                  <SubmissionCard
                    key={sub.id}
                    submission={sub}
                    onView={onView}
                    onEdit={onEdit}
                    onResubmit={onResubmit}
                    index={idx + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ─── Main List ─────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   submissions: import('../types/submissions.types.js').Submission[];
 *   isLoading: boolean;
 *   onNewSubmission: () => void;
 *   onView: (sub: any) => void;
 *   onEdit: (sub: any) => void;
 *   onResubmit: (sub: any) => void;
 * }} props
 */
const SubmissionList = ({
  submissions = [],
  isLoading,
  onNewSubmission,
  onView,
  onEdit,
  onResubmit,
}) => {
  // Group submissions by version chain
  const groups = React.useMemo(() => {
    const roots = submissions.filter((s) => !s.parentSubmissionId);
    return roots.map((root) => {
      const chain = submissions
        .filter((s) => s.id === root.id || s.parentSubmissionId === root.id)
        .sort((a, b) => b.version - a.version); // Newest first
      return chain;
    });
  }, [submissions]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => <SubmissionSkeleton key={i} index={i} />)}
      </div>
    );
  }

  if (submissions.length === 0) {
    return <SubmissionEmptyState onNewSubmission={onNewSubmission} />;
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <VersionGroup
          key={group[0].id}
          submissions={group}
          onView={onView}
          onEdit={onEdit}
          onResubmit={onResubmit}
        />
      ))}
    </div>
  );
};

export default SubmissionList;
