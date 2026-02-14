import React from 'react';
import { motion } from 'framer-motion';
import {
    MoreHorizontal,
    BarChart,
    Copy,
    Archive,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { formatCurrency, formatROI, calcProgress } from './campaignUtils';

/**
 * CampaignCard — grid view card for a single campaign.
 * Uses CSS classes for all hover states and styling. Zero inline styles.
 */
const CampaignCard = ({ campaign, onView, onFund }) => {
    const utilized = calcProgress(campaign.spent, campaign.budget);
    const roi = formatROI(campaign.roi);
    const needsFunding = ['Draft', 'Pending Payment', 'Active'].includes(campaign.status)
        && campaign.fundingProgress < 100;

    return (
        <div className="bd-cm-card group relative flex flex-col p-6 gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                    <StatusBadge status={campaign.status} />
                    <h3 className="text-base font-semibold truncate" style={{ color: 'var(--bd-text-primary)' }}>
                        {campaign.name}
                    </h3>
                </div>
                <button className="bd-cm-icon-btn bd-cm-focus-ring flex-shrink-0" aria-label="More options">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Metric label="Target Budget" value={formatCurrency(campaign.budget)} />
                <Metric label="Spent">
                    <span className="bd-cm-value">
                        {formatCurrency(campaign.spent)}
                        <span
                            className="text-xs font-normal ml-1"
                            style={{ color: utilized > 100 ? 'var(--bd-danger)' : 'var(--bd-text-muted)' }}
                        >
                            ({utilized}%)
                        </span>
                    </span>
                </Metric>
                <Metric label="Creators" value={campaign.creators} />
                <Metric label="Est. ROI">
                    <span
                        className="bd-cm-value inline-flex items-center gap-1"
                        style={{ color: roi.isPositive ? 'var(--bd-success)' : 'var(--bd-text-muted)' }}
                    >
                        {roi.text}
                        {roi.isPositive && <TrendingUp className="w-3.5 h-3.5" />}
                    </span>
                </Metric>
            </div>

            {/* Progress */}
            <div className="mt-auto">
                <ProgressBar value={utilized} label={`${utilized}% utilized`} />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-1.5 pt-4 bd-cm-separator">
                <button
                    onClick={() => onView(campaign.id)}
                    className="bd-cm-btn-secondary bd-cm-focus-ring flex-1"
                    aria-label={`View ${campaign.name}`}
                >
                    View Campaign <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {needsFunding && onFund && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onFund(campaign.id); }}
                        className="bd-cm-btn-fund bd-cm-focus-ring"
                        aria-label={`Fund ${campaign.name}`}
                    >
                        Fund
                    </button>
                )}

                <button className="bd-cm-icon-btn bd-cm-focus-ring" aria-label="Analytics">
                    <BarChart className="w-3.5 h-3.5" />
                </button>
                <button className="bd-cm-icon-btn bd-cm-focus-ring" aria-label="Duplicate">
                    <Copy className="w-3.5 h-3.5" />
                </button>
                <button className="bd-cm-icon-btn bd-cm-focus-ring" aria-label="Archive">
                    <Archive className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

/** Metric cell — consistent label/value hierarchy */
const Metric = ({ label, value, children }) => (
    <div className="flex flex-col gap-1">
        <span className="bd-cm-label">{label}</span>
        {children || <span className="bd-cm-value">{value}</span>}
    </div>
);

export default CampaignCard;
