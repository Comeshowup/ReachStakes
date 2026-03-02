import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import paymentService from '../../api/paymentService';
import brandService from '../../api/brandService';
import {
    TrendingUp,
    DollarSign,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    ShieldCheck,
    Users,
    Clock,
    AlertTriangle,
    Gauge,
    Bell,
    X,
    Sparkles
} from 'lucide-react';
import AICampaignBuilder from '../components/AICampaignBuilder';


// --- TECH-LUXE COMPONENT PRIMITIVES ---

// 1. KPI Card: "Big Bold Numbers" + Glass + Thin Borders
const KPICard = ({ title, value, change, trend, icon: Icon, color, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="kpi-card-polished group"
        >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--bd-space-3)' }}>
                <span className="kpi-card-polished__label">{title}</span>
                <div className="kpi-card-polished__icon" style={{ background: 'var(--bd-bg-secondary)' }}>
                    <Icon style={{ width: 16, height: 16, color: 'var(--bd-text-secondary)' }} />
                </div>
            </div>

            <div style={{ marginBottom: 'var(--bd-space-2)' }}>
                <span className="kpi-card-polished__value">{value}</span>
            </div>

            <div className="flex items-center gap-3">
                <span className={`kpi-card-polished__delta ${trend === 'up' ? 'kpi-card-polished__delta--up' : 'kpi-card-polished__delta--down'}`}>
                    {trend === 'up' ? <ArrowUpRight style={{ width: 12, height: 12 }} /> : <ArrowDownRight style={{ width: 12, height: 12 }} />}
                    {change}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)' }}>vs last month</span>
            </div>
        </motion.div>
    );
};

// 2. Live ROI Widget - Real-time spend vs revenue tracker
const LiveROIWidget = ({ todaySpend = 2840, todayRevenue = 8520 }) => {
    const roi = ((todayRevenue - todaySpend) / todaySpend * 100).toFixed(0);
    const isPositive = todayRevenue > todaySpend;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="kpi-card-polished"
        >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--bd-space-3)' }}>
                <span className="kpi-card-polished__label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bd-success)', animation: 'pulse 2s infinite' }} />
                    Live Today
                </span>
                <Activity style={{ width: 16, height: 16, color: 'var(--bd-success)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--bd-space-4)' }}>
                <div>
                    <p className="kpi-card-polished__label" style={{ marginBottom: 4 }}>Spend</p>
                    <p className="financial-amount financial-amount--md" style={{ color: 'var(--bd-danger)' }}>${todaySpend.toLocaleString()}</p>
                </div>
                <div>
                    <p className="kpi-card-polished__label" style={{ marginBottom: 4 }}>Revenue</p>
                    <p className="financial-amount financial-amount--md" style={{ color: 'var(--bd-success)' }}>${todayRevenue.toLocaleString()}</p>
                </div>
            </div>
            <div style={{ marginTop: 'var(--bd-space-3)', paddingTop: 'var(--bd-space-3)', borderTop: '1px solid var(--bd-border-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)' }}>ROI Today</span>
                <span className={`kpi-card-polished__delta ${isPositive ? 'kpi-card-polished__delta--up' : 'kpi-card-polished__delta--down'}`}>
                    {isPositive ? '+' : ''}{roi}%
                </span>
            </div>
        </motion.div>
    );
};

