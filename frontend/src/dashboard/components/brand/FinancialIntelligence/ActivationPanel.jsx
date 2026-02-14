import React from 'react';
import {
    Wallet,
    Target,
    TrendingUp,
    ArrowRight,
    BarChart3,
    Lock,
    Calendar,
} from 'lucide-react';

/**
 * ActivationPanel — Premium empty-state activation surface.
 *
 * 2-column layout:
 *   Left  — Headline, supporting copy, primary CTA, trust micro-line
 *   Right — Ghost preview of future financial cards (non-interactive)
 *
 * Uses future-state visualization to communicate product power
 * before the user has any data.
 */
const ActivationPanel = React.memo(function ActivationPanel({ onLaunch, className = '' }) {
    const handleLaunch = () => {
        if (typeof onLaunch === 'function') {
            onLaunch();
        }
    };

    return (
        <section
            className={`fi-activation ${className}`}
            aria-label="Activate Financial Intelligence"
            role="region"
        >
            <div className="fi-activation__inner">
                {/* ---- LEFT COLUMN: Message + CTA ---- */}
                <div className="fi-activation__left">
                    {/* Icon */}
                    <div className="fi-activation__icon-wrap" aria-hidden="true">
                        <BarChart3 className="fi-activation__icon" />
                    </div>

                    {/* Headline */}
                    <h2 className="fi-activation__headline" id="fi-activation-headline">
                        Activate Your Financial Intelligence
                    </h2>

                    {/* Supporting Copy */}
                    <p className="fi-activation__copy" id="fi-activation-copy">
                        Launch your first campaign to unlock real-time visibility into
                        liquidity, return on ad spend, escrow flows, and upcoming payouts.
                    </p>

                    {/* Primary CTA */}
                    <button
                        className="fi-activation__cta"
                        onClick={handleLaunch}
                        type="button"
                        aria-describedby="fi-activation-copy"
                    >
                        Launch Your First Campaign
                        <ArrowRight className="fi-activation__cta-arrow" aria-hidden="true" />
                    </button>

                    {/* Trust micro-line */}
                    <p className="fi-activation__trust" aria-hidden="true">
                        Takes less than 2 minutes.
                    </p>
                </div>

                {/* ---- RIGHT COLUMN: Ghost Preview ---- */}
                <div className="fi-activation__right" aria-hidden="true">
                    <div className="fi-activation__ghost-grid">
                        {/* Ghost: Available Balance */}
                        <div className="fi-ghost fi-ghost--wide">
                            <div className="fi-ghost__label">
                                <Wallet className="fi-ghost__label-icon" />
                                <span>Available Balance</span>
                            </div>
                            <div className="fi-ghost__value fi-ghost__value--lg">$••••••</div>
                            <div className="fi-ghost__bar">
                                <div className="fi-ghost__bar-fill" style={{ width: '72%' }} />
                            </div>
                        </div>

                        {/* Ghost: ROAS */}
                        <div className="fi-ghost fi-ghost--wide">
                            <div className="fi-ghost__label">
                                <Target className="fi-ghost__label-icon" />
                                <span>Overall ROAS</span>
                            </div>
                            <div className="fi-ghost__value fi-ghost__value--lg">
                                •.•x
                                <span className="fi-ghost__trend">↑ ••%</span>
                            </div>
                            <div className="fi-ghost__bar fi-ghost__bar--gradient">
                                <div className="fi-ghost__bar-indicator" style={{ left: '68%' }} />
                            </div>
                        </div>

                        {/* Ghost row: 3 small cards */}
                        <div className="fi-ghost fi-ghost--compact">
                            <div className="fi-ghost__label">
                                <TrendingUp className="fi-ghost__label-icon" />
                                <span>Committed</span>
                            </div>
                            <div className="fi-ghost__value">$••••</div>
                        </div>

                        <div className="fi-ghost fi-ghost--compact">
                            <div className="fi-ghost__label">
                                <Lock className="fi-ghost__label-icon" />
                                <span>In Escrow</span>
                            </div>
                            <div className="fi-ghost__value">$••••</div>
                        </div>

                        <div className="fi-ghost fi-ghost--compact">
                            <div className="fi-ghost__label">
                                <Calendar className="fi-ghost__label-icon" />
                                <span>Next Payout</span>
                            </div>
                            <div className="fi-ghost__value">$••••</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default ActivationPanel;
