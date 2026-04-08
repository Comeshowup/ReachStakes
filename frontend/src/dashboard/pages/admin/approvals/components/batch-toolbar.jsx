import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X, Loader2 } from 'lucide-react';
import { useApprovalsStore } from '../store/approvals-store';
import { useBatchAction } from '../api/approvals-api';

/**
 * BatchToolbar — floating action bar that appears when rows are selected.
 * Supports approve/reject batch operations with optimistic update.
 */
export default function BatchToolbar() {
  const selectedRows = useApprovalsStore(s => s.selectedRows);
  const clearSelectedRows = useApprovalsStore(s => s.clearSelectedRows);
  const batchMutation = useBatchAction();

  const count = selectedRows.size;
  const ids = [...selectedRows];

  const handleBatch = async (action) => {
    await batchMutation.mutateAsync({ ids, action });
    clearSelectedRows();
  };

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#18181F] border border-white/10 shadow-2xl shadow-black/60 backdrop-blur-sm"
        >
          {/* Count */}
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <span className="h-5 w-5 rounded-md bg-violet-500/20 flex items-center justify-center text-violet-300 text-xs font-bold">
              {count}
            </span>
            <span className="text-xs text-slate-400">selected</span>
          </div>

          {/* Approve */}
          <button
            onClick={() => handleBatch('approved')}
            disabled={batchMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            {batchMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            Approve Selected
          </button>

          {/* Reject */}
          <button
            onClick={() => handleBatch('rejected')}
            disabled={batchMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject Selected
          </button>

          {/* Dismiss */}
          <button
            onClick={clearSelectedRows}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
