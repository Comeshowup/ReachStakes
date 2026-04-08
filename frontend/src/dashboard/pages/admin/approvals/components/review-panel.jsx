import React, { useState } from 'react';
import {
  X, ExternalLink, Play, Maximize2, User, Target, Briefcase,
  ShieldAlert, Clock, CheckCircle, XCircle, RefreshCw, Flag,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RiskBadge from './risk-badge';
import DecisionActions from './decision-actions';
import { useApprovalsStore } from '../store/approvals-store';

function safeFormat(dateStr, fmt) {
  try { return format(new Date(dateStr), fmt); } catch { return dateStr; }
}
function safeRelative(dateStr) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return dateStr; }
}

const FLAG_LABELS = {
  nsfw: 'NSFW',
  copyright: 'Copyright',
  'brand-mismatch': 'Brand Mismatch',
  'low-quality': 'Low Quality',
  'ai-risk': 'AI Risk',
  'manual-escalation': 'Escalated',
};

const FLAG_COLORS = {
  nsfw: 'bg-red-500/10 text-red-400 border-red-500/20',
  copyright: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'brand-mismatch': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'low-quality': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'ai-risk': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'manual-escalation': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const AUDIT_ICONS = {
  submitted: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  changes_requested: RefreshCw,
};

const AUDIT_COLORS = {
  submitted: 'text-slate-400',
  approved: 'text-emerald-400',
  rejected: 'text-red-400',
  changes_requested: 'text-amber-400',
};

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-slate-500" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{title}</span>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs text-slate-300 text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}

/**
 * ReviewPanel — right-side inspector for a selected approval item.
 * Contains content preview, metadata, AI signals, decision block, and audit timeline.
 */
export default function ReviewPanel({ items = [], className }) {
  const selectedApprovalId = useApprovalsStore(s => s.selectedApprovalId);
  const setSelectedApprovalId = useApprovalsStore(s => s.setSelectedApprovalId);
  const [expanded, setExpanded] = useState(false);
  const [mediaModal, setMediaModal] = useState(false);
  const [showAudit, setShowAudit] = useState(true);

  const item = items.find(it => it.id === selectedApprovalId);

  if (!item) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full text-center p-8', className)}>
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 text-slate-700" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Select an item to review</p>
        <p className="text-xs text-slate-600 mt-1">Click any row to open the inspector</p>
      </div>
    );
  }

  const brandMatchPct = Math.max(100 - item.riskScore, 10);
  const slaBreached = item.slaDueAt && new Date(item.slaDueAt) < new Date();

  return (
    <div className={cn('flex flex-col h-full min-h-0', className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Inspector</span>
          <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
        </div>
        <button
          onClick={() => setSelectedApprovalId(null)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">

          {/* ── 1. Content Preview ────────────────────────────────────── */}
          <div>
            <SectionHeader title="Content Preview" icon={Maximize2} />
            <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/[0.06] aspect-video">
              {item.content.type === 'video' ? (
                <video
                  src={item.content.url}
                  className="w-full h-full object-contain"
                  controls
                  muted
                />
              ) : (
                <img
                  src={item.content.url}
                  alt="Content"
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.src = `https://picsum.photos/800/600?random=${item.id}`;
                  }}
                />
              )}
              <button
                onClick={() => setMediaModal(true)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Caption */}
            <p className={cn(
              'mt-2 text-xs text-slate-400 leading-relaxed',
              !expanded && 'line-clamp-2'
            )}>
              {item.content.caption}
            </p>
            {item.content.caption?.length > 80 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] text-violet-400 hover:text-violet-300 mt-0.5 flex items-center gap-1"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Less' : 'More'}
              </button>
            )}
            <a
              href={item.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-violet-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open original
            </a>
          </div>

          <Separator className="bg-white/[0.05]" />

          {/* ── 2. Metadata ──────────────────────────────────────────── */}
          <div>
            <SectionHeader title="Metadata" icon={User} />
            <div className="space-y-0.5">
              {/* Creator */}
              <div className="flex items-center gap-2.5 py-2 border-b border-white/[0.04]">
                <img
                  src={item.creator.avatar}
                  alt={item.creator.name}
                  className="w-8 h-8 rounded-full bg-white/[0.05]"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <p className="text-xs font-medium text-slate-200">{item.creator.name}</p>
                  <p className="text-[10px] text-slate-500">Creator</p>
                </div>
              </div>
              <MetaRow label="Campaign" value={item.campaign.name} />
              <MetaRow label="Brand" value={item.brand.name} />
              <MetaRow label="Content Type" value={item.content.type.charAt(0).toUpperCase() + item.content.type.slice(1)} />
              <MetaRow label="Priority" value={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} />
              <MetaRow label="Submitted" value={safeRelative(item.submittedAt)} />
              {item.slaDueAt && (
                <div className={cn('flex items-center justify-between py-1', slaBreached && 'text-red-400')}>
                  <span className="text-xs text-slate-500">SLA Due</span>
                  <span className={cn('text-xs', slaBreached ? 'text-red-400 font-medium' : 'text-slate-300')}>
                    {slaBreached ? '⚠ Breached' : safeRelative(item.slaDueAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-white/[0.05]" />

          {/* ── 3. AI / Risk Signals ─────────────────────────────────── */}
          <div>
            <SectionHeader title="AI & Risk Signals" icon={ShieldAlert} />
            <div className="space-y-3">
              {/* Risk score bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Risk Score</span>
                  <RiskBadge score={item.riskScore} />
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      item.riskScore > 70 ? 'bg-red-500' :
                      item.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${item.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Brand guideline match */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Brand Guidelines Match</span>
                  <span className="text-xs font-semibold text-emerald-400">{brandMatchPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${brandMatchPct}%` }}
                  />
                </div>
              </div>

              {/* Flags */}
              {item.flags.length > 0 ? (
                <div>
                  <p className="text-[10px] text-slate-500 mb-1.5">Flags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.flags.map(flag => (
                      <span
                        key={flag}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border',
                          FLAG_COLORS[flag] ?? 'bg-white/5 text-slate-400 border-white/10'
                        )}
                      >
                        <Flag className="w-2.5 h-2.5" />
                        {FLAG_LABELS[flag] ?? flag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">No flags detected.</p>
              )}
            </div>
          </div>

          <Separator className="bg-white/[0.05]" />

          {/* ── 4. Decision Block ────────────────────────────────────── */}
          <div>
            <SectionHeader title="Decision" icon={CheckCircle} />
            <DecisionActions item={item} items={items} />
          </div>

          <Separator className="bg-white/[0.05]" />

          {/* ── 5. Audit Timeline ────────────────────────────────────── */}
          <div>
            <button
              onClick={() => setShowAudit(!showAudit)}
              className="flex items-center gap-2 w-full group"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex-1 text-left">
                Audit Timeline
              </span>
              {showAudit ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            {showAudit && (
              <div className="mt-3 space-y-3 pl-1">
                {(item.auditLog || []).map((entry, i) => {
                  const Icon = AUDIT_ICONS[entry.action] ?? Clock;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        <Icon className={cn('w-3.5 h-3.5', AUDIT_COLORS[entry.action] ?? 'text-slate-500')} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-300 capitalize">
                          {entry.action.replace(/_/g, ' ')}
                          {entry.actor && (
                            <span className="text-slate-500"> · {entry.actor}</span>
                          )}
                        </p>
                        {entry.reason && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{entry.reason}</p>
                        )}
                        {entry.note && (
                          <p className="text-[10px] text-slate-500 mt-0.5 italic">"{entry.note}"</p>
                        )}
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {safeFormat(entry.at, 'MMM d, yyyy · HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom padding */}
          <div className="h-4" />
        </div>
      </ScrollArea>

      {/* Media expand modal */}
      <Dialog open={mediaModal} onOpenChange={setMediaModal}>
        <DialogContent className="max-w-4xl bg-[#0d0d14] border-white/10 p-2">
          {item.content.type === 'video' ? (
            <video src={item.content.url} controls autoPlay className="w-full rounded-lg" />
          ) : (
            <img
              src={item.content.url}
              alt="Content expanded"
              className="w-full rounded-lg object-contain max-h-[80vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