// 3. Health Score Gauge - Campaign health indicator
const HealthScoreGauge = ({ score = 78 }) => {
    const getColor = (s) => s >= 80 ? 'emerald' : s >= 50 ? 'amber' : 'rose';
    const color = getColor(score);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="kpi-card-polished"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
            <span className="kpi-card-polished__label" style={{ marginBottom: 'var(--bd-space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gauge style={{ width: 12, height: 12 }} /> Health Score
            </span>
            <div className="relative" style={{ width: 96, height: 96 }}>
                <svg style={{ width: 96, height: 96, transform: 'rotate(-90deg)' }}>
                    <circle cx="48" cy="48" r="40" stroke="var(--bd-border-subtle)" strokeWidth="8" fill="none" />
                    <motion.circle
                        cx="48" cy="48" r="40"
                        stroke={color === 'emerald' ? 'var(--bd-success)' : color === 'amber' ? 'var(--bd-warning)' : 'var(--bd-danger)'}
                        strokeWidth="8" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="kpi-card-polished__value" style={{ fontSize: '1.5rem' }}>{score}</span>
                </div>
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: 'var(--bd-space-2)', color: color === 'emerald' ? 'var(--bd-success)' : color === 'amber' ? 'var(--bd-warning)' : 'var(--bd-danger)', fontWeight: 600 }}>
                {score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Attention'}
            </p>
        </motion.div>
    );
};

