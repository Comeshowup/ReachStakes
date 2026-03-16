import React from 'react';
import { FolderOpen, Clock, RotateCcw, CheckCircle, Mail } from 'lucide-react';

const TABS = [
    { id: 'active', label: 'Active', icon: FolderOpen, countKey: 'activeCount' },
    { id: 'pending', label: 'Pending Review', icon: Clock, countKey: 'pendingCount' },
    { id: 'revision', label: 'Revisions', icon: RotateCcw, countKey: 'revisionCount' },
    { id: 'completed', label: 'Completed', icon: CheckCircle, countKey: 'completedCount' },
    { id: 'invitations', label: 'Invitations', icon: Mail, countKey: 'invitationCount', isInbox: true },
];

/**
 * Status tabs for campaign filtering.
 * Uses --bd-* design tokens for theme consistency.
 * Invitations tab renders a red badge to signal pending items.
 */
const CampaignStatusTabs = ({ activeTab = 'active', onTabChange, counts = {} }) => {
    return (
        <nav
            className="flex gap-1 p-1 rounded-xl overflow-x-auto"
            style={{
                background: 'var(--bd-surface-input)',
                border: '1px solid var(--bd-border-subtle)',
            }}
        >
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const count = counts[tab.countKey] || 0;

                // Red badge for invitations (attention-grabbing), regular accent for others
                const badgeBg = tab.isInbox
                    ? (isActive ? 'var(--bd-accent-primary)' : 'rgb(239,68,68)')
                    : (isActive ? 'var(--bd-accent-primary)' : 'var(--bd-surface-panel)');
                const badgeColor = (tab.isInbox || isActive) ? '#fff' : 'var(--bd-text-secondary)';

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
                        style={{
                            background: isActive ? 'var(--bd-sidebar-active)' : 'transparent',
                            color: isActive ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)',
                            boxShadow: isActive ? 'var(--bd-shadow-active-nav)' : 'none',
                        }}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {count > 0 && (
                            <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                                style={{ background: badgeBg, color: badgeColor }}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
};

export default CampaignStatusTabs;
