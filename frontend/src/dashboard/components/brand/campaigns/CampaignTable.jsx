import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { formatCurrency, formatROI, calcProgress } from './campaignUtils';

/**
 * CampaignTable — Fintech-grade table/list view.
 * 52px row height, sticky header, right-aligned numerics.
 */
const CampaignTable = ({ campaigns, onView }) => {
    if (campaigns.length === 0) return null;

    return (
        <div className="bd-cm-table-wrap">
            <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ fontSize: 'var(--bd-font-size-sm)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}>
                            <th className="px-4 w-10 sticky left-0 z-10 bd-cm-sticky-surface" style={{ height: 44 }}>
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
                            <th className="px-4 w-10 sticky right-0 z-10 bd-cm-sticky-surface" style={{ height: 44 }} />
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
                                    style={{ height: 52 }}
                                >
                                    <td className="px-4 sticky left-0 z-10 bd-cm-sticky-surface" style={{ verticalAlign: 'middle' }}>
                                        <input
                                            type="checkbox"
                                            className="rounded bd-cm-focus-ring"
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label={`Select ${campaign.name}`}
                                        />
                                    </td>
                                    <td className="px-4" style={{ verticalAlign: 'middle' }}>
                                        <span
                                            className="font-medium truncate block max-w-[200px]"
                                            style={{ color: 'var(--bd-text-primary)' }}
                                        >
                                            {campaign.name}
                                        </span>
                                    </td>
                                    <td className="px-4" style={{ verticalAlign: 'middle' }}>
                                        <StatusBadge status={campaign.status} />
                                    </td>
                                    <td className="px-4 text-right" style={{ verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--bd-font-mono)' }}>
                                        <span style={{ color: 'var(--bd-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(campaign.budget)}</span>
                                    </td>
                                    <td className="px-4 text-right" style={{ verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--bd-font-mono)' }}>
                                        <span style={{ color: 'var(--bd-text-secondary)', fontSize: '0.875rem' }}>
                                            {formatCurrency(campaign.spent)}
                                        </span>
                                    </td>
                                    <td className="px-4 text-right" style={{ verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--bd-font-mono)' }}>
                                        <span
                                            style={{
                                                color: roi.isPositive ? 'var(--bd-success)' : 'var(--bd-text-muted)',
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {roi.text}
                                        </span>
                                    </td>
                                    <td className="px-4 text-center" style={{ verticalAlign: 'middle', color: 'var(--bd-text-secondary)', fontSize: '0.875rem' }}>
                                        {campaign.creators}
                                    </td>
                                    <td className="px-4 w-32" style={{ verticalAlign: 'middle' }}>
                                        <div className="w-full max-w-[120px]">
                                            <ProgressBar value={utilized} />
                                        </div>
                                    </td>
                                    <td className="px-4 sticky right-0 z-10 bd-cm-sticky-surface text-right" style={{ verticalAlign: 'middle' }}>
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

/** Reusable table header cell — fintech-grade */
const HeadCell = ({ children, align = 'left', className = '' }) => (
    <th
        className={`px-4 ${className}`}
        style={{
            textAlign: align,
            height: 44,
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--bd-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'var(--bd-bg-tertiary)',
            whiteSpace: 'nowrap',
        }}
    >
        {children}
    </th>
);

export default CampaignTable;
