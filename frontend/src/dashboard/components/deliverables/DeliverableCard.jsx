import React from 'react';
import {
    Clock, CheckCircle, RotateCcw, FileText, Video, Send,
    ChevronRight, DollarSign, AlertCircle, Sparkles, Tv,
    Instagram, Youtube, Twitch, Play, HelpCircle
} from 'lucide-react';

const PLATFORM_ICONS = {
    Instagram: Instagram,
    TikTok: Tv,
    YouTube: Youtube,
    Twitch: Twitch,
};

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

/** Get Priority based on deadline */
function getPriority(deadline, status) {
    if (['FinalApproved', 'Published', 'PaymentReleased'].includes(status)) {
        return { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' };
    }
    if (!deadline) {
        return { label: 'Low', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' };
    }
    const diff = new Date(deadline) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) {
        return { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' };
    }
    if (days <= 3) {
        return { label: 'High', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' };
    }
    if (days <= 7) {
        return { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' };
    }
    return { label: 'Low', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' };
}

/** Determine the next action CTA for the creator */
function getNextAction(status) {
    switch (status) {
        case 'Pending': 
        case 'ScriptRequired': 
            return { label: 'Submit Deliverable', urgent: true };
        case 'ScriptSubmitted': 
        case 'MockDraftSubmitted': 
        case 'FinalDraftSubmitted': 
            return { label: 'View Submission', urgent: false };
        case 'ScriptApproved': 
        case 'MockDraftApproved': 
            return { label: 'Submit Deliverable', urgent: false };
        case 'RevisionRequested': 
            return { label: 'Submit Revision', urgent: true };
        case 'FinalApproved': 
        case 'Published': 
        case 'PaymentReleased': 
            return { label: 'View Approved Submission', urgent: false };
        default: 
            return { label: 'View Details', urgent: false };
    }
}

/**
 * DeliverableCard — Redesigned task card for a single deliverable.
 * Displays details, priorities, checklist completeness, and an action button to open workspace drawer.
 */
const DeliverableCard = ({ deliverable, onSelect }) => {
    const cfg = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.Pending;
    const StatusIcon = cfg.icon;
    const progress = getProgress(deliverable.status, deliverable.requireScript, deliverable.requireMockDraft);
    const nextAction = getNextAction(deliverable.status);
    const isOverdue = deliverable.deadline && new Date(deliverable.deadline) < new Date() && !['FinalApproved', 'Published', 'PaymentReleased'].includes(deliverable.status);
    const priority = getPriority(deliverable.deadline, deliverable.status);

    const PlatformIcon = PLATFORM_ICONS[deliverable.platform] || HelpCircle;

    const handleCardClick = (e) => {
        // Prevent event triggering twice if clicking button itself
        onSelect(deliverable.id);
    };

    return (
        <div
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
            className="group rounded-xl p-5 transition-all duration-300 cursor-pointer hover:translate-y-[-2px]"
            style={{
                background: 'var(--bd-surface-panel)',
                border: `1px solid ${deliverable.status === 'RevisionRequested' ? 'rgba(249,115,22,0.35)' : 'var(--bd-border-subtle)'}`,
                boxShadow: deliverable.status === 'RevisionRequested' 
                    ? '0 4px 20px -2px rgba(249,115,22,0.08)' 
                    : '0 4px 12px -2px rgba(0,0,0,0.12)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = deliverable.status === 'RevisionRequested' ? 'rgba(249,115,22,0.5)' : 'var(--bd-accent-primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = deliverable.status === 'RevisionRequested' ? 'rgba(249,115,22,0.35)' : 'var(--bd-border-subtle)';
            }}
        >
            {/* Top Row: Title, Platform & Status Badges */}
            <div className="flex items-start justify-between gap-4 mb-3.5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                            <PlatformIcon className="w-3.5 h-3.5 text-indigo-400" />
                            {deliverable.platform}
                        </span>
                        <span className="text-slate-700 text-xs">•</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            {deliverable.contentType?.replace(/_/g, ' ') || 'Content'}
                        </span>
                    </div>
                    <h4 className="text-[15px] font-bold truncate text-white">
                        {deliverable.title}
                    </h4>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                    </span>
                    <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: priority.bg, color: priority.color, border: `1px solid ${priority.border || 'transparent'}` }}
                    >
                        {priority.label} Priority
                    </span>
                </div>
            </div>

            {/* Workflow Progress Indicator */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Workflow Progress
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: progress === 100 ? '#10b981' : 'var(--bd-text-secondary)' }}>
                        {progress}% Completed
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

            {/* Bottom Row: Financials + Schedule + Primary CTA */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                <div className="flex items-center gap-4">
                    {deliverable.paymentAmount && (
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Earnings</span>
                            <div className="flex items-center text-xs font-bold text-white">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500 mr-0.5" />
                                ${parseFloat(deliverable.paymentAmount).toLocaleString()}
                            </div>
                        </div>
                    )}
                    {deliverable.deadline && (
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Due Date</span>
                            <div className="flex items-center text-xs font-medium" style={{ color: isOverdue ? '#ef4444' : 'var(--bd-text-secondary)' }}>
                                {isOverdue ? (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 mr-1 shrink-0" />
                                ) : (
                                    <Clock className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
                                )}
                                <span>
                                    {new Date(deliverable.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {nextAction && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(deliverable.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                        style={{
                            background: nextAction.urgent ? 'rgba(249,115,22,0.1)' : 'rgba(99,102,241,0.08)',
                            color: nextAction.urgent ? '#fb923c' : 'var(--bd-accent-primary)',
                            border: `1px solid ${nextAction.urgent ? 'rgba(249,115,22,0.35)' : 'rgba(99,102,241,0.2)'}`,
                        }}
                    >
                        {nextAction.label}
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DeliverableCard;
