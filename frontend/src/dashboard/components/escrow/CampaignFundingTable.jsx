import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import {
    ChevronDown,
    ChevronRight,
    ChevronUp,
    DollarSign,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    Target,
    TrendingUp,
    Briefcase,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * CampaignFundingTable — Financial-grade table with sorting, sticky header,
 * keyboard nav, health indicators, and expandable milestone rows.
 */

// ─── Health logic ────────────────────────────────
const getHealthIndicator = (campaign) => {
    const { targetBudget, fundedAmount, releasedAmount } = campaign;
    const balance = (fundedAmount || 0) - (releasedAmount || 0);

    if (!targetBudget || targetBudget === 0) {
        return { label: 'N/A', tooltip: 'No target budget set', className: 'ev-dot--neutral' };
    }

    const fundedRatio = fundedAmount / targetBudget;
    if (balance < 0) {
        return { label: 'Release Exceeds Escrow', tooltip: `Released funds exceed current escrow by ${formatCurrency(Math.abs(balance), { whole: true })}`, className: 'ev-dot--danger' };
    }
    if (fundedRatio >= 1) {
        return { label: 'Fully Funded', tooltip: `Campaign is fully funded (${Math.round(fundedRatio * 100)}%)`, className: 'ev-dot--healthy' };
    }
    if (fundedRatio >= 0.5) {
        return { label: `Underfunded (${Math.round(fundedRatio * 100)}%)`, tooltip: `Funding gap: ${formatCurrency(targetBudget - fundedAmount, { whole: true })} remaining`, className: 'ev-dot--watch' };
    }
    return { label: 'Funding Gap', tooltip: `Only ${Math.round(fundedRatio * 100)}% funded — ${formatCurrency(targetBudget - fundedAmount, { whole: true })} gap`, className: 'ev-dot--danger' };
};

const STATUS_STYLES = {
    Active: { className: 'ev-badge--info', label: 'Active' },
    Paused: { className: 'ev-badge--warning', label: 'Paused' },
    Draft: { className: 'ev-badge--muted', label: 'Draft' },
    Completed: { className: 'ev-badge--success', label: 'Completed' },
    Cancelled: { className: 'ev-badge--danger', label: 'Cancelled' },
};

// ─── Expanded Row ────────────────────────────────
const ExpandedContent = ({ campaign, onFund, onRelease }) => {
    const milestones = campaign.milestones || [];
    const gap = Math.max(0, (campaign.targetBudget || 0) - (campaign.fundedAmount || 0));
    const recentTx = campaign.recentTransactions || [];

    return (
        <motion.div
            className="ev-exp"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div className="ev-exp__inner">
                {/* Milestone Timeline */}
                <div className="ev-exp__panel">
                    <h4 className="ev-exp__panel-title">
                        <Target size={14} />
                        Milestone Timeline
                    </h4>
                    {milestones.length > 0 ? (
                        <div className="ev-exp__timeline">
                            {milestones.map((ms, i) => {
                                const isReleased = ms.status === 'Released';
                                return (
                                    <div key={i} className="ev-exp__milestone">
                                        <div className="ev-exp__ms-track">
                                            <div className={`ev-exp__ms-dot ${isReleased ? 'ev-exp__ms-dot--done' : ''}`}>
                                                {isReleased
                                                    ? <CheckCircle2 size={14} />
                                                    : <Clock size={14} />
                                                }
                                            </div>
                                            {i < milestones.length - 1 && <div className="ev-exp__ms-line" />}
                                        </div>
                                        <div className="ev-exp__ms-body">
                                            <span className="ev-exp__ms-name">{ms.name}</span>
                                            <div className="ev-exp__ms-meta">
                                                <span className={`ev-exp__ms-status ${isReleased ? 'ev-exp__ms-status--done' : ''}`}>
                                                    {ms.status}
                                                </span>
                                                <span className="ev-exp__ms-amount">{formatCurrency(ms.amount, { whole: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="ev-exp__empty">No milestones configured.</p>
                    )}
                </div>

                {/* Funding Analysis */}
                <div className="ev-exp__panel">
                    <h4 className="ev-exp__panel-title">
                        <TrendingUp size={14} />
                        Funding Analysis
                    </h4>
                    <div className="ev-exp__kpi-grid">
                        <div className="ev-exp__kpi">
                            <span className="ev-exp__kpi-label">Target</span>
                            <span className="ev-exp__kpi-value">{formatCurrency(campaign.targetBudget, { whole: true })}</span>
                        </div>
                        <div className="ev-exp__kpi">
                            <span className="ev-exp__kpi-label">Funded</span>
                            <span className="ev-exp__kpi-value ev-exp__kpi-value--success">{formatCurrency(campaign.fundedAmount, { whole: true })}</span>
                        </div>
                        <div className="ev-exp__kpi">
                            <span className="ev-exp__kpi-label">Released</span>
                            <span className="ev-exp__kpi-value ev-exp__kpi-value--info">{formatCurrency(campaign.releasedAmount, { whole: true })}</span>
                        </div>
                        <div className="ev-exp__kpi">
                            <span className="ev-exp__kpi-label">Gap</span>
                            <span className={`ev-exp__kpi-value ${gap > 0 ? 'ev-exp__kpi-value--danger' : 'ev-exp__kpi-value--success'}`}>
                                {gap > 0 ? formatCurrency(gap, { whole: true }) : 'None'}
                            </span>
                        </div>
                    </div>

                    {gap > 0 && (
                        <div className="ev-exp__alert">
                            <AlertCircle size={14} />
                            <span>This campaign has a {formatCurrency(gap, { whole: true })} funding gap.</span>
                        </div>
                    )}

                    {recentTx.length > 0 && (
                        <div className="ev-exp__ledger">
                            <span className="ev-exp__ledger-title">Recent Transactions</span>
                            {recentTx.slice(0, 3).map((tx, i) => (
                                <div key={i} className="ev-exp__ledger-row">
                                    <span className="ev-exp__ledger-type">{tx.type}</span>
                                    <span className="ev-exp__ledger-amount">{formatCurrency(tx.amount, { whole: true })}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="ev-exp__actions">
                    {gap > 0 && (
                        <button className="ev-exp__btn ev-exp__btn--fund" onClick={() => onFund?.(campaign)}>
                            <DollarSign size={14} />
                            Fund Campaign
                        </button>
                    )}
                    {milestones.some(m => m.status === 'Pending') && (
                        <button className="ev-exp__btn ev-exp__btn--release" onClick={() => onRelease?.(campaign)}>
                            <Send size={14} />
                            Release Milestone
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Sortable Column Header ─────────────────────
const SortHeader = ({ label, sortKey, currentSort, onSort, align }) => {
    const isActive = currentSort.key === sortKey;
    const isAsc = isActive && currentSort.dir === 'asc';

    return (
        <th
            className={`ev-th ev-th--sortable ${isActive ? 'ev-th--sorted' : ''} ${align === 'right' ? 'ev-th--num' : ''}`}
            onClick={() => onSort(sortKey)}
            aria-sort={isActive ? (isAsc ? 'ascending' : 'descending') : 'none'}
        >
            {label}
            <span className="ev-th__sort-icon">
                {isActive ? (isAsc ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ChevronUp size={10} />}
            </span>
        </th>
    );
};

// ─── Campaign Row ────────────────────────────────
const CampaignRow = ({ campaign, isExpanded, onToggle, onFund, onRelease }) => {
    const statusStyle = STATUS_STYLES[campaign.status] || STATUS_STYLES.Draft;
    const health = getHealthIndicator(campaign);
    const target = campaign.targetBudget || 0;
    const funded = campaign.fundedAmount || 0;
    const released = campaign.releasedAmount || 0;
    const locked = Math.max(0, funded - released);
    const fundedPct = target > 0 ? Math.min(100, (funded / target) * 100) : 0;
    const releasedPct = target > 0 ? Math.min(100, (released / target) * 100) : 0;
    const tooltipId = `health-${campaign.id}`;

    return (
        <>
            <tr
                className={`ev-tr ${isExpanded ? 'ev-tr--expanded' : ''}`}
                onClick={onToggle}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
            >
                <td className="ev-td ev-td--expand">
                    <span className="ev-tr__chevron" aria-hidden="true">
                        {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                </td>
                <td className="ev-td ev-td--name">
                    <div className="ev-tr__name">
                        <Briefcase size={14} className="ev-tr__name-icon" />
                        <span className="ev-tr__name-text">{campaign.name}</span>
                    </div>
                </td>
                <td className="ev-td ev-td--status">
                    <span className={`ev-badge ${statusStyle.className}`}>{statusStyle.label}</span>
                </td>
                <td className="ev-td ev-td--num">{formatCurrency(target, { whole: true })}</td>
                <td className="ev-td ev-td--num">
                    <span className="ev-tr__funded">{formatCurrency(funded, { whole: true })}</span>
                </td>
                <td className="ev-td ev-td--num">
                    <span className="ev-tr__released">{formatCurrency(released, { whole: true })}</span>
                </td>
                <td className="ev-td ev-td--num">
                    <span className="ev-tr__locked">{formatCurrency(locked, { whole: true })}</span>
                </td>
                <td className="ev-td ev-td--progress">
                    <div
                        className="ev-lifecycle"
                        role="progressbar"
                        aria-valuenow={fundedPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${Math.round(fundedPct)}% funded`}
                    >
                        <div className="ev-lifecycle__track">
                            <motion.div
                                className="ev-lifecycle__funded"
                                initial={{ width: 0 }}
                                animate={{ width: `${fundedPct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                            <motion.div
                                className="ev-lifecycle__released"
                                initial={{ width: 0 }}
                                animate={{ width: `${releasedPct}%` }}
                                transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="ev-lifecycle__label">{Math.round(fundedPct)}%</span>
                    </div>
                </td>
                <td className="ev-td ev-td--health">
                    <div
                        className="ev-health-ind"
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={health.tooltip}
                    >
                        <span className={`ev-health-ind__dot ${health.className}`} />
                        <span className="ev-health-ind__label">{health.label}</span>
                    </div>
                    <Tooltip id={tooltipId} place="left" className="ev-tooltip" />
                </td>
            </tr>
            <AnimatePresence>
                {isExpanded && (
                    <tr className="ev-tr--expand-container">
                        <td colSpan={9} className="ev-td--expand-cell">
                            <ExpandedContent campaign={campaign} onFund={onFund} onRelease={onRelease} />
                        </td>
                    </tr>
                )}
            </AnimatePresence>
        </>
    );
};

// ─── Table ───────────────────────────────────────
const CampaignFundingTable = ({ campaigns, loading, onFund, onRelease }) => {
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [sort, setSort] = useState({ key: null, dir: 'desc' });

    const toggleExpand = useCallback((id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleSort = useCallback((key) => {
        setSort(prev => ({
            key,
            dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
        }));
    }, []);

    const sortedCampaigns = useMemo(() => {
        if (!campaigns || !sort.key) return campaigns;
        const sorted = [...campaigns].sort((a, b) => {
            const aVal = a[sort.key] || 0;
            const bVal = b[sort.key] || 0;
            return sort.dir === 'asc' ? aVal - bVal : bVal - aVal;
        });
        return sorted;
    }, [campaigns, sort]);

    if (loading) {
        return (
            <div className="ev-section" aria-busy="true">
                <div className="ev-section__header">
                    <h2 className="ev-section__title">Campaign Capital Allocation</h2>
                </div>
                <div className="ev-table-skel">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="ev-table-skel__row">
                            <div className="bd-skeleton ev-skel--name" />
                            <div className="bd-skeleton ev-skel--badge" />
                            <div className="bd-skeleton ev-skel--amt" />
                            <div className="bd-skeleton ev-skel--amt" />
                            <div className="bd-skeleton ev-skel--bar" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="ev-section">
            <div className="ev-section__header">
                <h2 className="ev-section__title">Campaign Capital Allocation</h2>
                <span className="ev-section__count">
                    {campaigns?.length || 0} campaign{campaigns?.length !== 1 ? 's' : ''}
                </span>
            </div>

            {!campaigns || campaigns.length === 0 ? (
                <div className="ev-empty-state">
                    <Briefcase size={28} className="ev-empty-state__icon" />
                    <p className="ev-empty-state__text">No campaigns found</p>
                    <span className="ev-empty-state__sub">Create a campaign to start managing escrow funds.</span>
                </div>
            ) : (
                <div className="ev-table-wrap">
                    <table className="ev-table" role="table">
                        <thead>
                            <tr className="ev-thead-row">
                                <th className="ev-th ev-th--expand" aria-label="Expand" />
                                <th className="ev-th">Campaign</th>
                                <th className="ev-th">Status</th>
                                <SortHeader label="Target" sortKey="targetBudget" currentSort={sort} onSort={handleSort} align="right" />
                                <SortHeader label="Funded" sortKey="fundedAmount" currentSort={sort} onSort={handleSort} align="right" />
                                <SortHeader label="Released" sortKey="releasedAmount" currentSort={sort} onSort={handleSort} align="right" />
                                <th className="ev-th ev-th--num">Locked</th>
                                <th className="ev-th">Progress</th>
                                <th className="ev-th">Health</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCampaigns.map(c => (
                                <CampaignRow
                                    key={c.id}
                                    campaign={c}
                                    isExpanded={expandedIds.has(c.id)}
                                    onToggle={() => toggleExpand(c.id)}
                                    onFund={onFund}
                                    onRelease={onRelease}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CampaignFundingTable;
