import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Calendar, DollarSign } from 'lucide-react';
import CampaignStatusBadge from '../campaigns/CampaignStatusBadge';

/**
 * Campaign workspace header — brand info, payment, deadline, status, back button.
 */
const CampaignHeader = ({ campaign }) => {
    const navigate = useNavigate();

    if (!campaign) return null;

    const campaignData = campaign.campaign || campaign;
    const brandProfile = campaignData.brand?.brandProfile || {};

    const brandName = brandProfile.companyName || campaign.brandName || 'Brand';
    const campaignTitle = campaign.campaignTitle || campaignData.title || 'Campaign';
    const brandLogo = brandProfile.logoUrl || campaign.brandLogo;
    const payment = campaign.rate || campaignData.budget || campaignData.targetBudget;
    const deadline = campaign.deadline || campaignData.endDate;

    return (
        <div
            className="rounded-xl p-6 mb-6"
            style={{
                background: 'var(--bd-surface-panel)',
                border: '1px solid var(--bd-border-subtle)',
            }}
        >
            <div className="flex items-start gap-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/creator/campaigns')}
                    className="p-2 rounded-lg transition-colors flex-shrink-0 mt-0.5"
                    style={{
                        color: 'var(--bd-text-secondary)',
                        background: 'var(--bd-surface-input)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bd-surface-hover, rgba(255,255,255,0.08))')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bd-surface-input)')}
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                {/* Brand Logo */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{
                        background: 'var(--bd-surface-input)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    {brandLogo ? (
                        <img src={brandLogo} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                        <Briefcase className="w-5 h-5" style={{ color: 'var(--bd-text-secondary)' }} />
                    )}
                </div>

                {/* Campaign Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                        {brandName}
                    </p>
                    <h1
                        className="text-xl font-bold tracking-tight truncate"
                        style={{ color: 'var(--bd-text-primary)' }}
                    >
                        {campaignTitle}
                    </h1>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    {payment && (
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                                <DollarSign className="w-3.5 h-3.5" style={{ color: 'rgb(52, 211, 153)' }} />
                                <span className="text-sm font-bold" style={{ color: 'var(--bd-text-primary)' }}>
                                    ${parseFloat(payment).toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--bd-text-secondary)' }}>
                                Payment
                            </span>
                        </div>
                    )}

                    {deadline && (
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--bd-text-secondary)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
                                    {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--bd-text-secondary)' }}>
                                Deadline
                            </span>
                        </div>
                    )}

                    <CampaignStatusBadge status={campaign.status} size="lg" />
                </div>
            </div>
        </div>
    );
};

export default CampaignHeader;
