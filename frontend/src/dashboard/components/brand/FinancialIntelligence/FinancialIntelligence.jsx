/**
 * FinancialIntelligence — Main orchestrator component.
 * Composes all sub-components into the 2-row financial intelligence grid.
 *
 * Row 1 (Strategic): Available Balance | Overall ROAS
 * Row 2 (Allocation): Total Committed | In Escrow | Next Payout
 */

import React, { useCallback } from 'react';
import {
    Wallet,
    Target,
    TrendingUp,
    Lock,
    Calendar,
    ChevronRight,
    Info,
    AlertCircle,
    ArrowUpRight,
    BarChart3,
    ArrowRight,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';

import { useFinancialIntelligence, formatCurrency, formatDate } from '../../../../data/hooks/useFinancialIntelligence';

import FinancialCard from './FinancialCard';
import MetricValue from './MetricValue';
import TrendIndicator from './TrendIndicator';
import EfficiencyBar from './EfficiencyBar';
import LiquidityBar from './LiquidityBar';
import HealthBadge from './HealthBadge';
import EmptyState from './EmptyState';
import ActivationPanel from './ActivationPanel';

import './FinancialIntelligence.css';

// --- Skeleton Loader ---
const SkeletonCard = ({ large = false }) => (
    <div className="fi-card" style={{ pointerEvents: 'none' }}>
        <div className="fi-label">
            <div className="bd-skeleton fi-skel fi-skel--sm" style={{ width: '1rem' }} />
            <div className="bd-skeleton fi-skel fi-skel--sm" style={{ width: '6rem' }} />
        </div>
        <div className="bd-skeleton fi-skel fi-skel--lg" style={{ width: large ? '12rem' : '8rem', marginTop: '0.5rem' }} />
        {large && (
            <div className="bd-skeleton fi-skel fi-skel--bar" style={{ width: '100%', marginTop: '2rem' }} />
        )}
    </div>
);

const FinancialIntelligenceSkeleton = ({ className = '' }) => (
    <div className={`fi-section fi-skeleton-grid ${className}`}>
        <div className="fi-section-header">
            <div className="bd-skeleton fi-skel fi-skel--md" style={{ width: '14rem' }} />
            <div className="bd-skeleton fi-skel fi-skel--sm" style={{ width: '18rem', marginTop: '0.5rem' }} />
        </div>
        <div className="fi-grid fi-grid--strategic" style={{ marginBottom: 'var(--bd-space-6)' }}>
            <SkeletonCard large />
            <SkeletonCard large />
        </div>
        <div className="fi-grid fi-grid--allocation">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
    </div>
);

// --- Error State ---
const ErrorState = ({ onRetry, className = '' }) => (
    <div className={`fi-card fi-error ${className}`}>
        <div className="fi-error__icon-wrap">
            <AlertCircle className="fi-error__icon" />
        </div>
        <p className="fi-error__title">Unable to load financial data</p>
        <p className="fi-error__subtitle">
            There was an error fetching your financial metrics. Please try again.
        </p>
        <button
            className="fi-error__retry"
            onClick={onRetry}
            type="button"
        >
            Retry
        </button>
    </div>
);

// --- Full Empty State → Activation Panel ---
const FullEmptyState = ({ className = '' }) => (
    <ActivationPanel
        className={className}
        onLaunch={() => {
            // Route to campaign creation
            window.location.href = '/brand/campaigns/new';
        }}
    />
);

// --- Label helper ---
const CardLabel = ({ icon: Icon, children }) => (
    <div className="fi-label">
        {Icon && <Icon className="fi-label__icon" aria-hidden="true" />}
        <span className="fi-label__text">{children}</span>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const FinancialIntelligence = React.memo(function FinancialIntelligence({ className = '' }) {
    const { data, isLoading, isError, refetch } = useFinancialIntelligence();

    const handleViewStatement = useCallback((e) => {
        e.stopPropagation();
        // Navigate to /brand/financials
        window.location.href = '/brand/financials';
    }, []);

    const handleBalanceCardClick = useCallback(() => {
        window.location.href = '/brand/financials';
    }, []);

    // --- Loading ---
    if (isLoading) return <FinancialIntelligenceSkeleton className={className} />;

    // --- Error ---
    if (isError) return <ErrorState onRetry={refetch} className={className} />;

    // --- Full Empty ---
    if (!data || !data.hasAnyData) return <FullEmptyState className={className} />;

    return (
        <section
            className={`fi-section ${className}`}
            aria-label="Financial Intelligence"
            role="region"
        >
            {/* Section Header */}
            <div className="fi-section-header">
                <h2 className="fi-section-title">Financial Intelligence</h2>
                <p className="fi-section-subtitle">
                    Real-time capital &amp; performance overview
                </p>
            </div>

            {/* Row 1: Strategic Layer */}
            <div className="fi-row-label">Capital Health</div>
            <div className="fi-grid fi-grid--strategic" style={{ marginBottom: 'var(--bd-space-6)' }}>

                {/* === Available Balance === */}
                <FinancialCard
                    className="fi-card--clickable"
                    onClick={handleBalanceCardClick}
                    ariaLabel={`Available Balance: ${formatCurrency(data.availableBalance)}. Health: ${data.healthStatus}. Liquidity ratio: ${data.liquidityRatio}%`}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <CardLabel icon={Wallet}>Available Balance</CardLabel>
                                <HealthBadge status={data.healthStatus} />
                            </div>

                            <MetricValue
                                value={data.availableBalance}
                                format="currency"
                                size="lg"
                                ariaLabel={`Available balance: ${formatCurrency(data.availableBalance)}`}
                                className="mt-1"
                            />

                            <LiquidityBar ratio={data.liquidityRatio} />
                        </div>

                        <div className="fi-footer">
                            <button
                                className="fi-footer__cta"
                                onClick={handleViewStatement}
                                type="button"
                                aria-label="View financial statement"
                            >
                                View Statement
                                <ChevronRight className="fi-footer__cta-icon" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </FinancialCard>

                {/* === Overall ROAS === */}
                <FinancialCard
                    ariaLabel={
                        data.hasRoasData
                            ? `Overall ROAS: ${data.roasValue}x. Efficiency score: ${data.efficiencyScore}%. Active sources: ${data.activeSources}`
                            : 'Overall ROAS: No data available'
                    }
                >
                    {data.hasRoasData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CardLabel icon={Target}>Overall ROAS</CardLabel>
                                        <button
                                            className="fi-info-trigger"
                                            data-tooltip-id="roas-tooltip"
                                            data-tooltip-content="Return On Ad Spend — Revenue generated per dollar spent across all active campaigns."
                                            aria-label="What is ROAS?"
                                            type="button"
                                        >
                                            <Info className="fi-info-trigger__icon" aria-hidden="true" />
                                        </button>
                                        <Tooltip
                                            id="roas-tooltip"
                                            place="top"
                                            style={{
                                                backgroundColor: 'var(--bd-surface)',
                                                color: 'var(--bd-text-primary)',
                                                fontSize: '0.75rem',
                                                borderRadius: '0.5rem',
                                                padding: '0.5rem 0.75rem',
                                                maxWidth: '260px',
                                                zIndex: 700,
                                                border: '1px solid var(--bd-border-default)',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.75rem' }}>
                                    <MetricValue
                                        value={data.roasValue}
                                        format="multiplier"
                                        size="lg"
                                        ariaLabel={`ROAS: ${data.roasValue}x`}
                                    />
                                    <TrendIndicator
                                        value="18%"
                                        label="vs last 30 days"
                                        isPositive={true}
                                    />
                                </div>

                                <EfficiencyBar
                                    score={data.efficiencyScore}
                                    label="Healthy campaign efficiency"
                                />
                            </div>

                            <div className="fi-footer fi-footer--between">
                                <span className="fi-footer__microcopy">
                                    Generated from{' '}
                                    <span className="fi-footer__microcopy-highlight">
                                        {data.activeSources} active source{data.activeSources !== 1 ? 's' : ''}
                                    </span>
                                </span>
                                <ArrowUpRight
                                    style={{ width: '0.75rem', height: '0.75rem', color: 'var(--bd-fi-roas)' }}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    ) : (
                        <EmptyState
                            icon={Target}
                            title="No performance data yet"
                            subtitle="Launch campaigns to begin measuring return on ad spend."
                            ctaLabel="Create Campaign"
                            onCtaClick={() => { /* Route to campaign creation */ }}
                        />
                    )}
                </FinancialCard>
            </div>

            {/* Row 2: Capital Allocation Layer */}
            <div className="fi-row-label">Capital Allocation</div>
            <div className="fi-grid fi-grid--allocation">

                {/* === Total Committed === */}
                <FinancialCard
                    ariaLabel={`Total Committed: ${formatCurrency(data.totalCommitted)}. ${data.capacityPercent}% of capacity locked.`}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <CardLabel icon={TrendingUp}>Total Committed</CardLabel>
                            <MetricValue
                                value={data.totalCommitted}
                                format="currency"
                                size="md"
                                ariaLabel={`Total committed: ${formatCurrency(data.totalCommitted)}`}
                                className="mt-2"
                            />
                            {data.committedChangePercent != null && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <TrendIndicator
                                        value={`${Math.abs(data.committedChangePercent)}%`}
                                        isPositive={data.committedChangePercent >= 0}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="fi-divider">
                            <p className="fi-footer__microcopy">
                                <span className="fi-footer__microcopy-highlight">{data.capacityPercent}%</span> of capacity
                            </p>
                        </div>
                    </div>
                </FinancialCard>

                {/* === In Escrow === */}
                <FinancialCard
                    ariaLabel={`In Escrow: ${formatCurrency(data.escrowAmount)}. Locked for active campaigns.`}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <CardLabel icon={Lock}>In Escrow</CardLabel>
                            <MetricValue
                                value={data.escrowAmount}
                                format="currency"
                                size="md"
                                ariaLabel={`In escrow: ${formatCurrency(data.escrowAmount)}`}
                                className="mt-2"
                            />
                        </div>
                        <div className="fi-escrow-context">
                            <span className="fi-escrow-dot" aria-hidden="true" />
                            Locked for active campaigns
                        </div>
                    </div>
                </FinancialCard>

                {/* === Next Payout === */}
                <FinancialCard
                    ariaLabel={
                        data.hasPayoutData
                            ? `Next Payout: ${formatCurrency(data.pendingPayouts)}${data.nextPayoutDate ? `. Scheduled for ${formatDate(data.nextPayoutDate)}` : ''}`
                            : 'Next Payout: No scheduled payouts'
                    }
                >
                    {data.hasPayoutData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <CardLabel icon={Calendar}>Next Payout</CardLabel>
                                    {data.daysUntilPayout != null && data.daysUntilPayout <= 7 && (
                                        <span className="fi-payout-badge">
                                            Due in {data.daysUntilPayout} day{data.daysUntilPayout !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <MetricValue
                                    value={data.pendingPayouts}
                                    format="currency"
                                    size="md"
                                    ariaLabel={`Next payout amount: ${formatCurrency(data.pendingPayouts)}`}
                                    className="mt-2"
                                />
                            </div>
                            {data.nextPayoutDate && (
                                <div className="fi-divider">
                                    <p className="fi-footer__microcopy">
                                        Scheduled for{' '}
                                        <span className="fi-footer__microcopy-highlight">
                                            {formatDate(data.nextPayoutDate)}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            icon={Calendar}
                            title="No scheduled payouts"
                            subtitle="Payouts will appear here once campaigns are funded."
                        />
                    )}
                </FinancialCard>
            </div>
        </section>
    );
});

export default FinancialIntelligence;
