import React, { memo, useMemo, useCallback } from 'react';
import { formatCurrency, formatPercent } from '../../../utils/formatCurrency';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Returns the CSS modifier class for the progress bar based on fill %. */
function getProgressColorClass(pct) {
    if (pct >= 100) return 'vault-cd-alloc__bar-fill--success';
    if (pct > 0) return 'vault-cd-alloc__bar-fill--warning';
    return 'vault-cd-alloc__bar-fill--danger';
}

/** Returns the CSS modifier class for the status pill. */
function getStatusClass(status) {
    switch (status) {
        case 'FUNDED':
            return 'vault-cd-alloc__status--funded';
        case 'PARTIAL':
            return 'vault-cd-alloc__status--partial';
        default:
            return 'vault-cd-alloc__status--unfunded';
    }
}

/** Derives campaign metrics with defensive guards. */
function deriveCampaignMetrics(campaign) {
    const required = Math.max(0, campaign.requiredAmount ?? 0);
    const funded = Math.max(0, Math.min(campaign.fundedAmount ?? 0, required));
    const remaining = Math.max(0, required - funded);
    const pct = required > 0 ? Math.min(100, (funded / required) * 100) : 0;
    return { required, funded, remaining, pct };
}

// ────────────────────────────────────────────────────────────
// FundingSummaryStrip
// ────────────────────────────────────────────────────────────

function FundingSummaryStripComponent({ availableLiquidity, requiredTotal, coverage }) {
    return (
        <div className="vault-cd-strip">
            <div className="vault-cd-strip__card">
                <p className="vault-cd-strip__label">Available Liquidity</p>
                <p className="vault-cd-strip__value">{formatCurrency(availableLiquidity)}</p>
            </div>
            <div className="vault-cd-strip__card">
                <p className="vault-cd-strip__label">Required for Pending</p>
                <p className="vault-cd-strip__value">{formatCurrency(requiredTotal)}</p>
            </div>
            <div className="vault-cd-strip__card">
                <p className="vault-cd-strip__label">Deployment Coverage</p>
                <p className="vault-cd-strip__value">{formatPercent(coverage)}</p>
            </div>
        </div>
    );
}

const FundingSummaryStrip = memo(FundingSummaryStripComponent);

// ────────────────────────────────────────────────────────────
// CampaignAllocationCard
// ────────────────────────────────────────────────────────────

