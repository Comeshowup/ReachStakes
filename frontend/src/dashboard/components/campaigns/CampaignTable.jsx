import React from 'react';
import { Briefcase, Loader2 } from 'lucide-react';
import CampaignRow from './CampaignRow';

/**
 * Campaign table with header, rows, loading skeleton, and empty state.
 */
const CampaignTable = ({ campaigns = [], loading = false, emptyMessage = 'No campaigns found' }) => {
    const columns = ['Brand', 'Campaign', 'Deliverables', 'Deadline', 'Payment', 'Status', ''];

    if (loading) {
        return (
            <div
                className="rounded-xl overflow-hidden"
                style={{
                    background: 'var(--bd-surface-panel)',
                    border: '1px solid var(--bd-border-subtle)',
                }}
            >
                <div className="flex items-center justify-center py-16">
                    <Loader2
                        className="w-6 h-6 animate-spin"
                        style={{ color: 'var(--bd-accent-primary)' }}
                    />
                </div>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div
                className="rounded-xl overflow-hidden text-center py-16 px-6"
                style={{
                    background: 'var(--bd-surface-panel)',
                    border: '1px solid var(--bd-border-subtle)',
                }}
            >
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--bd-text-secondary)' }}>
                    {emptyMessage}
                </p>
            </div>
        );
    }

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{
                background: 'var(--bd-surface-panel)',
                border: '1px solid var(--bd-border-subtle)',
            }}
        >
            <table className="w-full">
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className="py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--bd-text-secondary)' }}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map((campaign) => (
                        <CampaignRow key={campaign.id} campaign={campaign} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CampaignTable;
