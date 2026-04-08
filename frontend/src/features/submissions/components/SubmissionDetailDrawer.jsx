import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  X,
  ExternalLink,
  Copy,
  CheckCheck,
  Instagram,
  Youtube,
  Music2,
  FileText,
  MessageSquare,
  GitBranch,
  Pencil,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import SubmissionStatusBadge from './SubmissionStatusBadge.jsx';
import SubmissionTimeline from './SubmissionTimeline.jsx';
import SubmissionComments from './SubmissionComments.jsx';
import { PLATFORM_CONFIG, CONTENT_TYPE_LABELS } from '../types/submissions.types.js';

// ─── Content Preview ──────────────────────────────────────────────────────────

function ContentPreview({ submission }) {
  const { platform, contentUrl } = submission;

  // YouTube embed
  if (platform === 'youtube' && contentUrl) {
    const match = contentUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      return (
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${match[1]}?modestbranding=1&rel=0`}
            title="YouTube content"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }
  }

  // Platform fallback card
  const config = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.youtube;
  const PIcon = platform === 'youtube' ? Youtube : platform === 'instagram' ? Instagram : Music2;

  return (
    <div
      className={cn(
        'relative w-full rounded-xl overflow-hidden',
        'bg-gradient-to-br border border-white/5',
        config.gradientFrom,
        config.gradientTo
      )}
      style={{ minHeight: 200 }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <PIcon className="w-12 h-12 text-white/60" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold text-white/80 mb-1">{config.label} Content</p>
          <p className="text-xs text-white/40 break-all line-clamp-2">{contentUrl}</p>
        </div>
        <a
          href={contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold text-white transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Content
        </a>
      </div>
    </div>
  );
}

// ─── Metadata Row ─────────────────────────────────────────────────────────────

function MetaRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-slate-300 text-right">{children}</span>
    </div>
  );
}

// ─── Tab Nav ──────────────────────────────────────────────────────────────────

const DRAWER_TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'timeline', label: 'Timeline', icon: GitBranch },
];

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

/**
 * @param {{
 *   submission: import('../types/submissions.types.js').Submission | null;
 *   onClose: () => void;
 *   onEdit: (submission: import('../types/submissions.types.js').Submission) => void;
 *   onResubmit: (submission: import('../types/submissions.types.js').Submission) => void;
 * }} props
 */
const SubmissionDetailDrawer = ({ submission, onClose, onEdit, onResubmit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const isOpen = Boolean(submission);

  const platformConfig = submission ? PLATFORM_CONFIG[submission.platform] ?? PLATFORM_CONFIG.youtube : null;
  const contentLabel = submission ? CONTENT_TYPE_LABELS[submission.type] ?? submission.type : '';

  const canEdit = submission && ['draft', 'changes_requested'].includes(submission.status);
  const canResubmit = submission?.status === 'changes_requested';

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => setActiveTab('overview'), 300);
  }, [onClose]);

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-2xl bg-slate-950 border-l border-white/10 p-0 flex flex-col gap-0 overflow-hidden"
      >
        {submission && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/5 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <SubmissionStatusBadge status={submission.status} />
                  {submission.version > 1 && (
                    <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      Version {submission.version}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white truncate">
                  {platformConfig?.label} {contentLabel}
                  {submission.version > 1 ? ` v${submission.version}` : ''}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Submitted {format(new Date(submission.createdAt), 'MMM d, yyyy')}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Actions */}
                {canEdit && (
                  <button
                    onClick={() => { onEdit(submission); handleClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                {canResubmit && (
                  <button
                    onClick={() => { onResubmit(submission); handleClose(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resubmit
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex items-center gap-0 px-6 border-b border-white/5 flex-shrink-0">
              {DRAWER_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px',
                      isActive
                        ? 'text-indigo-400 border-indigo-500'
                        : 'text-slate-600 border-transparent hover:text-slate-400 hover:border-white/10'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Preview */}
                  <ContentPreview submission={submission} />

                  {/* Link + copy */}
                  <div className="flex items-center gap-2">
                    <a
                      href={submission.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/8 rounded-xl text-xs text-slate-400 hover:text-slate-300 border border-white/5 transition-all truncate"
                    >
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{submission.contentUrl}</span>
                    </a>
                    <CopyLinkButton url={submission.contentUrl} />
                  </div>

                  {/* Metadata */}
                  <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-1">
                    <MetaRow label="Platform">{platformConfig?.label}</MetaRow>
                    <MetaRow label="Type">
                      <span className="capitalize">{contentLabel}</span>
                    </MetaRow>
                    <MetaRow label="Version">v{submission.version}</MetaRow>
                    <MetaRow label="Created">
                      {format(new Date(submission.createdAt), 'MMM d, yyyy')}
                    </MetaRow>
                    <MetaRow label="Last Updated">
                      {format(new Date(submission.updatedAt), 'MMM d, yyyy · h:mm a')}
                    </MetaRow>
                  </div>

                  {/* Caption */}
                  {submission.caption && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Caption</h4>
                      <p className="text-sm text-slate-400 leading-relaxed bg-white/3 border border-white/5 rounded-xl px-4 py-3">
                        {submission.caption}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {submission.notes && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Creator Notes</h4>
                      <p className="text-sm text-slate-400 leading-relaxed bg-white/3 border border-white/5 rounded-xl px-4 py-3">
                        {submission.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="p-6">
                  <SubmissionComments submissionId={submission.id} />
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-5">Status History</h3>
                  <SubmissionTimeline submission={submission} />
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SubmissionDetailDrawer;
