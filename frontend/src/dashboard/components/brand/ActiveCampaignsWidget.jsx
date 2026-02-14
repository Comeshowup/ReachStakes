import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Plus,
    MoreHorizontal,
    Search,
    Filter,
    AlertCircle
} from 'lucide-react';
import { useCampaignsTable } from '../../../data/hooks/useDashboardWidgets';

// --- Skeleton ---
const Skeleton = ({ className = '' }) => (
    <div className={`bd-skeleton ${className}`} />
);

const TableSkeleton = () => (
    <div className="bd-card overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
        </div>
    </div>
);

// --- Error Fallback ---
const ErrorFallback = ({ onRetry }) => (
    <div className="bd-card p-8 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--bd-danger)' }} />
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--bd-text-primary)' }}>
            Failed to load campaigns
        </p>
        <button onClick={onRetry}
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'var(--bd-secondary)', color: 'var(--bd-secondary-fg)' }}>
            Try again
        </button>
    </div>
);

// --- Status Badge (semantic tokens) ---
const StatusBadge = ({ status }) => {
    const styles = {
        Active: { bg: 'var(--bd-success-muted)', color: 'var(--bd-success)' },
        Draft: { bg: 'var(--bd-secondary)', color: 'var(--bd-muted-fg)' },
        Paused: { bg: 'var(--bd-warning-muted)', color: 'var(--bd-warning)' },
        Completed: { bg: 'var(--bd-info-muted)', color: 'var(--bd-info)' },
    };
    const s = styles[status] || styles.Draft;
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize"
            style={{ background: s.bg, color: s.color }}>
            {status}
        </span>
    );
};

// --- Pacing Badge (semantic tokens) ---
const PacingBadge = ({ pacing }) => {
    const label = pacing?.status || '—';
    const styles = {
        'On Track': { bg: 'var(--bd-success-muted)', color: 'var(--bd-success)' },
        'Ahead': { bg: 'var(--bd-info-muted)', color: 'var(--bd-info)' },
        'Overspending': { bg: 'var(--bd-danger-muted)', color: 'var(--bd-danger)' },
        'Underspending': { bg: 'var(--bd-warning-muted)', color: 'var(--bd-warning)' },
    };
    const s = styles[label] || { bg: 'var(--bd-secondary)', color: 'var(--bd-muted-fg)' };
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ background: s.bg, color: s.color }}>
            {label === 'On Track' ? 'On Track' : label === 'Ahead' ? 'Ahead' : label}
        </span>
    );
};

