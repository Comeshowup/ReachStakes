import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Eye, Image, Video, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import RiskBadge from './risk-badge';
import { useApprovalsStore } from '../store/approvals-store';
import { useApproveItem } from '../api/approvals-api';

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_DOT = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

function safeFormatDistance(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

/**
 * ApprovalRow — memoized table row for the approvals table.
 * Handles selection, click-to-inspect, and hover quick-approve.
 */
const ApprovalRow = memo(function ApprovalRow({
  item,
  isSelected,
  isActive,
  style,
  campaignId,
}) {
  const toggleRow = useApprovalsStore(s => s.toggleRow);
  const setSelectedApprovalId = useApprovalsStore(s => s.setSelectedApprovalId);
  const approveMutation = useApproveItem();

  const handleQuickApprove = (e) => {
    e.stopPropagation();
    approveMutation.mutate({ campaignId, id: item.id, note: '' });
  };

  return (
    <div
      style={style}
      onClick={() => setSelectedApprovalId(item.id)}
      className={cn(
        'group flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] cursor-pointer transition-colors',
        isActive
          ? 'bg-violet-500/10 border-b-violet-500/20'
          : 'hover:bg-white/[0.02]',
        isSelected && !isActive && 'bg-white/[0.04]'
      )}
    >
      {/* Checkbox */}
      <div onClick={e => { e.stopPropagation(); toggleRow(item.id); }}>
        <Checkbox
          checked={isSelected}
          className="border-white/20 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
        />
      </div>

      {/* Priority dot */}
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', PRIORITY_DOT[item.priority] || PRIORITY_DOT.medium)} />

      {/* Thumbnail / platform icon */}
      <div className="relative w-9 h-9 rounded-md overflow-hidden bg-white/[0.05] shrink-0">
        {item.content?.thumbnail || item.content?.url ? (
          <img
            src={item.content.thumbnail || item.content.url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.content?.type === 'video'
              ? <Video className="w-4 h-4 text-slate-600" />
              : <Image className="w-4 h-4 text-slate-600" />}
          </div>
        )}
        {item.content?.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Video className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Creator */}
      <div className="flex items-center gap-2 min-w-0 w-36 shrink-0">
        <img
          src={item.creator.avatar}
          alt={item.creator.name}
          className="w-6 h-6 rounded-full bg-white/[0.05] shrink-0"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <span className="text-xs text-slate-300 truncate">{item.creator.name}</span>
      </div>

      {/* Title / caption */}
      <div className="min-w-0 flex-1 hidden md:block">
        <span className="text-xs text-slate-400 truncate block">
          {item.content?.caption || '—'}
        </span>
      </div>

      {/* Platform */}
      <div className="min-w-0 w-24 shrink-0 hidden lg:block">
        <span className="text-xs text-slate-500 truncate block">
          {item.platform || '—'}
        </span>
      </div>

      {/* Submitted */}
      <div className="w-24 shrink-0 hidden lg:block">
        <span className="text-xs text-slate-500 tabular-nums">
          {safeFormatDistance(item.submittedAt)}
        </span>
      </div>

      {/* Risk Score */}
      <div className="shrink-0">
        <RiskBadge score={item.riskScore} />
      </div>

      {/* Status */}
      <div className="w-20 shrink-0">
        <span className={cn(
          'px-2 py-0.5 rounded-md text-[10px] font-medium border capitalize',
          STATUS_STYLES[item.status] || STATUS_STYLES.pending
        )}>
          {item.status}
        </span>
      </div>

      {/* Actions (hover) */}
      <div className="w-16 flex justify-end shrink-0">
        {item.status === 'pending' && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleQuickApprove}
              title="Quick approve"
              className="p-1 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setSelectedApprovalId(item.id); }}
              title="Open review"
              className="p-1 rounded-md text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {item.status !== 'pending' && item.content?.url && (
          <a
            href={item.content.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1 rounded-md text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="View submission"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
});

export default ApprovalRow;
