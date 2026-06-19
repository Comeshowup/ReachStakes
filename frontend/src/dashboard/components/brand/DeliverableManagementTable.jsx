import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ListChecks, Clock, CheckCircle, RotateCcw, Send, FileText, Video,
    DollarSign, ChevronDown, ChevronUp, Loader2, AlertCircle, User,
} from 'lucide-react';
import { useDeliverables, useReviewDeliverable } from '../../../hooks/useDeliverables';

const STATUS_CONFIG = {
    Pending:            { label: 'Pending',           color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    ScriptRequired:     { label: 'Script Required',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    ScriptSubmitted:    { label: 'Script Submitted',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    ScriptApproved:     { label: 'Script Approved',   color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    MockDraftSubmitted: { label: 'Mock Submitted',    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    MockDraftApproved:  { label: 'Mock Approved',     color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    FinalDraftSubmitted:{ label: 'Needs Review',      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    RevisionRequested:  { label: 'Revision Sent',     color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    FinalApproved:      { label: 'Approved',          color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    Published:          { label: 'Published',         color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    PaymentReleased:    { label: 'Paid',              color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
};

const REVIEW_ACTIONS = [
    { action: 'approve', label: 'Approve', style: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' } },
    { action: 'revision', label: 'Request Revision', style: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' } },
];

const AWAITING_REVIEW_STATUSES = ['ScriptSubmitted', 'MockDraftSubmitted', 'FinalDraftSubmitted'];

/** Single creator's deliverables row, expandable */
const CreatorDeliverableRow = ({ collaboration, campaignId }) => {
    const [expanded, setExpanded] = useState(false);
    const [reviewState, setReviewState] = useState({}); // { [deliverableId]: { feedback, acting } }
    const { deliverables, loading, refetch } = useDeliverables(expanded ? collaboration.id : null);
    const { review, reviewing } = useReviewDeliverable();

    const pendingCount = (collaboration.deliverableItems || []).filter(d =>
        AWAITING_REVIEW_STATUSES.includes(d.status)
    ).length;

    const handleReview = async (deliverableId, action, feedback) => {
        try {
            await review(deliverableId, { action, feedback });
            refetch();
        } catch (_) {}
    };

    return (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd-border-subtle)', background: 'var(--bd-surface-panel)' }}>
            {/* Row Header */}
            <button
                onClick={() => setExpanded(x => !x)}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
                style={{ borderBottom: expanded ? '1px solid var(--bd-border-subtle)' : 'none' }}
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {(collaboration.creatorName || '?').charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--bd-text-primary)' }}>
                        {collaboration.creatorName || `Creator #${collaboration.creatorId}`}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--bd-text-secondary)' }}>
                        {(collaboration.deliverableItems || []).length} deliverable{(collaboration.deliverableItems || []).length !== 1 ? 's' : ''}
                        {pendingCount > 0 && <span className="ml-1.5 font-bold" style={{ color: '#a78bfa' }}>· {pendingCount} need{pendingCount === 1 ? 's' : ''} review</span>}
                    </p>
                </div>

                {/* Summary badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {pendingCount > 0 && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#a78bfa' }}>
                            {pendingCount}
                        </span>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} />}
                </div>
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div className="p-3 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--bd-accent-primary)' }} />
                        </div>
                    ) : deliverables.length === 0 ? (
                        <p className="text-xs text-center py-4" style={{ color: 'var(--bd-text-secondary)' }}>No deliverables found</p>
                    ) : (
                        deliverables.map(d => {
                            const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.Pending;
                            const needsReview = AWAITING_REVIEW_STATUSES.includes(d.status);
                            const rs = reviewState[d.id] || {};

                            // Get latest submission for display
                            const latestSub = d.submissions?.[0];

                            return (
                                <div key={d.id} className="rounded-lg p-3" style={{ background: 'var(--bd-surface-input)', border: needsReview ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{d.title}</span>
                                            {d.contentType && <span className="ml-1.5 text-[10px]" style={{ color: 'var(--bd-text-secondary)' }}>{d.contentType.replace(/_/g, ' ')}</span>}
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                                            {cfg.label}
                                        </span>
                                        {d.paymentAmount && (
                                            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#34d399' }}>
                                                ${parseFloat(d.paymentAmount).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Latest submission preview */}
                                    {latestSub && (
                                        <div className="mb-2 text-[11px] leading-relaxed" style={{ color: 'var(--bd-text-secondary)' }}>
                                            {latestSub.type.replace(/([A-Z])/g, ' $1').trim()} V{latestSub.version}
                                            {latestSub.fileUrl && <> · <a href={latestSub.fileUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--bd-accent-primary)' }}>View File</a></>}
                                            {latestSub.externalUrl && <> · <a href={latestSub.externalUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--bd-accent-primary)' }}>Platform Link</a></>}
                                            {latestSub.textContent && <div className="mt-1 px-2 py-1.5 rounded text-[10px] whitespace-pre-wrap max-h-16 overflow-hidden" style={{ background: 'var(--bd-surface-panel)' }}>{latestSub.textContent.slice(0, 200)}{latestSub.textContent.length > 200 ? '…' : ''}</div>}
                                        </div>
                                    )}

                                    {/* Review Actions */}
                                    {needsReview && (
                                        <div className="space-y-2 mt-2">
                                            <textarea
                                                placeholder="Feedback for creator (required for revision, optional for approval)..."
                                                rows={2}
                                                value={rs.feedback || ''}
                                                onChange={e => setReviewState(prev => ({ ...prev, [d.id]: { ...prev[d.id], feedback: e.target.value } }))}
                                                className="w-full px-3 py-2 rounded-lg text-[11px] resize-none outline-none"
                                                style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-primary)' }}
                                            />
                                            <div className="flex gap-2">
                                                {REVIEW_ACTIONS.map(({ action, label, style }) => (
                                                    <button
                                                        key={action}
                                                        disabled={reviewing}
                                                        onClick={() => handleReview(d.id, action, rs.feedback)}
                                                        className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                                                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * DeliverableManagementTable — brand-side overview of all creator deliverables for a campaign.
 * Shows each creator's deliverables with inline review capability.
 */
const DeliverableManagementTable = ({ collaborations = [], campaignId }) => {
    const [statusFilter, setStatusFilter] = useState('all');

    const activeCollabs = collaborations.filter(c =>
        ['Approved', 'In_Progress', 'Under_Review', 'Completed'].includes(c.status)
    );

    const needsReview = activeCollabs.filter(c =>
        (c.deliverableItems || []).some(d => ['ScriptSubmitted', 'MockDraftSubmitted', 'FinalDraftSubmitted'].includes(d.status))
    );

    if (activeCollabs.length === 0) {
        return (
            <div className="text-center py-16 rounded-xl" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--bd-text-primary)' }}>No active creator assignments</p>
                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>Accept creator invitations to start assigning deliverables.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Bar */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Active Creators', value: activeCollabs.length, color: 'var(--bd-text-primary)', icon: User },
                    { label: 'Needs Review', value: needsReview.length, color: needsReview.length > 0 ? '#a78bfa' : 'var(--bd-text-secondary)', icon: AlertCircle },
                    { label: 'Total Deliverables', value: activeCollabs.reduce((sum, c) => sum + (c.deliverableItems?.length || 0), 0), color: 'var(--bd-text-primary)', icon: ListChecks },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                        <Icon className="w-4 h-4 mb-2 opacity-60" style={{ color }} />
                        <p className="text-xl font-bold" style={{ color }}>{value}</p>
                        <p className="text-[10px] uppercase tracking-wider font-medium mt-0.5" style={{ color: 'var(--bd-text-secondary)' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Creator Rows */}
            <div className="space-y-2">
                {activeCollabs.map(collab => (
                    <CreatorDeliverableRow
                        key={collab.id}
                        collaboration={collab}
                        campaignId={campaignId}
                    />
                ))}
            </div>
        </div>
    );
};

export default DeliverableManagementTable;