// --- Main Component ---
const ActiveCampaignsWidget = React.memo(function ActiveCampaignsWidget({ className = '' }) {
    const navigate = useNavigate();
    const { data: campaigns, isLoading, isError, refetch } = useCampaignsTable();
    const [searchQuery, setSearchQuery] = useState('');

    if (isLoading) return <TableSkeleton />;
    if (isError) return <ErrorFallback onRetry={refetch} />;

    const filtered = (campaigns || []).filter(c =>
        !searchQuery || (c.title || c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const activeCount = (campaigns || []).filter(c => c.status === 'Active').length;

    // Empty state
    if (!campaigns || campaigns.length === 0) {
        return (
            <div className={`bd-card p-12 text-center ${className}`}>
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--bd-info-muted)' }}>
                    <TrendingUp className="w-8 h-8" style={{ color: 'var(--bd-info)', opacity: 0.5 }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--bd-text-primary)' }}>
                    No campaigns yet
                </h3>
                <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--bd-text-secondary)' }}>
                    Create your first campaign to start collaborating with creators and tracking performance.
                </p>
                <button
                    onClick={() => navigate('/brand/campaigns')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
                    style={{
                        background: 'var(--bd-primary)',
                        color: 'var(--bd-primary-fg)',
                        boxShadow: 'var(--bd-shadow-primary-btn)'
                    }}>
                    <Plus className="w-5 h-5" />
                    Create Campaign
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={className}
        >
            <div className="bd-card flex flex-col overflow-hidden h-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight"
                            style={{ color: 'var(--bd-text-primary)' }}>
                            Active Campaigns
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                            {activeCount} campaign{activeCount !== 1 ? 's' : ''} running
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4"
                                style={{ color: 'var(--bd-text-secondary)' }} />
                            <input
                                type="search"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border outline-none transition-all"
                                style={{
                                    background: 'var(--bd-surface-overlay)',
                                    borderColor: 'var(--bd-border-strong)',
                                    color: 'var(--bd-text-primary)'
                                }}
                                aria-label="Search campaigns"
                            />
                        </div>
                        <button className="shrink-0 p-2.5 rounded-xl border"
                            style={{ borderColor: 'var(--bd-border-strong)' }}
                            aria-label="Filter campaigns">
                            <Filter className="h-4 w-4" style={{ color: 'var(--bd-text-secondary)' }} />
                        </button>
                        <button
                            onClick={() => navigate('/brand/campaigns')}
                            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{
                                background: 'var(--bd-primary)',
                                color: 'var(--bd-primary-fg)',
                                boxShadow: 'var(--bd-shadow-primary-btn)'
                            }}>
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">New Campaign</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    <div className="rounded-2xl border mx-6 mb-6 overflow-hidden"
                        style={{ borderColor: 'var(--bd-border-subtle)', background: 'var(--bd-surface-elevated)' }}>
                        <table className="w-full" role="table">
                            <caption className="sr-only">Active Campaigns</caption>
                            <thead>
                                <tr style={{ background: 'var(--bd-bg-tertiary)', borderBottom: '1px solid var(--bd-border-subtle)' }}>
                                    {['Campaign', 'Status', 'Creators', 'ROI', 'Budget', 'Pacing'].map(h => (
                                        <th key={h} scope="col"
                                            className="text-left text-xs uppercase font-semibold tracking-wider py-4 px-6"
                                            style={{ color: 'var(--bd-text-muted)' }}>
                                            {h}
                                        </th>
                                    ))}
                                    <th scope="col" className="w-[50px] py-4"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((campaign) => (
                                    <tr key={campaign.id}
                                        onClick={() => navigate(`/brand/workspace/${campaign.id}`)}
                                        className="cursor-pointer group transition-colors"
                                        style={{ borderBottom: '1px solid var(--bd-border-muted)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bd-bg-tertiary)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td className="py-4 px-6">
                                            <p className="font-semibold" style={{ color: 'var(--bd-text-value)' }}>
                                                {campaign.title || campaign.name}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={campaign.status} />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(3, campaign.creatorCount || 0))].map((_, i) => (
                                                    <div key={i}
                                                        className="h-6 w-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
                                                        style={{
                                                            borderColor: 'var(--bd-bg-primary)',
                                                            background: 'var(--bd-muted)',
                                                            color: 'var(--bd-muted-fg)'
                                                        }}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                ))}
                                                {(campaign.creatorCount || 0) > 3 && (
                                                    <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
                                                        style={{
                                                            borderColor: 'var(--bd-bg-primary)',
                                                            background: 'var(--bd-muted)',
                                                            color: 'var(--bd-muted-fg)'
                                                        }}>
                                                        +{(campaign.creatorCount || 0) - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {campaign.roi?.value > 0 ? (
                                                <div className="flex items-center gap-1.5 font-medium"
                                                    style={{ color: 'var(--bd-success)' }}>
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span>{campaign.roi.displayValue || `+${campaign.roi.value}%`}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--bd-text-secondary)' }}>—</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-sm font-medium"
                                                        style={{ color: 'var(--bd-text-primary)' }}>
                                                        {campaign.budget?.percentUsed != null ? `${campaign.budget.percentUsed}%` : '—'}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-32 rounded-full overflow-hidden"
                                                    style={{ background: 'var(--bd-progress-track)' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(campaign.budget?.percentUsed || 0, 100)}%` }}
                                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        className="h-full rounded-full"
                                                        style={{ background: 'var(--bd-primary)' }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <PacingBadge pacing={campaign.pacing} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={`Actions for ${campaign.title || campaign.name}`}
                                                onClick={e => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4" style={{ color: 'var(--bd-text-secondary)' }} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default ActiveCampaignsWidget;
