import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Mail } from 'lucide-react';
import { useCreatorCampaigns } from '../../../hooks/useCreatorCampaigns';
import CampaignStatusTabs from '../../components/campaigns/CampaignStatusTabs';
import CampaignTable from '../../components/campaigns/CampaignTable';
import InvitationsList from '../../components/campaigns/InvitationsList';

/**
 * Creator Campaigns Page — Campaign Management Hub
 *
 * Tabs:
 *  Active | Pending Review | Revisions | Completed | Invitations
 *
 * The Invitations tab renders InvitationsList (accept/decline UI).
 * All other tabs render the standard CampaignTable.
 */
const CampaignsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        filteredCampaigns,
        invitations,
        activeCount,
        pendingCount,
        revisionCount,
        completedCount,
        invitationCount,
        loading,
        error,
        refetch,
    } = useCreatorCampaigns(activeTab);

    // Apply search filter on top of status filter (only for workspace tabs)
    const displayCampaigns = searchQuery
        ? filteredCampaigns.filter((c) => {
              const q = searchQuery.toLowerCase();
              const title = (c.campaignTitle || c.title || '').toLowerCase();
              const brand = (c.brandName || '').toLowerCase();
              return title.includes(q) || brand.includes(q);
          })
        : filteredCampaigns;

    const isInvitationsTab = activeTab === 'invitations';

    const emptyMessages = {
        active: 'No active campaigns',
        pending: 'No campaigns pending review',
        revision: 'No campaigns needing revisions',
        completed: 'No completed campaigns yet',
    };

    // Show the global empty-workspace CTA only when not on invitations tab
    // and there are truly zero non-invite collaborations
    const showGlobalEmpty =
        !isInvitationsTab &&
        !loading &&
        !error &&
        displayCampaigns.length === 0 &&
        activeTab === 'active' &&
        activeCount === 0 &&
        pendingCount === 0 &&
        completedCount === 0;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold tracking-tight mb-1"
                        style={{ color: 'var(--bd-text-primary)' }}
                    >
                        Campaigns
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                        Manage your active collaborations and track deliverables
                    </p>
                </div>

                {/* Search — only relevant for workspace tabs */}
                {!isInvitationsTab && (
                    <div className="relative w-full sm:w-72">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: 'var(--bd-text-secondary)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-colors"
                            style={{
                                background: 'var(--bd-surface-input)',
                                border: '1px solid var(--bd-border-subtle)',
                                color: 'var(--bd-text-primary)',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Status Tabs */}
            <div className="mb-6">
                <CampaignStatusTabs
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        setSearchQuery('');
                    }}
                    counts={{ activeCount, pendingCount, revisionCount, completedCount, invitationCount }}
                />
            </div>

            {/* Invitations Inbox */}
            {isInvitationsTab ? (
                <div>
                    {invitationCount > 0 && (
                        <p className="text-sm mb-4" style={{ color: 'var(--bd-text-secondary)' }}>
                            You have <span className="font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{invitationCount}</span> pending invitation{invitationCount !== 1 ? 's' : ''} from brands.
                        </p>
                    )}
                    <InvitationsList
                        invitations={invitations}
                        loading={loading}
                        onResponded={(id, action) => {
                            // Refetch after accept/decline to update all counts
                            refetch();
                            // Navigate to active tab after accepting
                            if (action === 'accept') {
                                setTimeout(() => setActiveTab('active'), 400);
                            }
                        }}
                    />
                </div>
            ) : (
                /* Workspace Table */
                <CampaignTable
                    campaigns={displayCampaigns}
                    loading={loading}
                    emptyMessage={emptyMessages[activeTab] || 'No campaigns found'}
                />
            )}

            {/* Global Empty State — zero non-invite collaborations */}
            {showGlobalEmpty && (
                <div
                    className="text-center py-16 mt-6 rounded-xl"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <Briefcase
                        className="w-12 h-12 mx-auto mb-4 opacity-20"
                        style={{ color: 'var(--bd-text-secondary)' }}
                    />
                    <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: 'var(--bd-text-primary)' }}
                    >
                        Your Workspace is Empty
                    </h3>
                    <p
                        className="text-sm mb-6 max-w-md mx-auto leading-relaxed"
                        style={{ color: 'var(--bd-text-secondary)' }}
                    >
                        This workspace tracks your active collaborations. Browse open campaigns to apply,
                        or check your <button
                            onClick={() => setActiveTab('invitations')}
                            className="underline font-medium hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--bd-accent-primary)' }}
                        >
                            Invitations
                        </button> tab for brand-initiated offers.
                    </p>
                    <button
                        onClick={() => navigate('/creator/explore')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110 active:scale-95"
                        style={{ background: 'var(--bd-accent-primary)' }}
                    >
                        Find Your First Campaign
                    </button>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div
                    className="text-center py-8 mt-4 rounded-xl"
                    style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                >
                    <p className="text-sm" style={{ color: 'rgb(248, 113, 113)' }}>
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CampaignsPage;
