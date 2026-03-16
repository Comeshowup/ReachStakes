import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Briefcase, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignWorkspace } from '../../../hooks/useCampaignWorkspace';
import CampaignHeader from '../../components/workspace/CampaignHeader';
import CampaignTabs from '../../components/workspace/CampaignTabs';
import CampaignOverview from '../../components/workspace/CampaignOverview';
import DeliverablesList from '../../components/workspace/DeliverablesList';
import SubmissionUploader from '../../components/workspace/SubmissionUploader';
import CampaignMessages from '../../components/workspace/CampaignMessages';
import PaymentStatus from '../../components/workspace/PaymentStatus';

/**
 * Campaign Workspace Page
 * Route: /creator/campaigns/:campaignId
 *
 * Full workspace for a single campaign collaboration.
 */
const CampaignWorkspacePage = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const {
        campaign,
        deliverables,
        submissions,
        messages,
        payment,
        loading,
        error,
        refetch,
    } = useCampaignWorkspace(campaignId);

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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <CampaignOverview campaign={campaign} />;
            case 'deliverables':
                return <DeliverablesList deliverables={deliverables} />;
            case 'submissions':
                return (
                    <SubmissionUploader
                        collaborationId={campaignId}
                        submissions={submissions}
                        campaign={campaign}
                        onSubmitSuccess={refetch}
                    />
                );
            case 'messages':
                return <CampaignMessages messages={messages} campaign={campaign} />;
            case 'payment':
                return <PaymentStatus payment={payment} />;
            default:
                return <CampaignOverview campaign={campaign} />;
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
        </div>
    );
};

export default CampaignWorkspacePage;
