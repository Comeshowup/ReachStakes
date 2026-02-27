import React, { memo } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * UnfundedCampaignsList — Displays campaigns that need funding.
 * Each campaign card shows name, budget info, progress, and a Fund button.
 */
function UnfundedCampaignsList({ campaigns, isLoading, onFund }) {
    if (isLoading) {
        return (
            <div className="vault-campaigns-card">
                <div className="vault-campaigns-card__header">
                    <h3 className="vault-campaigns-card__title">
                        <span className="material-symbols-outlined vault-campaigns-card__title-icon">campaign</span>
                        Campaign Funding
                    </h3>
                </div>
                <div className="vault-campaigns-card__list">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="vault-campaign-item vault-campaign-item--skeleton">
                            <div className="vault-skeleton vault-skeleton--label" style={{ width: '60%' }} />
                            <div className="vault-skeleton vault-skeleton--hint" style={{ width: '40%', marginTop: 8 }} />
                            <div className="vault-skeleton" style={{ width: '100%', height: 6, marginTop: 12, borderRadius: 3 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Filter to only unfunded/partially funded campaigns
    const unfundedCampaigns = (campaigns || []).filter(c => {
        const target = c.targetBudget || 0;
        const funded = c.fundedAmount || 0;
        return target > 0 && funded < target;
    });

    const allCampaigns = campaigns || [];
    const fullyFunded = allCampaigns.length - unfundedCampaigns.length;

    return (
        <div className="vault-campaigns-card">
            <div className="vault-campaigns-card__header">
                <div className="vault-campaigns-card__header-left">
                    <h3 className="vault-campaigns-card__title">
                        <span className="material-symbols-outlined vault-campaigns-card__title-icon">campaign</span>
                        Campaign Funding
                    </h3>
                    {allCampaigns.length > 0 && (
                        <span className="vault-campaigns-card__count">
                            {unfundedCampaigns.length} pending · {fullyFunded} funded
                        </span>
                    )}
                </div>
            </div>

            <div className="vault-campaigns-card__list">
                {unfundedCampaigns.length === 0 ? (
                    <div className="vault-campaigns-card__empty">
                        <span className="material-symbols-outlined vault-campaigns-card__empty-icon">check_circle</span>
                        <p className="vault-campaigns-card__empty-title">
                            {allCampaigns.length === 0 ? 'No Campaigns Yet' : 'All Campaigns Funded'}
                        </p>
                        <p className="vault-campaigns-card__empty-text">
                            {allCampaigns.length === 0
                                ? 'Create a campaign to start funding influencer escrows.'
                                : 'All your active campaigns are fully funded. Great job!'}
                        </p>
                    </div>
                ) : (
                    unfundedCampaigns.map(campaign => {
                        const target = campaign.targetBudget || 0;
                        const funded = campaign.fundedAmount || 0;
                        const remaining = Math.max(0, target - funded);
                        const pct = target > 0 ? Math.min(100, (funded / target) * 100) : 0;
                        const isUrgent = pct < 25;

                        return (
                            <div key={campaign.id} className={`vault-campaign-item ${isUrgent ? 'vault-campaign-item--urgent' : ''}`}>
                                <div className="vault-campaign-item__top">
                                    <div className="vault-campaign-item__info">
                                        <span className="vault-campaign-item__name">{campaign.name}</span>
                                        <span className={`vault-campaign-item__badge ${isUrgent ? 'vault-campaign-item__badge--danger' : 'vault-campaign-item__badge--warning'}`}>
                                            {Math.round(pct)}% Funded
                                        </span>
                                    </div>
                                    <button
                                        className="vault-campaign-item__fund-btn"
                                        onClick={() => onFund?.(campaign)}
                                        aria-label={`Fund ${campaign.name}`}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
                                        Fund
                                    </button>
                                </div>

                                {/* Progress */}
                                <div className="vault-campaign-item__progress">
                                    <div className="vault-campaign-item__progress-track">
                                        <div
                                            className={`vault-campaign-item__progress-fill ${isUrgent ? 'vault-campaign-item__progress-fill--danger' : ''}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="vault-campaign-item__meta">
                                    <span className="vault-campaign-item__meta-text">
                                        {formatCurrency(funded)} of {formatCurrency(target)}
                                    </span>
                                    <span className="vault-campaign-item__meta-remaining">
                                        {formatCurrency(remaining)} remaining
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default memo(UnfundedCampaignsList);
