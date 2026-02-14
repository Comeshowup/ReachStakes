import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { formatCurrency, formatROI, calcProgress } from './campaignUtils';

/**
 * CampaignTable — table/list view.
 * Uses CSS classes for row hover, sticky columns, and all interaction states.
 */
const CampaignTable = ({ campaigns, onView }) => {
    if (campaigns.length === 0) return null;

    return (
        <div className="bd-cm-table-wrap">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bd-cm-separator">
                            <th className="h-11 px-4 w-10 sticky left-0 z-10 bd-cm-sticky-surface">
                                <input
                                    type="checkbox"
                                    className="rounded bd-cm-focus-ring"
                                    aria-label="Select all campaigns"
                                />
                            </th>
                            <HeadCell>Campaign</HeadCell>
                            <HeadCell>Status</HeadCell>
                            <HeadCell align="right">Budget</HeadCell>
                            <HeadCell align="right">Spent</HeadCell>
                            <HeadCell align="right">ROI</HeadCell>
                            <HeadCell align="center">Creators</HeadCell>
                            <HeadCell className="w-32">Progress</HeadCell>
                            <th className="h-11 px-4 w-10 sticky right-0 z-10 bd-cm-sticky-surface" />
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign) => {
                            const utilized = calcProgress(campaign.spent, campaign.budget);
                            const roi = formatROI(campaign.roi);

                            return (
                                <tr
                                    key={campaign.id}
                                    onClick={() => onView(campaign.id)}
                                    className="bd-cm-table-row group"
                                >
                                    <td className="py-3 px-4 sticky left-0 z-10 bd-cm-sticky-surface">
                                        <input
                                            type="checkbox"
                                            className="rounded bd-cm-focus-ring"
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label={`Select ${campaign.name}`}
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className="font-medium truncate block max-w-[200px]"
                                            style={{ color: 'var(--bd-text-primary)' }}
                                        >
                                            {campaign.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <StatusBadge status={campaign.status} />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="bd-cm-value text-sm">{formatCurrency(campaign.budget)}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: 'var(--bd-text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatCurrency(campaign.spent)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span
                                            className="text-sm font-medium"
                                            style={{
                                                color: roi.isPositive ? 'var(--bd-success)' : 'var(--bd-text-muted)',
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            {roi.text}
                                        </span>
                                    </td>
                                    <td
                                        className="py-3 px-4 text-center text-sm"
                                        style={{ color: 'var(--bd-text-secondary)' }}
                                    >
                                        {campaign.creators}
                                    </td>
                                    <td className="py-3 px-4 w-32">
                                        <div className="w-full max-w-[120px]">
                                            <ProgressBar value={utilized} />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 sticky right-0 z-10 bd-cm-sticky-surface text-right">
                                        <button
                                            className="bd-cm-icon-btn bd-cm-focus-ring"
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label={`Options for ${campaign.name}`}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/** Reusable table header cell */
const HeadCell = ({ children, align = 'left', className = '' }) => (
    <th className={`bd-cm-label h-11 px-4 ${className}`} style={{ textAlign: align }}>
        {children}
    </th>
);

export default CampaignTable;
