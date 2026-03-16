import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase, Calendar } from 'lucide-react';
import CampaignStatusBadge from './CampaignStatusBadge';

/**
 * A single row in the campaign table.
 * Columns: Brand | Campaign | Deliverables | Deadline | Payment | Status | Action
 */
const CampaignRow = ({ campaign }) => {
    const navigate = useNavigate();

    const brandName = campaign.brandName || campaign.campaign?.brand?.brandProfile?.companyName || 'Brand';
    const campaignTitle = campaign.campaignTitle || campaign.campaign?.title || campaign.title || 'Campaign';
    const deadline = campaign.deadline || campaign.campaign?.endDate;
    const payment = campaign.rate || campaign.campaign?.budget || campaign.campaign?.targetBudget;
    const submissionCount = campaign.submissionCount || 0;
    const deliverableCount = campaign.deliverableCount || 1;

    return (
        <tr
            onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
            className="group cursor-pointer transition-colors"
            style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bd-surface-hover, rgba(255,255,255,0.03))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
            {/* Brand */}
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{
                            background: 'var(--bd-surface-input)',
                            border: '1px solid var(--bd-border-subtle)',
                        }}
                    >
                        {campaign.brandLogo ? (
                            <img src={campaign.brandLogo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--bd-text-secondary)' }} />
                        )}
                    </div>
                    <span className="text-sm font-medium truncate max-w-[120px]" style={{ color: 'var(--bd-text-secondary)' }}>
                        {brandName}
                    </span>
                </div>
            </td>

            {/* Campaign Name */}
            <td className="py-3.5 px-4">
                <span
                    className="text-sm font-semibold truncate block max-w-[200px] group-hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--bd-text-primary)' }}
                >
                    {campaignTitle}
                </span>
            </td>

            {/* Deliverables */}
            <td className="py-3.5 px-4">
                <span className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                    {submissionCount}/{deliverableCount} Submitted
                </span>
            </td>

            {/* Deadline */}
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--bd-text-secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                        {deadline ? new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </span>
                </div>
            </td>

            {/* Payment */}
            <td className="py-3.5 px-4">
                <span className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
                    {payment ? `$${parseFloat(payment).toLocaleString()}` : '—'}
                </span>
            </td>

            {/* Status */}
            <td className="py-3.5 px-4">
                <CampaignStatusBadge status={campaign.status} />
            </td>

            {/* Action */}
            <td className="py-3.5 px-4">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:translate-x-0.5"
                    style={{
                        background: 'var(--bd-surface-input)',
                        color: 'var(--bd-text-secondary)',
                    }}
                >
                    <ChevronRight className="w-4 h-4" />
                </div>
            </td>
        </tr>
    );
};

export default CampaignRow;
