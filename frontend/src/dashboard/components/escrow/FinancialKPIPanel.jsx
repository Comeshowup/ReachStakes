import { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PiggyBank,
    Clock,
    DollarSign,
    Plus,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * FinancialKPIPanel — 4-card grid with allocation bar, count-up, sparklines.
 * Cards: Total Escrow Balance, Allocated Capital, Pending Releases, Unallocated Capital.
 * "Released" is removed from primary row per spec — lives in ledger context.
 */

// ─── Config ──────────────────────────────────────
const KPI_CONFIG = [
    {
        key: 'totalBalance',
        label: 'Total Escrow Balance',
        icon: Wallet,
        colorVar: '--bd-accent',
        trendKey: 'totalBalance',
        tooltip: 'Total funds deposited across all campaign escrow accounts, including locked and available balances.',
        showAllocBar: true,
        breakdown: (o) => {
            const total = o.totalBalance || 0;
            if (total === 0) return null;
            const allocated = o.allocatedFunds || 0;
            const available = o.availableBalance || 0;
            const allocPct = total > 0 ? Math.round((allocated / total) * 100) : 0;
            const availPct = 100 - allocPct;
            return `Allocated ${allocPct}% · Available ${availPct}%`;
        },
        zeroSubtext: 'No funds deposited yet',
        zeroCta: 'Add Funds',
    },
    {
        key: 'allocatedFunds',
        label: 'Allocated Capital',
        icon: PiggyBank,
        colorVar: '--bd-info',
        trendKey: 'allocated',
        tooltip: 'Funds currently locked in active or paused campaign escrows.',
        breakdown: null,
        zeroSubtext: 'No active allocations',
    },
    {
        key: 'pendingReleases',
        label: 'Pending Releases',
        icon: Clock,
        colorVar: '--bd-warning',
        trendKey: 'pending',
        tooltip: 'Upcoming milestone obligations that will require escrow releases.',
        breakdown: null,
        zeroSubtext: 'No pending obligations',
    },
    {
        key: 'availableBalance',
        label: 'Unallocated Capital',
        icon: DollarSign,
        colorVar: '--bd-purple',
        trendKey: 'unallocated',
        tooltip: 'Available escrow balance not currently allocated to active campaigns.',
        breakdown: null,
        zeroSubtext: 'All funds allocated',
    },
];

const CHART_COLORS = {
    '--bd-accent': '#6366f1',
    '--bd-info': '#3b82f6',
    '--bd-success': '#10b981',
    '--bd-warning': '#f59e0b',
    '--bd-purple': '#8b5cf6',
};

// ─── Count-up Hook ───────────────────────────────
const useCountUp = (target, duration = 600) => {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);
    const startRef = useRef(null);

    useEffect(() => {
        if (target == null || isNaN(target)) { setDisplay(0); return; }
        const from = display;
        const to = Number(target);
        if (from === to) return;

        startRef.current = performance.now();
        const animate = (now) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(from + (to - from) * eased);
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);

    return display;
};

// ─── Sparkline ───────────────────────────────────
const SparklineChart = ({ data = [], color, height = 36, id }) => {
    const chartData = useMemo(
        () => data.map((value, index) => ({ index, value })),
        [data]
    );
    if (chartData.length < 2) return null;

    return (
        <div className="ev-kpi__sparkline" aria-hidden="true">
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id={`kpi-gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.5}
                        fill={`url(#kpi-gradient-${id})`}
                        dot={false}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// ─── Allocation Bar ──────────────────────────────
const AllocationBar = ({ overview }) => {
    const total = overview.totalBalance || 0;
    if (total === 0) return null;

    const allocated = overview.allocatedFunds || 0;
    const pending = overview.pendingReleases || 0;
    const free = Math.max(0, total - allocated - pending);
    const allocPct = (allocated / total) * 100;
    const pendingPct = (pending / total) * 100;
    const freePct = (free / total) * 100;

    return (
        <div>
            <div className="ev-kpi__alloc-bar">
                <div
                    className="ev-kpi__alloc-segment ev-kpi__alloc-segment--allocated"
                    style={{ width: `${allocPct}%` }}
                />
                <div
                    className="ev-kpi__alloc-segment ev-kpi__alloc-segment--pending"
                    style={{ width: `${pendingPct}%` }}
                />
                <div
                    className="ev-kpi__alloc-segment ev-kpi__alloc-segment--free"
                    style={{ width: `${freePct}%` }}
                />
            </div>
            <div className="ev-kpi__alloc-legend">
                <span className="ev-kpi__alloc-legend-item">
                    <span className="ev-kpi__alloc-legend-dot ev-kpi__alloc-legend-dot--allocated" />
                    Allocated
                </span>
                <span className="ev-kpi__alloc-legend-item">
                    <span className="ev-kpi__alloc-legend-dot ev-kpi__alloc-legend-dot--pending" />
                    Pending
                </span>
                <span className="ev-kpi__alloc-legend-item">
                    <span className="ev-kpi__alloc-legend-dot ev-kpi__alloc-legend-dot--free" />
                    Free
                </span>
            </div>
        </div>
    );
};

// ─── KPI Card ────────────────────────────────────
const KPICard = ({ config, value, trendData, index, overview, onAddFunds }) => {
    const Icon = config.icon;
    const animatedValue = useCountUp(value, 600);
    const chartColor = CHART_COLORS[config.colorVar] || '#6366f1';

    // Trend calculation
    const lastTwo = trendData?.slice(-2) || [];
    const trend = lastTwo.length === 2 && lastTwo[0] !== 0
        ? ((lastTwo[1] - lastTwo[0]) / Math.max(Math.abs(lastTwo[0]), 1)) * 100
        : 0;
    const trendUp = trend >= 0;
    const hasTrend = Math.abs(trend) >= 0.1;

    // Sub-breakdown
    const breakdownText = config.breakdown ? config.breakdown(overview) : null;

    // Zero state
    const isZero = value === 0 || value == null;

    return (
        <motion.div
            className="ev-kpi__card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            data-tooltip-id={`kpi-tip-${config.key}`}
            data-tooltip-content={config.tooltip}
        >
            <div className="ev-kpi__card-top">
                <div className="ev-kpi__icon-wrap" data-color={config.colorVar}>
                    <Icon size={15} strokeWidth={2} />
                </div>
                <span className="ev-kpi__label">{config.label}</span>
            </div>

            <div className="ev-kpi__card-body">
                <div className="ev-kpi__value-row">
                    <span className="ev-kpi__value" aria-label={`${config.label}: ${formatCurrency(value)}`}>
                        {formatCurrency(animatedValue)}
                    </span>
                    {hasTrend && (
                        <span className={`ev-kpi__delta ${trendUp ? 'ev-kpi__delta--up' : 'ev-kpi__delta--down'}`}>
                            {trendUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                            {Math.abs(trend).toFixed(1)}%
                        </span>
                    )}
                </div>

                {/* Sub-breakdown or zero-state */}
                {isZero ? (
                    <div className="ev-kpi__zero-state">
                        <span className="ev-kpi__zero-text">{config.zeroSubtext}</span>
                        {config.zeroCta && onAddFunds && (
                            <button className="ev-kpi__zero-cta" onClick={onAddFunds}>
                                <Plus size={12} />
                                {config.zeroCta}
                            </button>
                        )}
                    </div>
                ) : breakdownText ? (
                    <span className="ev-kpi__breakdown">{breakdownText}</span>
                ) : null}

                {/* Allocation bar for Total Escrow Balance */}
                {config.showAllocBar && !isZero && <AllocationBar overview={overview} />}

                <SparklineChart
                    data={trendData}
                    color={chartColor}
                    height={36}
                    id={config.key}
                />
            </div>

            <Tooltip id={`kpi-tip-${config.key}`} place="bottom" className="ev-tooltip" />
        </motion.div>
    );
};

// ─── Fallback empty overview ─────────────────────
const EMPTY_OVERVIEW = {
    totalBalance: 0, allocatedFunds: 0, releasedFunds: 0,
    pendingReleases: 0, availableBalance: 0, history: {},
};

// ─── Panel ───────────────────────────────────────
const FinancialKPIPanel = ({ overview, loading, onAddFunds }) => {
    if (loading) {
        return (
            <div className="ev-kpi__grid" aria-busy="true">
                {KPI_CONFIG.map((config) => (
                    <div
                        key={config.key}
                        className="ev-kpi__card ev-kpi__card--skeleton"
                    >
                        <div className="ev-kpi__card-top">
                            <div className="bd-skeleton ev-skel--circle" />
                            <div className="bd-skeleton ev-skel--label" />
                        </div>
                        <div className="ev-kpi__card-body">
                            <div className="bd-skeleton ev-skel--value" />
                            <div className="bd-skeleton ev-skel--spark" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const data = overview || EMPTY_OVERVIEW;

    return (
        <div className="ev-kpi__grid">
            {KPI_CONFIG.map((config, index) => (
                <KPICard
                    key={config.key}
                    config={config}
                    value={data[config.key]}
                    trendData={data.history?.[config.trendKey]}
                    index={index}
                    overview={data}
                    onAddFunds={onAddFunds}
                />
            ))}
        </div>
    );
};

export default FinancialKPIPanel;