function CampaignAllocationCardComponent({
    campaign,
    availableLiquidity,
    onAllocate,
    allocatingId,
}) {
    const { required, funded, remaining, pct } = deriveCampaignMetrics(campaign);
    const isFunded = campaign.status === 'FUNDED';
    const isAllocating = allocatingId === campaign.id;
    const insufficientLiquidity = remaining > availableLiquidity && !isFunded;

    // CTA label
    let ctaLabel;
    if (isFunded) {
        ctaLabel = 'Fully Funded';
    } else if (isAllocating) {
        ctaLabel = 'Processing…';
    } else if (campaign.status === 'UNFUNDED') {
        ctaLabel = 'Fund Campaign';
    } else {
        ctaLabel = 'Complete Funding';
    }

    const ctaDisabled = isFunded || isAllocating || insufficientLiquidity;
    const ctaClassName = [
        'vault-cd-alloc__cta',
        isFunded ? 'vault-cd-alloc__cta--funded' : '',
    ].filter(Boolean).join(' ');

    const handleClick = useCallback(() => {
        if (!ctaDisabled && onAllocate) {
            onAllocate(campaign.id, remaining);
        }
    }, [ctaDisabled, onAllocate, campaign.id, remaining]);

    // Status label for the pill
    const statusLabel =
        campaign.status === 'FUNDED'
            ? 'Funded'
            : campaign.status === 'PARTIAL'
                ? `${Math.round(pct)}% Funded`
                : 'Unfunded';

    return (
        <div className="vault-cd-alloc">
            {/* Left zone — Identity */}
            <div className="vault-cd-alloc__identity">
                <p className="vault-cd-alloc__name">{campaign.name}</p>
                <span className={`vault-cd-alloc__status ${getStatusClass(campaign.status)}`}>
                    {statusLabel}
                </span>
            </div>

            {/* Center zone — Progress */}
            <div className="vault-cd-alloc__progress">
                <p className="vault-cd-alloc__amounts">
                    {formatCurrency(funded)} / {formatCurrency(required)}
                </p>
                <div className="vault-cd-alloc__bar-track">
                    <div
                        className={`vault-cd-alloc__bar-fill ${getProgressColorClass(pct)}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {!isFunded && (
                    <p className="vault-cd-alloc__remaining">
                        {formatCurrency(remaining)} remaining
                    </p>
                )}
            </div>

            {/* Right zone — CTA */}
            <div className="vault-cd-alloc__action">
                <button
                    className={ctaClassName}
                    disabled={ctaDisabled}
                    onClick={handleClick}
                    title={
                        insufficientLiquidity
                            ? 'Insufficient available liquidity'
                            : isFunded
                                ? ''
                                : 'Moves funds from Available Liquidity to Escrow'
                    }
                    aria-label={`${ctaLabel} for ${campaign.name}`}
                >
                    {isAllocating && <span className="vault-cd-alloc__cta-spinner" />}
                    {ctaLabel}
                </button>
            </div>
        </div>
    );
}

const CampaignAllocationCard = memo(CampaignAllocationCardComponent);

// ────────────────────────────────────────────────────────────
// CapitalDeploymentSection (default export)
// ────────────────────────────────────────────────────────────

function CapitalDeploymentSection({ campaigns = [], vault = {}, onAllocate, isLoading, allocatingId }) {
    // ── Loading skeleton ────────────────────────────
    if (isLoading) {
        return (
            <section className="vault-cd vault-cd--loading">
                <div className="vault-cd__header">
                    <div>
                        <div className="vault-skeleton vault-skeleton--label" style={{ width: 220 }} />
                        <div className="vault-skeleton vault-skeleton--hint" style={{ width: 280, marginTop: 8 }} />
                    </div>
                </div>
                <div className="vault-cd-strip">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="vault-cd-strip__card">
                            <div className="vault-skeleton vault-skeleton--label" style={{ width: '60%' }} />
                            <div className="vault-skeleton vault-skeleton--value" style={{ width: '50%', marginTop: 8 }} />
                        </div>
                    ))}
                </div>
                <div className="vault-cd__cards">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="vault-cd-alloc">
                            <div className="vault-skeleton vault-skeleton--label" style={{ width: '70%' }} />
                            <div className="vault-skeleton" style={{ width: '100%', height: 8, borderRadius: 4, marginTop: 8 }} />
                            <div className="vault-skeleton vault-skeleton--hint" style={{ width: 100, marginTop: 8 }} />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // ── Derived values with defensive guards ─────────
    const availableLiquidity = Math.max(0, vault.availableLiquidity ?? 0);

    const { pendingCount, fundedCount, requiredTotal } = useMemo(() => {
        let pending = 0;
        let funded = 0;
        let totalRequired = 0;

        campaigns.forEach(c => {
            if (c.status === 'FUNDED') {
                funded += 1;
            } else {
                pending += 1;
                const req = Math.max(0, (c.requiredAmount ?? 0) - Math.max(0, c.fundedAmount ?? 0));
                totalRequired += req;
            }
        });

        return { pendingCount: pending, fundedCount: funded, requiredTotal: totalRequired };
    }, [campaigns]);

    const coverage = useMemo(() => {
        if (requiredTotal <= 0) return 100;
        return Math.min(100, Math.max(0, (availableLiquidity / requiredTotal) * 100));
    }, [availableLiquidity, requiredTotal]);

    // ── Empty states ────────────────────────────────
    const noCampaigns = campaigns.length === 0;
    const allFunded = !noCampaigns && pendingCount === 0;

    return (
        <section className="vault-cd">
            {/* Header */}
            <div className="vault-cd__header">
                <div>
                    <h3 className="vault-cd__title">Campaign Capital Allocation</h3>
                    <p className="vault-cd__subtitle">
                        Deploy available liquidity into campaign escrow pools.
                    </p>
                    <p className="vault-cd__trust">
                        <span className="material-symbols-outlined vault-cd__trust-icon">verified_user</span>
                        Allocations are secured under ReachStakes escrow protection.
                    </p>
                </div>
                {campaigns.length > 0 && (
                    <div className="vault-cd__pills">
                        {pendingCount > 0 && (
                            <span className="vault-cd__pill vault-cd__pill--pending">
                                {pendingCount} Pending Allocation
                            </span>
                        )}
                        {fundedCount > 0 && (
                            <span className="vault-cd__pill vault-cd__pill--funded">
                                {fundedCount} Fully Funded
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Funding Summary Strip */}
            {!noCampaigns && (
                <FundingSummaryStrip
                    availableLiquidity={availableLiquidity}
                    requiredTotal={requiredTotal}
                    coverage={coverage}
                />
            )}

            {/* Campaign Cards or Empty State */}
            {noCampaigns ? (
                <div className="vault-cd__empty">
                    <span className="material-symbols-outlined vault-cd__empty-icon">campaign</span>
                    <p className="vault-cd__empty-title">No campaigns require funding</p>
                    <p className="vault-cd__empty-text">
                        Create a new campaign to deploy capital into escrow pools.
                    </p>
                </div>
            ) : allFunded ? (
                <div className="vault-cd__empty">
                    <span className="material-symbols-outlined vault-cd__empty-icon">check_circle</span>
                    <p className="vault-cd__empty-title">All campaigns fully funded</p>
                    <p className="vault-cd__empty-text">
                        Capital is actively deployed across all campaign escrow pools.
                    </p>
                </div>
            ) : (
                <div className="vault-cd__cards">
                    {campaigns.map(campaign => (
                        <CampaignAllocationCard
                            key={campaign.id}
                            campaign={campaign}
                            availableLiquidity={availableLiquidity}
                            onAllocate={onAllocate}
                            allocatingId={allocatingId}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default memo(CapitalDeploymentSection);
