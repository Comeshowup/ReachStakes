import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { useApprovalsStore } from '../store/approvals-store';
import { useApproveItem, useRejectItem, useRequestChanges } from '../api/approvals-api';

const REJECT_REASONS = [
  'Does not meet brand guidelines',
  'Low content quality',
  'Missing required messaging',
  'Incorrect product placement',
  'Brand safety concern',
  'Copyright issue',
  'Other',
];

/**
 * DecisionActions — approve / reject / request-changes block for the Review Panel.
 * Approve auto-selects next pending item.
 */
export default function DecisionActions({ item, items = [] }) {
  const setSelectedApprovalId = useApprovalsStore(s => s.setSelectedApprovalId);
  const [note, setNote] = useState('');
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const approveMutation = useApproveItem();
  const rejectMutation = useRejectItem();
  const changesMutation = useRequestChanges();

  const isPending = item?.status === 'pending';

  const selectNext = () => {
    const pending = items.filter(it => it.status === 'pending' && it.id !== item?.id);
    if (pending.length > 0) {
      setSelectedApprovalId(pending[0].id);
    }
  };

  const handleApprove = async () => {
    await approveMutation.mutateAsync({ id: item.id, note });
    setNote('');
    selectNext();
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    await rejectMutation.mutateAsync({ id: item.id, reason: rejectReason, note });
    setNote('');
    setShowRejectForm(false);
    selectNext();
  };

  const handleRequestChanges = async () => {
    if (!note.trim()) return;
    await changesMutation.mutateAsync({ id: item.id, note });
    setNote('');
  };

  const isLoading = approveMutation.isPending || rejectMutation.isPending || changesMutation.isPending;

  if (!isPending) {
    return (
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
        <p className="text-xs text-slate-500">
          This item has already been{' '}
          <span className={item?.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}>
            {item?.status}
          </span>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Note input */}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add an optional note..."
        rows={2}
        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 resize-none focus:outline-none focus:border-violet-500/40"
      />

      {/* Reject form */}
      {showRejectForm && (
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 space-y-2">
          <p className="text-xs text-red-400 font-medium">Select rejection reason</p>
          <div className="relative">
            <select
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full bg-[#1a1a24] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500/40 appearance-none cursor-pointer"
            >
              {REJECT_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRejectForm(false)}
              className="flex-1 px-3 py-1.5 rounded-md text-xs text-slate-500 bg-white/[0.03] border border-white/[0.06] hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex gap-2">
        {/* Approve */}
        <button
          onClick={handleApprove}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {approveMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          Approve
        </button>

        {/* Reject */}
        {!showRejectForm && (
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400 text-xs font-medium hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        )}

        {/* Request Changes */}
        <button
          onClick={handleRequestChanges}
          disabled={isLoading || !note.trim()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400 text-xs font-medium hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Requires a note"
        >
          {changesMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Changes
        </button>
      </div>
    </div>
  );
}
