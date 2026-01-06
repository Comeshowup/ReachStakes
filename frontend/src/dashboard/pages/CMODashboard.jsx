import React from 'react';
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
import {
    TrendingUp,
    DollarSign,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    ShieldCheck,
    Users
} from 'lucide-react';

// --- TECH-LUXE COMPONENT PRIMITIVES ---

// 1. KPI Card: "Big Bold Numbers" + Glass + Thin Borders
const KPICard = ({ title, value, change, trend, icon: Icon, color, delay }) => {
    // Subtle gradients, but mostly relying on darkness and thin borders
    const colors = {
        indigo: "text-indigo-400 border-indigo-500/10 hover:border-indigo-500/20 bg-indigo-500/[0.02]",
        emerald: "text-emerald-400 border-emerald-500/10 hover:border-emerald-500/20 bg-emerald-500/[0.02]",
        amber: "text-amber-400 border-amber-500/10 hover:border-amber-500/20 bg-amber-500/[0.02]",
        rose: "text-rose-400 border-rose-500/10 hover:border-rose-500/20 bg-rose-500/[0.02]",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`group relative overflow-hidden rounded-3xl border ${colors[color]} p-8 backdrop-blur-2xl transition-all duration-500`}
        >
            <div className="flex flex-col justify-between h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 font-mono">{title}</span>
                    <div className={`p-2 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className="w-4 h-4 text-white/70" />
                    </div>
                </div>

                {/* Big Bold Number */}
                <div className="mb-4">
                    <span className="text-[40px] font-bold text-white tracking-tighter block leading-none">
                        {value}
                    </span>
                </div>

                {/* Footer / Trend */}
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${trend === 'up' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                    </span>
                    <span className="text-xs text-white/30 font-medium">vs last month</span>
                </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[80px] opacity-20 ${color === 'indigo' ? 'bg-indigo-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'} pointer-events-none group-hover:opacity-30 transition-opacity duration-1000`} />
        </motion.div>
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

const CAMPAIGNS = [
    { id: 1, name: "Summer Reveal", status: "Live", creators: 12, budget: "$50k", roi: "4.2x", nextAction: "Verify Content" },
    { id: 2, name: "Back to School", status: "Scaling", creators: 8, budget: "$120k", roi: "3.8x", nextAction: "Approve Payouts" },
    { id: 3, name: "Tech Reviewers", status: "Vetting", creators: 25, budget: "$25k", roi: "-", nextAction: "Shortlist" },
];

const CMODashboard = () => {
    return (
        <div className="min-h-screen bg-[#09090B] text-slate-200 font-sans selection:bg-indigo-500/30 p-8 lg:p-12">

            {/* 1. Header Section: The "Cockpit" feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-500/80">System Operational</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        Executive Overview
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button className="h-10 px-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all">
                        Export Data
                    </button>
                    <button className="h-10 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all">
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

            {/* 3. Main Split View: Chart & Active Ops */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Chart Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 rounded-[32px] border border-white/5 bg-[#0e0e11] p-8 relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Financial Performance</h3>
                            <p className="text-sm text-slate-500">Revenue attribution vs. Spend velocity</p>
                        </div>
                        {/* Tech-luxe switcher */}
                        <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
                            {['7D', '30D', 'YTD'].map((period, i) => (
                                <button key={period} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${i === 1 ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
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
                    className="rounded-[32px] border border-white/5 bg-[#0e0e11] p-8 flex flex-col"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Active Ops
                        </h3>
                        <span className="text-xs font-mono text-slate-500">3 LIVE</span>
                    </div>


                    <div className="space-y-4 flex-1">
                        {CAMPAIGNS.map((campaign, idx) => (
                            <div key={campaign.id} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors">{campaign.name}</h4>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                            <span>{campaign.creators} Creators</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span>{campaign.budget}</span>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${campaign.status === 'Live' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-indigo-500'}`} />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Next Action</span>
                                    <span className="text-xs font-bold text-white flex items-center gap-1">
                                        {campaign.nextAction}
                                        <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Action */}
                    <button className="mt-6 w-full py-4 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white hover:border-white/20 transition-all">
                        Initialize New Workflow
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default CMODashboard;
