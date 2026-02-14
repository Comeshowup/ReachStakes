import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { useContentApprovals } from '../../../data/hooks/useDashboardWidgets';

// --- Skeleton ---
const Skeleton = ({ className = '' }) => (
    <div className={`bd-skeleton ${className}`} />
);

const ContentQueueSkeleton = () => (
    <div className="bd-card p-6 space-y-4">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
            </div>
        </div>
        {[1, 2].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
    </div>
);

// --- Error Fallback ---
const ErrorFallback = ({ onRetry }) => (
    <div className="bd-card p-8 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--bd-danger)' }} />
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--bd-text-primary)' }}>
            Failed to load content queue
        </p>
        <button onClick={onRetry}
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'var(--bd-secondary)', color: 'var(--bd-secondary-fg)' }}>
            Try again
        </button>
    </div>
);

// --- Main Component ---
const ContentQueueWidget = React.memo(function ContentQueueWidget({ className = '' }) {
    const navigate = useNavigate();
    const { data: approvals, isLoading, isError, refetch } = useContentApprovals();

    if (isLoading) return <ContentQueueSkeleton />;
    if (isError) return <ErrorFallback onRetry={refetch} />;

    const hasPending = approvals?.groupedByCampaign?.length > 0;
    const totalPending = approvals?.totalPending || 0;

    const submissions = hasPending
        ? approvals.groupedByCampaign.flatMap(group =>
            group.submissions.slice(0, 2).map(sub => ({
                ...sub,
                campaignTitle: group.campaignTitle,
                campaignId: group.campaignId,
            }))
        ).slice(0, 3)
        : [];

    // Empty state
    if (!hasPending) {
        return (
            <div className={`bd-card h-full ${className}`}>
                <div className="flex items-center gap-3 px-6 py-5">
                    <div className="p-2.5 rounded-2xl"
                        style={{ background: 'var(--bd-purple-muted)', border: '1px solid var(--bd-purple-border)' }}>
                        <FileText className="h-5 w-5" style={{ color: 'var(--bd-purple)' }} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight"
                            style={{ color: 'var(--bd-text-primary)' }}>
                            Content Queue
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                            Submissions awaiting review
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="p-4 rounded-full mb-4" style={{ background: 'var(--bd-bg-tertiary)' }}>
                        <Eye className="h-8 w-8" style={{ color: 'var(--bd-text-secondary)' }} />
                    </div>
                    <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--bd-text-primary)' }}>
                        No submissions awaiting review
                    </h4>
                    <p className="text-sm max-w-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                        New submissions from creators will appear here for you to review and approve
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`h-full ${className}`}
        >
            <div className="bd-card h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl"
                            style={{ background: 'var(--bd-purple-muted)', border: '1px solid var(--bd-purple-border)' }}>
                            <FileText className="h-5 w-5" style={{ color: 'var(--bd-purple)' }} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight"
                                style={{ color: 'var(--bd-text-primary)' }}>
                                Content Queue
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                                Submissions awaiting review
                            </p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg"
                        style={{
                            background: 'var(--bd-surface-overlay)',
                            border: '1px solid var(--bd-border-strong)',
                            color: 'var(--bd-text-primary)'
                        }}>
                        <Clock className="h-3 w-3" />
                        {totalPending} pending
                    </span>
                </div>

                {/* Submissions List */}
                <div className="px-6 pb-6 space-y-4 flex-1 overflow-y-auto">
                    {submissions.map((sub) => (
                        <div key={sub.id}
                            className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl border transition-all"
                            style={{
                                borderColor: 'var(--bd-border-subtle)',
                                background: 'var(--bd-surface-header)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--bd-surface-hover)';
                                e.currentTarget.style.boxShadow = 'var(--bd-shadow-md)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--bd-surface-header)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            {/* Avatar */}
                            <div className="h-10 w-10 mt-1 rounded-xl border flex items-center justify-center shrink-0"
                                style={{
                                    borderColor: 'var(--bd-border-strong)',
                                    background: 'var(--bd-bg-tertiary)',
                                    color: 'var(--bd-primary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>
                                {(sub.creator || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--bd-text-value)' }}>
                                            {sub.contentType || 'Content Submission'}
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                                            by <span style={{ color: 'var(--bd-text-primary)' }}>{sub.creator}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs font-medium"
                                    style={{ color: 'var(--bd-text-secondary)' }}>
                                    <span className="px-2 py-0.5 rounded-md"
                                        style={{ background: 'var(--bd-bg-tertiary)' }}>
                                        {sub.campaignTitle}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="hidden sm:flex items-center gap-2 mt-4">
                                    <button
                                        onClick={() => navigate('/brand/approvals')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{
                                            background: 'var(--bd-primary)',
                                            color: 'var(--bd-primary-fg)',
                                            boxShadow: 'var(--bd-shadow-sm)'
                                        }}>
                                        <Eye className="h-3.5 w-3.5" />
                                        Review
                                    </button>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                                        style={{
                                            color: 'var(--bd-success)',
                                            borderColor: 'var(--bd-success-border)',
                                            background: 'transparent'
                                        }}>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Approve
                                    </button>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                                        style={{
                                            color: 'var(--bd-danger)',
                                            borderColor: 'var(--bd-danger-border)',
                                            background: 'transparent'
                                        }}>
                                        <XCircle className="h-3.5 w-3.5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
});

export default ContentQueueWidget;