// 4. Time-to-Launch Tracker
const TimeToLaunchTracker = ({ campaigns = [] }) => {
    const activeCampaigns = campaigns.filter(c => c.status === 'Active' || c.status === 'Pending');
    const nextLaunch = activeCampaigns[0];
    const daysRemaining = nextLaunch ? Math.ceil((new Date(nextLaunch.deadline || Date.now() + 5 * 24 * 60 * 60 * 1000) - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="kpi-card-polished"
        >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--bd-space-3)' }}>
                <span className="kpi-card-polished__label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock style={{ width: 12, height: 12 }} /> Next Launch
                </span>
            </div>
            {nextLaunch ? (
                <>
                    <p style={{ fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-secondary)', marginBottom: 'var(--bd-space-2)' }} className="truncate">{nextLaunch.name}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="kpi-card-polished__value" style={{ color: 'var(--bd-purple)' }}>{daysRemaining}</span>
                        <span style={{ fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-muted)' }}>days</span>
                    </div>
                    <div style={{ marginTop: 'var(--bd-space-3)', height: 6, background: 'var(--bd-bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(10, 100 - daysRemaining * 10)}%` }}
                            style={{ height: '100%', background: 'var(--bd-purple)', borderRadius: 3 }}
                        />
                    </div>
                </>
            ) : (
                <p style={{ fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-muted)' }}>No upcoming launches</p>
            )}
        </motion.div>
    );
};

// 5. Smart Alerts Toast System
const SmartAlerts = ({ campaigns = [] }) => {
    const [alerts, setAlerts] = useState([]);
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        // Generate alerts based on campaign status
        const newAlerts = [];
        campaigns.forEach(campaign => {
            if (campaign.budgetUsed && campaign.budgetUsed > 80 && !dismissed.includes(`budget-${campaign.id}`)) {
                newAlerts.push({
                    id: `budget-${campaign.id}`,
                    type: 'warning',
                    message: `"${campaign.name}" budget 80% spent`,
                    action: 'Top up'
                });
            }
            if (campaign.roas && campaign.roas > 5 && !dismissed.includes(`success-${campaign.id}`)) {
                newAlerts.push({
                    id: `success-${campaign.id}`,
                    type: 'success',
                    message: `"${campaign.name}" performing ${campaign.roas}x above target!`,
                    action: null
                });
            }
        });
        setAlerts(newAlerts.slice(0, 3)); // Max 3 alerts
    }, [campaigns, dismissed]);

    const dismissAlert = (id) => {
        setDismissed(prev => [...prev, id]);
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 space-y-3">
            {alerts.map((alert, i) => (
                <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur-xl border shadow-xl ${alert.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-emerald-500/10 border-emerald-500/20'
                        }`}
                >
                    {alert.type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                        <Bell className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{alert.message}</p>
                    </div>
                    {alert.action && (
                        <button className="text-xs font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap">
                            {alert.action}
                        </button>
                    )}
                    <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-white/40 hover:text-white/70"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            ))}
        </div>
    );
};

// Mock Data
const CHART_DATA = [
    { month: 'Jan', revenue: 45000, spend: 12000 },
    { month: 'Feb', revenue: 52000, spend: 15000 },
    { month: 'Mar', revenue: 49000, spend: 13000 },
    { month: 'Apr', revenue: 62000, spend: 18000 },
    { month: 'May', revenue: 78000, spend: 22000 },
    { month: 'Jun', revenue: 95000, spend: 28000 },
    { month: 'Jul', revenue: 128000, spend: 35000 },
];

const CMODashboard = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAIBuilder, setShowAIBuilder] = useState(false);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await brandService.getBrandCampaigns();
                if (response.status === 'success') {
                    setCampaigns(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    return (
        <div className="min-h-screen font-sans p-8 lg:p-12" style={{ background: 'var(--bd-bg-primary)', color: 'var(--bd-text-primary)' }}>

            {/* 1. Header Section: The "Cockpit" feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bd-success)', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bd-success)' }}>System Operational</span>
                    </div>
                    <h1 className="page-title" style={{ fontSize: '2.25rem' }}>
                        Executive Overview
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button style={{ height: 40, padding: '0 24px', borderRadius: 'var(--bd-radius-lg)', border: '1px solid var(--bd-border-default)', background: 'var(--bd-surface)', color: 'var(--bd-text-primary)', fontSize: 'var(--bd-font-size-sm)', fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease' }}>
                        Export Data
                    </button>
                    <button
                        onClick={() => setShowAIBuilder(true)}
                        style={{ height: 40, padding: '0 24px', borderRadius: 'var(--bd-radius-lg)', background: 'var(--bd-accent)', color: 'var(--bd-primary-fg)', fontSize: 'var(--bd-font-size-sm)', fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 150ms ease', boxShadow: 'var(--bd-shadow-primary-btn)' }}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Campaign Builder
                    </button>
                    <button style={{ height: 40, padding: '0 24px', borderRadius: 'var(--bd-radius-lg)', background: 'var(--bd-primary)', color: 'var(--bd-primary-fg)', fontSize: 'var(--bd-font-size-sm)', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 150ms ease', boxShadow: 'var(--bd-shadow-primary-btn)' }}>
                        + New Campaign
                    </button>
                </div>
            </div>

            {/* 2. KPI Grid: High-level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <KPICard
                    title="Real-time ROAS"
                    value="3.56x"
                    change="+12%"
                    trend="up"
                    icon={TrendingUp}
                    color="emerald"
                    delay={0.1}
                />
                <KPICard
                    title="Active Pipeline"
                    value="12.4k"
                    change="+8.5%"
                    trend="up"
                    icon={Users}
                    color="indigo"
                    delay={0.2}
                />
                <KPICard
                    title="Escrow Locked"
                    value="$84k"
                    change="Secure"
                    trend="up"
                    icon={ShieldCheck}
                    color="amber"
                    delay={0.3}
                />
                <KPICard
                    title="Avg. CPA"
                    value="$28.50"
                    change="-4.3%"
                    trend="up" // actually good for CPA to down, but trend direction up implies good here usually, handled by color
                    icon={Target}
                    color="rose"
                    delay={0.4}
                />
            </div>

            {/* 2b. NEW Phase 2 Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <LiveROIWidget />
                <HealthScoreGauge score={78} />
                <TimeToLaunchTracker campaigns={campaigns} />
            </div>

            {/* 3. Main Split View: Chart & Active Ops */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Chart Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 surface-card p-8 relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="section-header__title">Financial Performance</h3>
                            <p className="section-header__subtitle">Revenue attribution vs. Spend velocity</p>
                        </div>
                        {/* Tech-luxe switcher */}
                        <div style={{ display: 'flex', background: 'var(--bd-bg-secondary)', borderRadius: 9999, padding: 3, border: '1px solid var(--bd-border-subtle)' }}>
                            {['7D', '30D', 'YTD'].map((period, i) => (
                                <button key={period} style={{ padding: '6px 16px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 150ms', background: i === 1 ? 'var(--bd-surface)' : 'transparent', color: i === 1 ? 'var(--bd-text-primary)' : 'var(--bd-text-muted)', boxShadow: i === 1 ? 'var(--bd-shadow-sm)' : 'none' }}>
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] w-full -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
                                <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={15} fontWeight={500} />
                                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} dx={-10} fontWeight={500} />
                                <Tooltip
                                    cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeOpacity: 0.1, strokeDasharray: '4 4' }}
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="spend"
                                    stroke="#fb7185"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSpend)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Live Operations Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="surface-card p-8 flex flex-col"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="section-header__title flex items-center gap-2">
                            <Zap style={{ width: 20, height: 20, color: 'var(--bd-warning)' }} />
                            Campaigns
                        </h3>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--bd-font-mono)', color: 'var(--bd-text-muted)' }}>{campaigns.length} TOTAL</span>
                    </div>


                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', color: 'var(--bd-text-muted)', padding: '40px 0' }}>Loading campaigns...</div>
                        ) : campaigns.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--bd-text-muted)', padding: '40px 0' }}>No campaigns found.</div>
                        ) : campaigns.map((campaign, idx) => (
                            <div key={campaign.id} className="group" style={{ padding: 'var(--bd-space-5)', borderRadius: 'var(--bd-radius-xl)', background: 'var(--bd-surface)', border: '1px solid var(--bd-border-subtle)', transition: 'all 180ms ease', cursor: 'pointer' }}>
                                <div className="flex justify-between items-start" style={{ marginBottom: 'var(--bd-space-4)' }}>
                                    <div onClick={() => window.location.href = `/brand/workspace/${campaign.id}`}>
                                        <h4 style={{ fontWeight: 700, color: 'var(--bd-text-primary)', fontSize: 'var(--bd-font-size-md)', marginBottom: 4, transition: 'color 150ms' }}>{campaign.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.6875rem', color: 'var(--bd-text-muted)', fontWeight: 500 }}>
                                            <span>{campaign.creators} Creators</span>
                                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--bd-border-default)' }} />
                                            <span>{campaign.budget ? `$${campaign.budget.min || 0} - $${campaign.budget.max || 0}` : '$0'}</span>
                                        </div>
                                    </div>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: campaign.status === 'Active' ? 'var(--bd-success)' : 'var(--bd-accent)' }} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--bd-space-4)', borderTop: '1px solid var(--bd-border-muted)' }}>
                                    <span className={`status-pill ${campaign.status === 'Active' ? 'status-pill--success' : 'status-pill--neutral'}`}>
                                        {campaign.status}
                                    </span>

                                    {['Draft', 'Pending Payment', 'Active'].includes(campaign.status) ? (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const { url } = await paymentService.initiateCampaignPayment(campaign.id);
                                                    if (url) window.location.href = url;
                                                } catch (err) {
                                                    alert("Funding failed to initialize");
                                                }
                                            }}
                                            className="status-pill status-pill--success"
                                            style={{ cursor: 'pointer', border: '1px solid var(--bd-success-border)', transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: 4 }}
                                        >
                                            Fund Escrow
                                            <ArrowUpRight style={{ width: 12, height: 12 }} />
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bd-text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            View Details
                                            <ArrowUpRight style={{ width: 12, height: 12, color: 'var(--bd-text-muted)' }} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Action */}
                    <button style={{ marginTop: 'var(--bd-space-6)', width: '100%', padding: '16px 0', borderRadius: 'var(--bd-radius-xl)', border: '1px dashed var(--bd-border-default)', background: 'transparent', color: 'var(--bd-text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 150ms' }}>
                        Initialize New Workflow
                    </button>
                </motion.div>
            </div>

            {/* Smart Alerts Toast System */}
            <SmartAlerts campaigns={campaigns.map(c => ({ ...c, budgetUsed: 85, roas: 6 }))} />

            {/* AI Campaign Builder Modal */}
            <AICampaignBuilder isOpen={showAIBuilder} onClose={() => setShowAIBuilder(false)} />
        </div>
    );
};


export default CMODashboard;
