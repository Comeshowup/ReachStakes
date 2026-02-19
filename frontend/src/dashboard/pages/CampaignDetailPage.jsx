import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignDetail } from '../../hooks/useCampaigns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    ArrowLeft, ArrowUpRight, ArrowDownRight, Download, MoreHorizontal, Edit3,
    TrendingUp, DollarSign, Users, Activity, Shield, Calendar, ChevronUp,
    ChevronDown, AlertTriangle, CheckCircle, Clock, Zap, Info, UserPlus,
    BarChart3, FileText,
} from 'lucide-react';

/* ================================================================
   SHARED CONSTANTS
   ================================================================ */
const SECTION_GAP = 40;
const CARD_STYLE = {
    borderRadius: 'var(--bd-radius-xl)',
    border: '1px solid var(--bd-border-default)',
    background: 'var(--bd-surface-elevated)',
    boxShadow: 'var(--bd-shadow-sm)',
};

/* ================================================================
   STATUS BADGE
   ================================================================ */
const StatusBadge = ({ status, size = 'sm' }) => {
    const variants = {
        Active: { bg: 'var(--bd-success-muted)', color: 'var(--bd-success)', border: 'var(--bd-success-border)' },
        Paused: { bg: 'var(--bd-warning-muted)', color: 'var(--bd-warning)', border: 'var(--bd-warning-border)' },
        Completed: { bg: 'var(--bd-info-muted)', color: 'var(--bd-info)', border: 'var(--bd-info-border)' },
        Draft: { bg: 'var(--bd-muted)', color: 'var(--bd-muted-fg)', border: 'var(--bd-border-default)' },
    };
    const v = variants[status] || variants.Draft;
    const isLg = size === 'lg';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: isLg ? '4px 12px' : '3px 10px',
            borderRadius: 9999, fontSize: isLg ? '0.8125rem' : '0.75rem',
            fontWeight: 600, letterSpacing: '0.03em',
            background: v.bg, color: v.color, border: `1px solid ${v.border}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            {status}
        </span>
    );
};

/* ================================================================
   TOOLTIP WRAPPER
   ================================================================ */
const SimpleTooltip = ({ label, children }) => {
    const [show, setShow] = useState(false);
    return (
        <span
            style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <span style={{
                    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginBottom: 6, padding: '5px 10px', borderRadius: 'var(--bd-radius-md)',
                    background: 'var(--bd-surface)', border: '1px solid var(--bd-border-default)',
                    boxShadow: 'var(--bd-shadow-md)', fontSize: '0.6875rem', fontWeight: 500,
                    color: 'var(--bd-text-secondary)', whiteSpace: 'nowrap', zIndex: 50,
                    pointerEvents: 'none',
                }}>
                    {label}
                </span>
            )}
        </span>
    );
};

/* ================================================================
   METRIC CARD — Hierarchy-aware
   ================================================================ */
const MetricCard = ({ title, value, prefix, suffix, trend, change, primary, secondary, tooltip, noData }) => {
    const isPrimary = !!primary;
    const isSecondary = !!secondary;
    const showDelta = !noData && trend && change !== undefined && change !== 0;

    return (
        <div
            style={{
                padding: isPrimary ? 24 : 20,
                ...CARD_STYLE,
                background: isPrimary ? 'var(--bd-info-muted)' : CARD_STYLE.background,
                border: isPrimary ? '1px solid var(--bd-primary)' : CARD_STYLE.border,
                transition: 'box-shadow 200ms, transform 150ms',
                cursor: 'default',
                gridColumn: isPrimary ? 'span 1' : undefined,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--bd-shadow-md)';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'var(--bd-shadow-sm)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isPrimary ? 10 : 8 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--bd-text-secondary)' }}>
                    {tooltip ? <SimpleTooltip label={tooltip}>{title} <Info size={11} style={{ opacity: 0.5, marginLeft: 2 }} /></SimpleTooltip> : title}
                </span>
                {showDelta && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', fontWeight: 500,
                        padding: '2px 6px', borderRadius: 9999,
                        color: trend === 'up' ? 'var(--bd-success)' : 'var(--bd-danger)',
                        background: trend === 'up' ? 'var(--bd-success-muted)' : 'var(--bd-danger-muted)',
                    }}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(change)}%
                    </span>
                )}
                {noData && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--bd-text-muted)', fontStyle: 'italic' }}>Awaiting data</span>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                {prefix && <span style={{ fontSize: isPrimary ? '1.125rem' : '1rem', fontWeight: 500, color: 'var(--bd-text-muted)' }}>{prefix}</span>}
                <span style={{
                    fontSize: isPrimary ? '2rem' : isSecondary ? '1.625rem' : '1.375rem',
                    fontWeight: isPrimary ? 800 : 700,
                    color: isPrimary ? 'var(--bd-primary)' : 'var(--bd-text-primary)',
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                }}>{noData ? '—' : value}</span>
                {suffix && !noData && <span style={{ fontSize: isPrimary ? '1rem' : '0.875rem', fontWeight: 500, color: 'var(--bd-text-secondary)' }}>{suffix}</span>}
            </div>
        </div>
    );
};

/* ================================================================
   RISK PILL
   ================================================================ */
const RiskPill = ({ level, spend }) => {
    const noSpend = !spend || spend <= 0;
    const config = {
        Low: { bg: 'var(--bd-success-muted)', color: 'var(--bd-success)', border: 'var(--bd-success-border)', label: 'On track', icon: CheckCircle },
        Medium: { bg: 'var(--bd-warning-muted)', color: 'var(--bd-warning)', border: 'var(--bd-warning-border)', label: 'Monitor closely', icon: AlertTriangle },
        High: { bg: 'var(--bd-danger-muted)', color: 'var(--bd-danger)', border: 'var(--bd-danger-border)', label: 'Overspending risk', icon: AlertTriangle },
    };
    const c = config[level] || config.Low;
    const Icon = c.icon;
    return (
        <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginBottom: 6 }}>Risk Level</div>
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 9999,
                background: c.bg, border: `1px solid ${c.border}`,
            }}>
                <Icon size={14} style={{ color: c.color }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: c.color }}>{level || 'Low'}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--bd-text-secondary)', borderLeft: '1px solid var(--bd-border-default)', paddingLeft: 8, marginLeft: 2 }}>
                    {noSpend ? 'No spend yet' : c.label}
                </span>
            </div>
        </div>
    );
};

/* ================================================================
   SECTION HEADER
   ================================================================ */
const SectionHeader = ({ icon: Icon, title, iconColor = 'var(--bd-primary)', children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--bd-text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Icon size={17} style={{ color: iconColor }} /> {title}
        </h2>
        {children}
    </div>
);

/* ================================================================
   SKELETON
   ================================================================ */
const SkeletonBlock = ({ height = 16, width = '100%', style = {} }) => (
    <div className="bd-skeleton" style={{ height, width, borderRadius: 'var(--bd-radius-lg)', ...style }} />
);
const Skeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: 32, maxWidth: 1200, margin: '0 auto' }}>
        <SkeletonBlock height={36} width="35%" />
        <SkeletonBlock height={14} width="55%" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[1, 2, 3, 4].map(i => <SkeletonBlock key={i} height={100} />)}
        </div>
        <SkeletonBlock height={180} />
        <SkeletonBlock height={120} />
    </div>
);

/* ================================================================
   EMPTY STATES
   ================================================================ */
const CreatorEmptyState = () => (
    <div style={{
        padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
        <div style={{
            width: 48, height: 48, borderRadius: 'var(--bd-radius-xl)',
            background: 'var(--bd-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
        }}>
            <Users size={22} style={{ color: 'var(--bd-text-muted)' }} />
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>
            No creators assigned to this campaign
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--bd-text-muted)', maxWidth: 300, lineHeight: 1.5 }}>
            Assign creators to start generating performance data.
        </div>
        <button
            className="bd-cm-btn-primary"
            style={{ marginTop: 12, padding: '8px 20px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
            <UserPlus size={15} /> Assign Creators
        </button>
    </div>
);

const ActivityEmptyState = () => (
    <div style={{
        padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    }}>
        {/* Timeline-style placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}>
            {[
                { icon: DollarSign, label: 'Budget changes' },
                { icon: CheckCircle, label: 'Payouts' },
                { icon: FileText, label: 'Campaign updates' },
            ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                    {i > 0 && (
                        <div style={{
                            position: 'absolute', left: 15, top: -12, width: 1, height: 12,
                            background: 'var(--bd-border-default)',
                        }} />
                    )}
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--bd-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--bd-border-default)',
                    }}>
                        <item.icon size={14} style={{ color: 'var(--bd-text-muted)' }} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--bd-text-muted)', minWidth: 120 }}>{item.label}</span>
                </div>
            ))}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--bd-text-muted)', textAlign: 'center', maxWidth: 300, lineHeight: 1.5, margin: 0 }}>
            Budget changes, payouts, and campaign updates will appear here.
        </p>
    </div>
);

const PerformanceAwaitingState = () => (
    <div style={{ ...CARD_STYLE, padding: '32px 24px', textAlign: 'center' }}>
        <BarChart3 size={28} style={{ color: 'var(--bd-text-muted)', marginBottom: 8 }} />
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--bd-text-secondary)' }}>Awaiting performance data</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--bd-text-muted)', marginTop: 4 }}>
            Trend data will appear once the campaign starts generating revenue.
        </div>
    </div>
);

/* ================================================================
   MAIN PAGE
   ================================================================ */
const CampaignDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, error } = useCampaignDetail(id);
    const [timeRange, setTimeRange] = useState('30d');
    const [sortCol, setSortCol] = useState('spend');
    const [sortDir, setSortDir] = useState('desc');

    const sortedCreators = useMemo(() => {
        if (!data?.creators) return [];
        return [...data.creators].sort((a, b) => {
            const val = sortDir === 'desc' ? b[sortCol] - a[sortCol] : a[sortCol] - b[sortCol];
            return val;
        });
    }, [data?.creators, sortCol, sortDir]);

    const trendData = data?.performance_snapshot?.trend || [];

    const chartData = useMemo(() => {
        const now = new Date();
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
        const cutoff = new Date(now - days * 86400000);
        return trendData.filter(d => new Date(d.date) >= cutoff).map(d => ({
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: d.revenue,
            spend: d.spend,
        }));
    }, [trendData, timeRange]);

    const handleSort = useCallback((col) => {
        if (col === sortCol) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortCol(col); setSortDir('desc'); }
    }, [sortCol]);

    const SortIcon = ({ col }) => (
        sortCol === col
            ? (sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)
            : <ChevronDown size={14} style={{ opacity: 0.3 }} />
    );

    if (isLoading) return <Skeleton />;

    if (error || !data) {
        return (
            <div style={{ padding: 64, textAlign: 'center', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: 'var(--bd-danger-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                    <AlertTriangle size={24} style={{ color: 'var(--bd-danger)' }} />
                </div>
                <h2 style={{ color: 'var(--bd-text-primary)', marginBottom: 8, fontSize: '1.125rem', fontWeight: 600 }}>Campaign not found</h2>
                <p style={{ color: 'var(--bd-text-secondary)', marginBottom: 24, fontSize: '0.875rem' }}>
                    {error?.message || 'Unable to load campaign data.'}
                </p>
                <button onClick={() => navigate('/brand/campaigns')} className="bd-cm-btn-secondary" style={{ padding: '8px 20px' }}>
                    Back to Campaigns
                </button>
            </div>
        );
    }

    const { campaign, performance_snapshot: perf, capital_intelligence: cap, creators, activity_feed, risk_flags, risk_level } = data;

    // Data state checks
    const revenue = Number(perf?.revenue || 0);
    const spend = Number(perf?.spend || 0);
    const roas = parseFloat(perf?.roas) || 0;
    const cpa = parseFloat(perf?.cpa) || 0;
    const hasPerformanceData = revenue > 0 || spend > 0;
    const budgetAllocated = Number(cap?.budgetAllocated || campaign?.totalBudget || 0);
    const budgetSpent = Number(cap?.budgetSpent || 0);
    const escrowLocked = Number(cap?.escrowLocked || 0);
    const budgetPct = budgetAllocated > 0 ? Math.min(100, (budgetSpent / budgetAllocated) * 100) : 0;
    const escrowPct = budgetAllocated > 0 ? Math.min(100, (escrowLocked / budgetAllocated) * 100) : 0;
    const remainingPct = Math.max(0, 100 - budgetPct - escrowPct);
    const runwayValue = cap?.runway;
    const runwayIsExtreme = !runwayValue || runwayValue > 900 || budgetSpent <= 0;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>

            {/* ═══════════════════════════════════════════
                HEADER — Command Center Feel
               ═══════════════════════════════════════════ */}
            <div style={{ marginBottom: SECTION_GAP, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <button
                        onClick={() => navigate('/brand/campaigns')}
                        style={{
                            padding: 8, marginLeft: -8, marginTop: 4,
                            color: 'var(--bd-text-secondary)', background: 'none',
                            border: 'none', borderRadius: 'var(--bd-radius-md)', cursor: 'pointer',
                            transition: 'color 150ms, background 150ms',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bd-surface-hover)'; e.currentTarget.style.color = 'var(--bd-text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--bd-text-secondary)'; }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--bd-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                                {campaign.title}
                            </h1>
                            <StatusBadge status={campaign.status} size="lg" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8125rem', color: 'var(--bd-text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={13} />
                                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '—'} → {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '—'}
                            </span>
                            <span style={{ width: 1, height: 14, background: 'var(--bd-border-default)' }} />
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarSign size={13} />
                                ${budgetAllocated.toLocaleString()} budget
                            </span>
                            <span style={{ width: 1, height: 14, background: 'var(--bd-border-default)' }} />
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>ID: {campaign.id}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="bd-cm-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                        <Download size={14} /> Export
                    </button>
                    <button className="bd-cm-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                        <Edit3 size={14} /> Edit
                    </button>
                    <button className="bd-cm-icon-btn"><MoreHorizontal size={18} /></button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                PERFORMANCE KPIs — ROAS Primary
               ═══════════════════════════════════════════ */}
            <section style={{ marginBottom: SECTION_GAP }}>
                <SectionHeader icon={TrendingUp} title="Performance">
                    <div className="bd-cm-toggle-pill">
                        {['7d', '30d', 'All'].map(r => (
                            <button
                                key={r}
                                className="bd-cm-toggle-btn"
                                aria-pressed={timeRange === r}
                                onClick={() => setTimeRange(r)}
                                style={{ width: 'auto', padding: '0 10px' }}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                    <MetricCard
                        title="ROAS"
                        value={hasPerformanceData ? roas.toFixed(2) : undefined}
                        suffix="x"
                        trend={hasPerformanceData && roas > 0 ? 'up' : undefined}
                        change={hasPerformanceData && roas > 0 ? 8 : undefined}
                        primary
                        noData={!hasPerformanceData}
                        tooltip="Return on Ad Spend — Revenue ÷ Spend"
                    />
                    <MetricCard
                        title="Revenue"
                        prefix="$"
                        value={hasPerformanceData ? revenue.toLocaleString() : undefined}
                        trend={hasPerformanceData && revenue > 0 ? 'up' : undefined}
                        change={hasPerformanceData && revenue > 0 ? 12 : undefined}
                        secondary
                        noData={!hasPerformanceData}
                    />
                    <MetricCard
                        title="Spend"
                        prefix="$"
                        value={hasPerformanceData ? spend.toLocaleString() : undefined}
                        noData={!hasPerformanceData}
                    />
                    <MetricCard
                        title="CPA"
                        prefix="$"
                        value={hasPerformanceData ? cpa.toFixed(2) : undefined}
                        trend={hasPerformanceData && cpa > 0 ? 'down' : undefined}
                        change={hasPerformanceData && cpa > 0 ? 5 : undefined}
                        noData={!hasPerformanceData}
                        tooltip="Cost Per Acquisition — Spend ÷ Conversions"
                    />
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                TREND CHART
               ═══════════════════════════════════════════ */}
            <section style={{ marginBottom: SECTION_GAP }}>
                {chartData.length > 0 ? (
                    <div style={{ ...CARD_STYLE, padding: '20px 24px 16px' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="grev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--bd-success)" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="var(--bd-success)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gspe" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--bd-primary)" stopOpacity={0.08} />
                                        <stop offset="95%" stopColor="var(--bd-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bd-border-subtle)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'var(--bd-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--bd-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} width={48} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bd-surface)', border: '1px solid var(--bd-border-default)', borderRadius: 8, fontSize: 12, boxShadow: 'var(--bd-shadow-md)' }}
                                    labelStyle={{ color: 'var(--bd-text-primary)', fontWeight: 600, marginBottom: 4 }}
                                    formatter={(val, name) => [`$${Number(val).toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Spend']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--bd-success)" fill="url(#grev)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="spend" stroke="var(--bd-primary)" fill="url(#gspe)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, fontSize: '0.6875rem', color: 'var(--bd-text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 12, height: 2, background: 'var(--bd-success)', borderRadius: 1 }} /> Revenue
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 12, height: 2, background: 'var(--bd-primary)', borderRadius: 1, borderTop: '1px dashed var(--bd-primary)' }} /> Spend
                            </span>
                        </div>
                    </div>
                ) : (
                    <PerformanceAwaitingState />
                )}
            </section>

            {/* ═══════════════════════════════════════════
                CAPITAL INTELLIGENCE
               ═══════════════════════════════════════════ */}
            <section style={{ marginBottom: SECTION_GAP }}>
                <SectionHeader icon={DollarSign} title="Capital Intelligence" />
                <div style={{ ...CARD_STYLE, padding: 24 }}>
                    {/* Segmented Budget Bar */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>Budget Utilization</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                {budgetPct.toFixed(0)}%
                                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--bd-text-muted)', marginLeft: 6 }}>consumed</span>
                            </span>
                        </div>
                        {/* Segmented bar: Spent | Escrow | Remaining */}
                        <div style={{ height: 8, borderRadius: 999, overflow: 'hidden', display: 'flex', background: 'var(--bd-muted)' }}>
                            {budgetPct > 0 && (
                                <div style={{ width: `${budgetPct}%`, background: 'var(--bd-primary)', transition: 'width 300ms ease' }} />
                            )}
                            {escrowPct > 0 && (
                                <div style={{ width: `${escrowPct}%`, background: 'var(--bd-warning)', transition: 'width 300ms ease' }} />
                            )}
                            <div style={{ flex: 1, background: 'var(--bd-muted)' }} />
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.6875rem', color: 'var(--bd-text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--bd-primary)' }} /> Spent (${budgetSpent.toLocaleString()})
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--bd-warning)' }} /> Escrow (${escrowLocked.toLocaleString()})
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--bd-muted)' }} /> Remaining (${Math.max(0, budgetAllocated - budgetSpent - escrowLocked).toLocaleString()})
                            </span>
                        </div>
                    </div>

                    {/* Grouped Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, borderTop: '1px solid var(--bd-border-subtle)', paddingTop: 20 }}>
                        {/* Group 1: Allocation */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bd-text-muted)' }}>Allocation</div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginBottom: 3 }}>Total Budget</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                    ${budgetAllocated.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginBottom: 3 }}>Escrow Locked</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                    ${escrowLocked.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Group 2: Forecasting */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bd-text-muted)' }}>Forecasting</div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginBottom: 3 }}>
                                    Runway <SimpleTooltip label="Days until budget is exhausted at current spend rate"><Info size={11} style={{ opacity: 0.5 }} /></SimpleTooltip>
                                </div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                    {runwayIsExtreme ? (
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, fontStyle: 'italic', color: 'var(--bd-text-muted)' }}>
                                            Not calculated yet
                                        </span>
                                    ) : (
                                        <>{runwayValue} days</>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginBottom: 3 }}>Forecasted Spend</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                    {budgetSpent > 0 ? `$${Number(cap?.forecastedSpend || 0).toLocaleString()}` : (
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, fontStyle: 'italic', color: 'var(--bd-text-muted)' }}>—</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Group 3: Risk */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bd-text-muted)' }}>Risk</div>
                            <RiskPill level={risk_level} spend={budgetSpent} />
                        </div>
                    </div>

                    {/* Reallocation Alert */}
                    {cap?.reallocationSuggestion && (
                        <div style={{
                            marginTop: 20, padding: '10px 14px', borderRadius: 'var(--bd-radius-lg)',
                            background: cap.reallocationSuggestion.type === 'warning' ? 'var(--bd-warning-muted)' : 'var(--bd-info-muted)',
                            border: `1px solid ${cap.reallocationSuggestion.type === 'warning' ? 'var(--bd-warning-border)' : 'var(--bd-info-border)'}`,
                            display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem',
                        }}>
                            <Zap size={15} style={{ color: cap.reallocationSuggestion.type === 'warning' ? 'var(--bd-warning)' : 'var(--bd-info)', flexShrink: 0 }} />
                            <span style={{ color: 'var(--bd-text-primary)' }}>{cap.reallocationSuggestion.message}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                CREATOR PERFORMANCE
               ═══════════════════════════════════════════ */}
            <section style={{ marginBottom: SECTION_GAP }}>
                <SectionHeader icon={Users} title="Creator Performance">
                    {creators?.length > 0 && (
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 500, color: 'var(--bd-text-muted)',
                            background: 'var(--bd-muted)', padding: '3px 10px', borderRadius: 9999,
                        }}>
                            {creators.length} creator{creators.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </SectionHeader>

                {sortedCreators.length > 0 ? (
                    <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--bd-border-default)' }}>
                                    {[
                                        { key: 'name', label: 'Creator' },
                                        { key: 'content', label: 'Content' },
                                        { key: 'spend', label: 'Spend' },
                                        { key: 'revenue', label: 'Revenue' },
                                        { key: 'roas', label: 'ROAS' },
                                        { key: 'status', label: 'Status' },
                                    ].map(col => (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            style={{
                                                padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                                                color: sortCol === col.key ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)',
                                                cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                                                background: 'var(--bd-surface-header)', transition: 'color 150ms',
                                            }}
                                        >
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {col.label} <SortIcon col={col.key} />
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCreators.map((c) => (
                                    <tr
                                        key={c.id}
                                        style={{ borderBottom: '1px solid var(--bd-border-subtle)', transition: 'background 150ms', cursor: 'default' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bd-surface-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: 500, color: 'var(--bd-text-primary)' }}>{c.name}</div>
                                            {c.handle && <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)' }}>@{c.handle}</div>}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{c.content}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>${Number(c.spend).toLocaleString()}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--bd-success)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>${Number(c.revenue).toLocaleString()}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: parseFloat(c.roas) >= 2 ? 'var(--bd-success)' : 'var(--bd-text-primary)' }}>{c.roas}x</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <StatusBadge status={(c.status || '').replace('_', ' ')} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
                        <CreatorEmptyState />
                    </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════
                RISK FLAGS
               ═══════════════════════════════════════════ */}
            {risk_flags && risk_flags.length > 0 && (
                <section style={{ marginBottom: SECTION_GAP }}>
                    <SectionHeader icon={Shield} title="Risk Flags" iconColor="var(--bd-warning)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {risk_flags.map((flag, i) => (
                            <div key={i} style={{
                                padding: '12px 16px', borderRadius: 'var(--bd-radius-lg)',
                                background: flag.severity === 'high' ? 'var(--bd-danger-muted)' : 'var(--bd-warning-muted)',
                                border: `1px solid ${flag.severity === 'high' ? 'var(--bd-danger-border)' : 'var(--bd-warning-border)'}`,
                                display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem',
                            }}>
                                <AlertTriangle size={15} style={{ color: flag.severity === 'high' ? 'var(--bd-danger)' : 'var(--bd-warning)', flexShrink: 0 }} />
                                <span style={{ color: 'var(--bd-text-primary)', flex: 1 }}>{flag.message}</span>
                                <span style={{
                                    fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                                    background: flag.severity === 'high' ? 'var(--bd-danger-muted)' : 'var(--bd-warning-muted)',
                                    color: flag.severity === 'high' ? 'var(--bd-danger)' : 'var(--bd-warning)',
                                    border: `1px solid ${flag.severity === 'high' ? 'var(--bd-danger-border)' : 'var(--bd-warning-border)'}`,
                                }}>{flag.type}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════
                ACTIVITY FEED
               ═══════════════════════════════════════════ */}
            <section>
                <SectionHeader icon={Activity} title="Activity" />
                <div style={{ ...CARD_STYLE, padding: 0, overflow: 'hidden' }}>
                    {activity_feed && activity_feed.length > 0 ? (
                        activity_feed.map((event, i) => {
                            const iconMap = {
                                CREATED: { icon: CheckCircle, color: 'var(--bd-success)' },
                                PAYOUT: { icon: DollarSign, color: 'var(--bd-info)' },
                                PAUSED: { icon: Clock, color: 'var(--bd-warning)' },
                                WARNING: { icon: AlertTriangle, color: 'var(--bd-danger)' },
                            };
                            const { icon: EventIcon, color } = iconMap[event.type] || { icon: Activity, color: 'var(--bd-text-muted)' };
                            return (
                                <div
                                    key={event.id}
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px',
                                        borderBottom: i < activity_feed.length - 1 ? '1px solid var(--bd-border-subtle)' : 'none',
                                        transition: 'background 150ms',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bd-surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--bd-muted)', border: '1px solid var(--bd-border-subtle)', flexShrink: 0,
                                    }}>
                                        <EventIcon size={14} style={{ color }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--bd-text-primary)', lineHeight: 1.5 }}>
                                            {event.description}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginTop: 2 }}>
                                            {new Date(event.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <ActivityEmptyState />
                    )}
                </div>
            </section>
        </div>
    );
};

export default CampaignDetailPage;
