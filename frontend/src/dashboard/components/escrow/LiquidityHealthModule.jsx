import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import {
    ShieldCheck,
    AlertTriangle,
    AlertOctagon,
    Plus,
    ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatRatio } from '../../../utils/formatCurrency';

/**
 * LiquidityHealthModule — Coverage health with split layout:
 * Left: Coverage ratio + status pill + description
 * Right: Required obligations, Available liquidity, Next release
 * Dynamic liquidity bar showing Required vs Available.
 */

const STATE_CONFIG = {
    healthy: {
        icon: ShieldCheck,
        label: 'Healthy',
        pillClass: 'ev-liq__status-pill--healthy',
        borderClass: 'ev-liq--healthy',
        description: 'Escrow coverage exceeds all pending obligations.',
    },
    watch: {
        icon: AlertTriangle,
        label: 'Watch',
        pillClass: 'ev-liq__status-pill--watch',
        borderClass: 'ev-liq--watch',
        description: 'Coverage is approaching the minimum threshold.',
    },
    risk: {
        icon: AlertOctagon,
        label: 'At Risk',
        pillClass: 'ev-liq__status-pill--risk',
        borderClass: 'ev-liq--risk',
        description: 'Insufficient escrow coverage for pending obligations.',
    },
};

const LiquidityHealthModule = ({ overview, loading, onAddFunds }) => {
    if (loading) {
        return (
            <div className="ev-liq ev-liq--skeleton" aria-busy="true">
                <div className="ev-liq__inner">
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="bd-skeleton ev-skel--circle" />
                        <div className="ev-liq__skeleton-rows">
                            <div className="bd-skeleton" style={{ width: '50%', height: 14 }} />
                            <div className="bd-skeleton" style={{ width: '100%', height: 8, borderRadius: 4 }} />
                            <div className="bd-skeleton" style={{ width: '65%', height: 12 }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="ev-liq ev-liq--healthy" role="region" aria-label="Liquidity Health">
                <div className="ev-liq__inner">
                    <div className="ev-liq__split">
                        <div className="ev-liq__left">
                            <div className="ev-liq__ratio-row">
                                <span className="ev-liq__ratio-num">0.0x</span>
                                <span className="ev-liq__status-pill ev-liq__status-pill--healthy">
                                    N/A
                                </span>
                            </div>
                            <p className="ev-liq__description">
                                Fund a campaign to see liquidity health metrics.
                            </p>
                        </div>
                        <div className="ev-liq__right">
                            <div className="ev-liq__metric">
                                <span className="ev-liq__metric-label">Required</span>
                                <span className="ev-liq__metric-value">{formatCurrency(0, { whole: true })}</span>
                            </div>
                            <div className="ev-liq__metric">
                                <span className="ev-liq__metric-label">Available</span>
                                <span className="ev-liq__metric-value">{formatCurrency(0, { whole: true })}</span>
                            </div>
                        </div>
                    </div>
                    {onAddFunds && (
                        <div className="ev-liq__footer">
                            <button className="ev-liq__cta" onClick={onAddFunds}>
                                <Plus size={14} />
                                Add Funds
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const stateKey = overview.liquidityState || 'healthy';
    const config = STATE_CONFIG[stateKey] || STATE_CONFIG.healthy;
    const ratio = overview.coverageRatio ?? 0;
    const available = overview.availableBalance || 0;
    const pending = overview.pendingReleases || 0;
    const explanation = overview.liquidityExplanation || config.description;

    // Liquidity bar percentages
    const maxVal = Math.max(available, pending, 1);
    const availPct = Math.min(100, (available / maxVal) * 100);
    const pendingPct = Math.min(100, (pending / maxVal) * 100);

    // Determine bar state
    const isOverfunded = available > pending && pending > 0;
    const isUnderfunded = pending > available;

    // Shortfall messaging
    const shortfall = pending > available ? pending - available : 0;
    const description = stateKey === 'risk' && shortfall > 0
        ? `Upcoming releases exceed available balance by ${formatCurrency(shortfall, { whole: true })}.`
        : explanation;

    return (
        <motion.div
            className={`ev-liq ${config.borderClass}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            role="region"
            aria-label="Liquidity Health"
        >
            <div className="ev-liq__inner">
                {/* Split layout */}
                <div className="ev-liq__split">
                    {/* Left — Ratio + Status + Description */}
                    <div className="ev-liq__left">
                        <div className="ev-liq__ratio-row">
                            <span
                                className="ev-liq__ratio-num"
                                data-tooltip-id="ev-coverage-tooltip"
                                data-tooltip-content="Coverage Ratio = Available Balance / Pending Obligations. A ratio above 1.0x means all obligations are covered."
                                style={{ cursor: 'help' }}
                            >
                                {formatRatio(ratio)}
                            </span>
                            <span className={`ev-liq__status-pill ${config.pillClass}`}>
                                {config.label}
                            </span>
                        </div>
                        <p className="ev-liq__description">{description}</p>
                        <Tooltip id="ev-coverage-tooltip" place="bottom" className="ev-tooltip" />
                    </div>

                    {/* Right — Financial metrics */}
                    <div className="ev-liq__right">
                        <div className="ev-liq__metric">
                            <span className="ev-liq__metric-label">Required Obligations</span>
                            <span className={`ev-liq__metric-value ${isUnderfunded ? 'ev-liq__metric-value--warning' : ''}`}>
                                {formatCurrency(pending, { whole: true })}
                            </span>
                        </div>
                        <div className="ev-liq__metric">
                            <span className="ev-liq__metric-label">Available Liquidity</span>
                            <span className={`ev-liq__metric-value ev-liq__metric-value--success`}>
                                {formatCurrency(available, { whole: true })}
                            </span>
                        </div>
                        {overview.nextRelease && (
                            <div className="ev-liq__metric">
                                <span className="ev-liq__metric-label">Next Release</span>
                                <span className="ev-liq__metric-value">
                                    {formatCurrency(overview.nextRelease.amount, { whole: true })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dynamic liquidity bar */}
                <div className="ev-liq__bar-wrap">
                    <div className="ev-liq__bar-label-row">
                        <span>Required vs Available</span>
                        <span>{isOverfunded ? 'Overfunded' : isUnderfunded ? 'Underfunded' : 'Balanced'}</span>
                    </div>
                    <div className="ev-liq__bar-track" role="meter" aria-valuenow={ratio} aria-valuemin={0} aria-label="Coverage ratio">
                        <motion.div
                            className={`ev-liq__bar-fill ${isUnderfunded ? 'ev-liq__bar-fill--required' : 'ev-liq__bar-fill--available'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${isUnderfunded ? pendingPct : availPct}%` }}
                            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Footer CTA for non-healthy states */}
                {stateKey !== 'healthy' && onAddFunds && (
                    <div className="ev-liq__footer">
                        <button className="ev-liq__cta" onClick={onAddFunds}>
                            <Plus size={14} />
                            Add Funds
                            <ArrowRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default LiquidityHealthModule;
