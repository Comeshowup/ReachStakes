import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  ExternalLink,
  Pencil,
  Eye,
  Copy,
  RotateCcw,
  Instagram,
  Youtube,
  Music2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SubmissionStatusBadge from './SubmissionStatusBadge.jsx';
import { PLATFORM_CONFIG, CONTENT_TYPE_LABELS } from '../types/submissions.types.js';

// ─── Platform Icon ─────────────────────────────────────────────────────────────

function PlatformIcon({ platform, className }) {
  const iconClass = cn('w-4 h-4', className);
  if (platform === 'youtube') return <Youtube className={cn(iconClass, 'text-red-400')} />;
  if (platform === 'instagram') return <Instagram className={cn(iconClass, 'text-pink-400')} />;
  if (platform === 'tiktok') return <Music2 className={cn(iconClass, 'text-cyan-400')} />;
  return null;
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────

function SubmissionThumbnail({ platform, contentUrl }) {
  const config = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.youtube;

  // Try to extract YouTube thumbnail
  let ytThumb = null;
  if (platform === 'youtube' && contentUrl) {
    const match = contentUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) ytThumb = `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }

  if (ytThumb) {
    return (
      <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
        <img
          src={ytThumb}
          alt="Thumbnail"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-28 h-20 rounded-xl flex items-center justify-center flex-shrink-0',
        'bg-gradient-to-br border border-white/5',
        config.gradientFrom,
        config.gradientTo,
        'opacity-80'
      )}
    >
      <PlatformIcon platform={platform} className="w-8 h-8 text-white/70" />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ActionButton({ children, onClick, variant = 'ghost', className, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'ghost' && 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white',
        variant === 'primary' && 'bg-indigo-600/90 hover:bg-indigo-500 text-white',
        variant === 'warning' && 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400',
        className
      )}
    >
      {children}
    </button>
  );
}

// ─── Main Card ─────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   submission: import('../types/submissions.types.js').Submission;
 *   onView: (submission: import('../types/submissions.types.js').Submission) => void;
 *   onEdit: (submission: import('../types/submissions.types.js').Submission) => void;
 *   onResubmit: (submission: import('../types/submissions.types.js').Submission) => void;
 *   index?: number;
 * }} props
 */
const SubmissionCard = ({ submission, onView, onEdit, onResubmit, index = 0 }) => {
  const platformConfig = PLATFORM_CONFIG[submission.platform] ?? PLATFORM_CONFIG.youtube;
  const contentLabel = CONTENT_TYPE_LABELS[submission.type] ?? submission.type;
  const canEdit = ['draft', 'changes_requested'].includes(submission.status);
  const canResubmit = submission.status === 'changes_requested';

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(submission.contentUrl);
      // Could fire a toast here but we don't import toast in card — parent handles
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={cn(
        'group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200',
        'bg-slate-900/50 border-white/5',
        'hover:border-indigo-500/30 hover:bg-slate-900/80',
        'cursor-pointer'
      )}
      onClick={() => onView(submission)}
    >
      {/* Version badge */}
      {submission.version > 1 && (
        <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          v{submission.version}
        </span>
      )}

      {/* Thumbnail */}
      <SubmissionThumbnail platform={submission.platform} contentUrl={submission.contentUrl} />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Top row */}
        <div className="flex items-start gap-2 pr-8">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate leading-tight">
              {platformConfig.label} {contentLabel}
              {submission.version > 1 ? ` v${submission.version}` : ''}
            </h4>
            {submission.caption && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{submission.caption}</p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-1.5 text-xs font-medium', platformConfig.color)}>
            <PlatformIcon platform={submission.platform} className="w-3.5 h-3.5" />
            {platformConfig.label}
          </div>
          <span className="text-slate-700">•</span>
          <span className="text-xs text-slate-500 capitalize">{contentLabel}</span>
          <span className="text-slate-700">•</span>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <SubmissionStatusBadge status={submission.status} size="sm" />

          <div className="flex items-center gap-1.5 ml-auto" onClick={(e) => e.stopPropagation()}>
            <ActionButton onClick={handleCopyLink} title="Copy link">
              <Copy className="w-3 h-3" />
            </ActionButton>

            <ActionButton onClick={() => onView(submission)}>
              <Eye className="w-3 h-3" />
              View
            </ActionButton>

            {canEdit && (
              <ActionButton onClick={() => onEdit(submission)} variant="ghost">
                <Pencil className="w-3 h-3" />
                Edit
              </ActionButton>
            )}

            {canResubmit && (
              <ActionButton onClick={() => onResubmit(submission)} variant="warning">
                <RotateCcw className="w-3 h-3" />
                Resubmit
              </ActionButton>
            )}

            <a
              href={submission.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 bg-white/5 hover:bg-white/10 transition-all"
              title="Open content"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubmissionCard;
