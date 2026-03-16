import React from 'react';
import { Briefcase, ListChecks, Upload, MessageSquare, CreditCard } from 'lucide-react';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'deliverables', label: 'Deliverables', icon: ListChecks },
    { id: 'submissions', label: 'Submissions', icon: Upload },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'payment', label: 'Payment', icon: CreditCard },
];

/**
 * Workspace tab navigation — underline style.
 */
const CampaignTabs = ({ activeTab = 'overview', onTabChange }) => {
    return (
        <nav
            className="flex gap-1 mb-6"
            style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}
        >
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative"
                        style={{
                            color: isActive ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)',
                        }}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}

                        {/* Active underline */}
                        {isActive && (
                            <span
                                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                                style={{ background: 'var(--bd-accent-primary)' }}
                            />
                        )}
                    </button>
                );
            })}
        </nav>
    );
};

export default CampaignTabs;
