import React from 'react';
import CampaignCard from './CampaignCard';

/**
 * CampaignGrid — responsive grid layout for campaign cards.
 */
const CampaignGrid = ({ campaigns, onView, onFund }) => {
    if (campaigns.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
                <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onView={onView}
                    onFund={onFund}
                />
            ))}
        </div>
    );
};

export default CampaignGrid;
