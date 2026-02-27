import React from 'react';
import { Clock, Shield, Zap } from 'lucide-react';

/**
 * SupportHeader — Title, subtitle, tier badge, and SLA card.
 * Responsive: stacks on mobile, row on desktop.
 */
const SupportHeader = ({ tierConfig, isLoading }) => {
    if (isLoading) {
        return (
            <div className="sc-header">
                <div>
                    <div className="sc-skeleton sc-skeleton--text" style={{ width: '200px', height: '28px' }} />
                    <div className="sc-skeleton sc-skeleton--text" style={{ width: '320px', marginTop: '8px' }} />
                </div>
                <div className="sc-header__right">
                    <div className="sc-skeleton sc-skeleton--badge" />
                    <div className="sc-skeleton" style={{ width: '180px', height: '36px', borderRadius: 'var(--bd-radius-xl)' }} />
                </div>
            </div>
        );
    }

    const tierIcon = tierConfig.label === 'Enterprise' ? Shield :
        tierConfig.label === 'Pro' ? Zap : null;

    return (
        <div className="sc-header">
            <div>
                <h1 className="sc-header__title">Support Center</h1>
                <p className="sc-header__subtitle">
                    Priority assistance for campaigns, payments, and performance.
                </p>
            </div>
            <div className="sc-header__right">
                {/* Tier Badge */}
                <span className={`sc-tier-badge ${tierConfig.badgeClass}`}>
                    {tierIcon && <tierIcon style={{ width: 12, height: 12 }} />}
                    {tierConfig.label}
                </span>

                {/* SLA Card */}
                <div className="sc-sla-card">
                    <Clock className="sc-sla-card__icon" />
                    <span className="sc-sla-card__time">{tierConfig.responseTime}</span>
                    <span>{tierConfig.slaText}</span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SupportHeader);
