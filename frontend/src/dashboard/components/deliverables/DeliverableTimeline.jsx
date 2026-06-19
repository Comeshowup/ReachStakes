import React from 'react';
import {
    Clock, CheckCircle, Send, RotateCcw, Eye, MessageSquare, DollarSign, Plus, Pencil,
} from 'lucide-react';

const EVENT_ICONS = {
    created: Plus,
    updated: Pencil,
    status_change: Clock,
    submission: Send,
    review: Eye,
    comment: MessageSquare,
    payment: DollarSign,
};

const EVENT_COLORS = {
    created: '#94a3b8',
    updated: '#60a5fa',
    status_change: '#a78bfa',
    submission: '#60a5fa',
    review: '#f59e0b',
    comment: '#94a3b8',
    payment: '#34d399',
};

/**
 * DeliverableTimeline — vertical activity timeline showing status changes,
 * submissions, reviews, and other events.
 */
const DeliverableTimeline = ({ events = [] }) => {
    if (events.length === 0) {
        return (
            <div className="text-center py-10 rounded-xl" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-30" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>No activity yet</p>
            </div>
        );
    }

    return (
        <div className="relative pl-6">
            {/* Vertical line */}
            <div
                className="absolute left-[11px] top-2 bottom-2 w-px"
                style={{ background: 'var(--bd-border-subtle)' }}
            />

            {events.map((event, idx) => {
                const Icon = EVENT_ICONS[event.type] || Clock;
                const color = EVENT_COLORS[event.type] || '#94a3b8';
                const isReviewApprove = event.type === 'review' && event.metadata?.action === 'approve';
                const isReviewRevision = event.type === 'review' && event.metadata?.action === 'revision';

                return (
                    <div key={event.id || idx} className="relative flex gap-3 pb-5 last:pb-0">
                        {/* Dot */}
                        <div
                            className="absolute -left-6 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 z-10"
                            style={{
                                background: isReviewApprove ? 'rgba(52,211,153,0.15)' : isReviewRevision ? 'rgba(249,115,22,0.15)' : `${color}15`,
                                border: `2px solid ${isReviewApprove ? '#34d399' : isReviewRevision ? '#f97316' : color}`,
                            }}
                        >
                            {isReviewApprove ? (
                                <CheckCircle className="w-2.5 h-2.5" style={{ color: '#34d399' }} />
                            ) : isReviewRevision ? (
                                <RotateCcw className="w-2.5 h-2.5" style={{ color: '#f97316' }} />
                            ) : (
                                <Icon className="w-2.5 h-2.5" style={{ color }} />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-[13px] leading-snug" style={{ color: 'var(--bd-text-primary)' }}>
                                {event.description}
                            </p>
                            {event.metadata?.feedback && (
                                <div
                                    className="mt-1.5 px-3 py-2 rounded-lg text-xs leading-relaxed"
                                    style={{
                                        background: 'var(--bd-surface-input)',
                                        border: '1px solid var(--bd-border-subtle)',
                                        color: 'var(--bd-text-secondary)',
                                    }}
                                >
                                    "{event.metadata.feedback}"
                                </div>
                            )}
                            <span className="text-[10px] mt-1 block" style={{ color: 'var(--bd-text-secondary)' }}>
                                {new Date(event.createdAt).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                })}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DeliverableTimeline;
