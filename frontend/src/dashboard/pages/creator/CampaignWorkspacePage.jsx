import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Briefcase, ArrowLeft, ListChecks, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignWorkspace } from '../../../hooks/useCampaignWorkspace';
import { useDeliverables } from '../../../hooks/useDeliverables';
import CampaignHeader from '../../components/workspace/CampaignHeader';
import CampaignTabs from '../../components/workspace/CampaignTabs';
import CampaignOverview from '../../components/workspace/CampaignOverview';
import DeliverablesList from '../../components/workspace/DeliverablesList';
import DeliverableCard from '../../components/deliverables/DeliverableCard';
import CampaignMessages from '../../components/workspace/CampaignMessages';
import PaymentStatus from '../../components/workspace/PaymentStatus';
import DeliverableWorkspaceDrawer from '../../components/deliverables/DeliverableWorkspaceDrawer';

/**
 * Campaign Workspace Page
 * Route: /creator/campaigns/:campaignId
 *
 * Full workspace for a single campaign collaboration.
 * The "Deliverables" tab now renders structured DeliverableCard components
 * fetched from the new deliverable API, falling back gracefully to the
 * legacy DeliverablesList for campaigns without structured deliverables.
 */
const CampaignWorkspacePage = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDeliverableId, setSelectedDeliverableId] = useState(null);

    const {
        campaign,
        deliverables: legacyDeliverables,
        submissions,
        messages,
        payment,
        loading,
        error,
        refetch,
    } = useCampaignWorkspace(campaignId);

    // Fetch structured deliverables from the new API using the collaboration ID
    const collabId = campaign?.id;
    const { deliverables: structuredDeliverables, loading: delLoading, refetch: refetchDeliverables } = useDeliverables(collabId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: 'var(--bd-accent-primary)' }}
                />
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="text-center py-24">
                <Briefcase
                    className="w-12 h-12 mx-auto mb-4 opacity-20"
                    style={{ color: 'var(--bd-text-secondary)' }}
                />
                <p className="text-sm mb-6" style={{ color: 'var(--bd-text-secondary)' }}>
                    {error || 'Campaign not found'}
                </p>
                <button
                    onClick={() => navigate('/creator/campaigns')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: 'var(--bd-accent-primary)' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Campaigns
                </button>
            </div>
        );
    }

    const renderDeliverablesTab = () => {
        if (delLoading) {
            return (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--bd-accent-primary)' }} />
                </div>
            );
        }

        // Prefer structured deliverables from API
        if (structuredDeliverables && structuredDeliverables.length > 0) {
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--bd-text-primary)' }}>
                            <ListChecks className="w-4 h-4" style={{ color: 'var(--bd-accent-primary)' }} />
                            Your Deliverables
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--bd-accent-primary)' }}>
                                {structuredDeliverables.length}
                            </span>
                        </h3>
                        <span className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                            Click a deliverable to open its workspace
                        </span>
                    </div>
                    {structuredDeliverables.map(deliverable => (
                        <DeliverableCard
                            key={deliverable.id}
                            deliverable={deliverable}
                            onSelect={setSelectedDeliverableId}
                        />
                    ))}
                </div>
            );
        }

        // Fallback: legacy JSON deliverables (older campaigns)
        if (legacyDeliverables && legacyDeliverables.length > 0) {
            return <DeliverablesList deliverables={legacyDeliverables} />;
        }

        // Empty state
        return (
            <div
                className="rounded-xl text-center py-16"
                style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}
            >
                <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--bd-text-primary)' }}>No deliverables assigned yet</p>
                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                    The brand will assign specific deliverables once your collaboration is confirmed.
                </p>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <CampaignOverview campaign={campaign} deliverables={structuredDeliverables} />;
            case 'deliverables':
                return renderDeliverablesTab();
            case 'messages':
                return <CampaignMessages messages={messages} campaign={campaign} />;
            case 'payment':
                return <PaymentStatus payment={payment} />;
            default:
                return <CampaignOverview campaign={campaign} deliverables={structuredDeliverables} />;
        }
    };

    return (
        <div>
            <CampaignHeader campaign={campaign} />

            <CampaignTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                >
                    {renderTabContent()}
                </motion.div>
            </AnimatePresence>

            <DeliverableWorkspaceDrawer
                deliverableId={selectedDeliverableId}
                campaignId={campaignId}
                isOpen={selectedDeliverableId !== null}
                onClose={() => setSelectedDeliverableId(null)}
                onRefreshParent={refetchDeliverables}
            />
        </div>
    );
};

export default CampaignWorkspacePage;
