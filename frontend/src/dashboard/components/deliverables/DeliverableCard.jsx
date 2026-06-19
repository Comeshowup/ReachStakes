import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, CheckCircle, RotateCcw, FileText, Video, Send,
    ChevronRight, DollarSign, AlertCircle, Sparkles,
} from 'lucide-react';

const STATUS_CONFIG = {
    Pending:            { label: 'Pending',           color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', icon: Clock },
    ScriptRequired:     { label: 'Script Required',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: FileText },
    ScriptSubmitted:    { label: 'Script Submitted',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)', icon: Send },
    ScriptApproved:     { label: 'Script Approved',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)', icon: CheckCircle },
    MockDraftSubmitted: { label: 'Mock Submitted',    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)', icon: Video },
    MockDraftApproved:  { label: 'Mock Approved',     color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)', icon: CheckCircle },
    FinalDraftSubmitted:{ label: 'Final Submitted',   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)',icon: Send },
    RevisionRequested:  { label: 'Revision Needed',   color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)', icon: RotateCcw },
    FinalApproved:      { label: 'Approved',          color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: CheckCircle },
    Published:          { label: 'Published',         color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)',  icon: Sparkles },
    PaymentReleased:    { label: 'Paid',              color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)', icon: DollarSign },
};

/** Calculate progress percentage through the workflow */
function getProgress(status, requireScript, requireMockDraft) {
    const steps = ['Pending'];
    if (requireScript) steps.push('ScriptRequired', 'ScriptSubmitted', 'ScriptApproved');
    if (requireMockDraft) steps.push('MockDraftSubmitted', 'MockDraftApproved');
    steps.push('FinalDraftSubmitted', 'FinalApproved', 'Published', 'PaymentReleased');
    const idx = steps.indexOf(status);
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / steps.length) * 100);
}

/** Determine the next action CTA for the creator */
function getNextAction(status) {
    switch (status) {
        case 'Pending': return { label: 'Start Working', urgent: false };
        case 'ScriptRequired': return { label: 'Submit Script', urgent: true };
        case 'ScriptApproved': return { label: 'Submit Mock Draft', urgent: false };
        case 'MockDraftApproved': return { label: 'Submit Final Draft', urgent: false };
        case 'RevisionRequested': return { label: 'Submit Revision', urgent: true };
        case 'FinalApproved': return { label: 'Publish Content', urgent: false };
        default: return null;
    }
}

/**
 * DeliverableCard — Task card for a single deliverable.
 * Displays status, payment, progress, deadline, and next action CTA.
 */
const DeliverableCard = ({ deliverable, campaignId }) => {
    const navigate = useNavigate();
    const cfg = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.Pending;
    const StatusIcon = cfg.icon;
    const progress = getProgress(deliverable.status, deliverable.requireScript, deliverable.requireMockDraft);
    const nextAction = getNextAction(deliverable.status);
    const isOverdue = deliverable.deadline && new Date(deliverable.deadline) < new Date() && !['FinalApproved', 'Published', 'PaymentReleased'].includes(deliverable.status);

    const handleClick = () => {
        navigate(`/creator/campaigns/${campaignId}/deliverables/${deliverable.id}`);
    };

    return (
        <div
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            className="group rounded-xl p-5 transition-all cursor-pointer"
            style={{
                background: 'var(--bd-surface-panel)',
                border: `1px solid ${deliverable.status === 'RevisionRequested' ? 'rgba(249,115,22,0.35)' : 'var(--bd-border-subtle)'}`,
                boxShadow: deliverable.status === 'RevisionRequested' ? '0 0 0 1px rgba(249,115,22,0.1)' : 'none',
            }}
        >
            {/* Top Row: Title + Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate mb-0.5" style={{ color: 'var(--bd-text-primary)' }}>
                        {deliverable.title}
                    </h4>
                    {deliverable.contentType && (
                        <span className="text-[11px] font-medium" style={{ color: 'var(--bd-text-secondary)' }}>
                            {deliverable.contentType.replace(/_/g, ' ')}
                        </span>
                    )}
                </div>
                <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bd-text-secondary)' }}>
                        Progress
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: progress === 100 ? '#34d399' : 'var(--bd-text-secondary)' }}>
                        {progress}%
                    </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bd-surface-input)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progress}%`,
                            background: progress === 100
                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                : deliverable.status === 'RevisionRequested'
                                    ? 'linear-gradient(90deg, #f97316, #fb923c)'
                                    : 'linear-gradient(90deg, var(--bd-accent-primary), #60a5fa)',
                        }}
                    />
                </div>
            </div>

            {/* Bottom Row: Payment + Deadline + Action */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    {deliverable.paymentAmount && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" style={{ color: '#34d399' }} />
                            <span className="text-xs font-bold" style={{ color: 'var(--bd-text-primary)' }}>
                                ${parseFloat(deliverable.paymentAmount).toLocaleString()}
                            </span>
                        </div>
                    )}
                    {deliverable.deadline && (
                        <div className="flex items-center gap-1">
                            {isOverdue ? (
                                <AlertCircle className="w-3 h-3" style={{ color: '#ef4444' }} />
                            ) : (
                                <Clock className="w-3 h-3" style={{ color: 'var(--bd-text-secondary)' }} />
                            )}
                            <span
                                className="text-xs font-medium"
                                style={{ color: isOverdue ? '#ef4444' : 'var(--bd-text-secondary)' }}
                            >
                                {new Date(deliverable.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    )}
                </div>

                {nextAction ? (
                    <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all group-hover:brightness-110"
                        style={{
                            background: nextAction.urgent ? 'rgba(249,115,22,0.15)' : 'rgba(99,102,241,0.12)',
                            color: nextAction.urgent ? '#fb923c' : 'var(--bd-accent-primary)',
                            border: `1px solid ${nextAction.urgent ? 'rgba(249,115,22,0.3)' : 'rgba(99,102,241,0.2)'}`,
                        }}
                    >
                        {nextAction.label}
                        <ChevronRight className="w-3 h-3" />
                    </span>
                ) : (
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--bd-text-secondary)' }} />
                )}
            </div>
        </div>
    );
};

export default DeliverableCard;
