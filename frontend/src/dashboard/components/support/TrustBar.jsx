import React, { useState, useEffect } from 'react';
import { Clock, Star, User, Users } from 'lucide-react';
import { getSatisfactionMetrics } from './supportApi';

/**
 * TrustBar — Horizontal bar showing avg response time,
 * satisfaction rating, dedicated manager, and online agents.
 */
const TrustBar = ({ tierConfig }) => {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getSatisfactionMetrics().then((data) => {
            if (!cancelled) setMetrics(data);
        });
        return () => { cancelled = true; };
    }, []);

    if (!metrics) {
        return (
            <div className="sc-trust-bar">
                <div className="sc-skeleton sc-skeleton--text" style={{ width: '100%', height: '18px' }} />
            </div>
        );
    }

    return (
        <div className="sc-trust-bar" role="status" aria-label="Support metrics">
            <div className="sc-trust-bar__item">
                <Clock style={{ width: 14, height: 14 }} />
                <span>Avg response:</span>
                <span className="sc-trust-bar__value">{metrics.avgResponseTime}</span>
            </div>

            <div className="sc-trust-bar__dot" aria-hidden="true" />

            <div className="sc-trust-bar__item">
                <Star style={{ width: 14, height: 14 }} />
                <span>Satisfaction:</span>
                <span className="sc-trust-bar__value">{metrics.satisfactionRating}</span>
            </div>

            <div className="sc-trust-bar__dot" aria-hidden="true" />

            {tierConfig.hasNamedManager && tierConfig.managerName && (
                <>
                    <div className="sc-trust-bar__item">
                        <User style={{ width: 14, height: 14 }} />
                        <span>Your advisor:</span>
                        <span className="sc-trust-bar__value">{tierConfig.managerName}</span>
                    </div>
                    <div className="sc-trust-bar__dot" aria-hidden="true" />
                </>
            )}

            <div className="sc-trust-bar__item">
                <Users style={{ width: 14, height: 14 }} />
                <span>Online:</span>
                <span className="sc-trust-bar__value">{metrics.onlineAgents} agents</span>
            </div>
        </div>
    );
};

export default React.memo(TrustBar);
