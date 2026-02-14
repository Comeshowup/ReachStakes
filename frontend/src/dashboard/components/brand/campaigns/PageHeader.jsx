import React, { useMemo } from 'react';
import { Plus, Calendar, ChevronDown } from 'lucide-react';

/**
 * PageHeader — Campaign Management Console page header.
 * Uses CSS classes for buttons. Memoizes formatted date.
 */
const PageHeader = ({ onCreate }) => {
    const currentMonth = useMemo(
        () =>
            new Intl.DateTimeFormat('en-US', {
                month: 'long',
                year: 'numeric',
            }).format(new Date()),
        []
    );

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 bd-cm-separator">
            <div className="space-y-0.5">
                <h1
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: 'var(--bd-text-primary)' }}
                >
                    Campaigns
                </h1>
                <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                    Manage and monitor campaign performance
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    className="bd-cm-btn-secondary bd-cm-focus-ring hidden md:inline-flex text-sm"
                    style={{ color: 'var(--bd-text-secondary)' }}
                >
                    <Calendar className="w-4 h-4" />
                    <span>{currentMonth}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                </button>

                <button
                    onClick={onCreate}
                    className="bd-cm-btn-primary bd-cm-focus-ring"
                    aria-label="Create campaign"
                >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                </button>
            </div>
        </div>
    );
};

export default PageHeader;
