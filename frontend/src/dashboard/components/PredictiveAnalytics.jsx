import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import {
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Zap,
    RefreshCw,
    BarChart3
} from 'lucide-react';

// Mock projection data
const ROAS_PROJECTIONS = [
    { week: 'W1', actual: 2.1, projected: 2.0, upper: 2.5, lower: 1.5 },
    { week: 'W2', actual: 3.4, projected: 3.2, upper: 4.0, lower: 2.4 },
    { week: 'W3', actual: 4.8, projected: 4.5, upper: 5.5, lower: 3.5 },
    { week: 'W4', actual: null, projected: 6.2, upper: 7.5, lower: 4.9 },
    { week: 'W5', actual: null, projected: 7.8, upper: 9.5, lower: 6.1 },
    { week: 'W6', actual: null, projected: 9.1, upper: 11.0, lower: 7.2 },
];

const BUDGET_SUGGESTIONS = [
    {
        id: 1,
        type: 'reallocation',
        from: 'Creator A (Sarah)',
        to: 'Creator B (Mike)',
        amount: 2000,
        impact: '+15%',
        reason: 'Mike\'s engagement is 3x higher this week',
    },
    {
        id: 2,
        type: 'increase',
        platform: 'TikTok',
        amount: 5000,
        impact: '+22%',
        reason: 'TikTok engagement up 23% — capitalize on trend',
    },
];

const TREND_ALERTS = [
    { platform: 'TikTok', change: '+23%', trend: 'up', message: 'Engagement surge detected' },
    { platform: 'Instagram', change: '-5%', trend: 'down', message: 'Slight dip in reach' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0a0a0b] border border-white/10 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-white/50 mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
                        {entry.name}: {entry.value?.toFixed(1)}x
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const SuggestionCard = ({ suggestion, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
    >
        <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${suggestion.type === 'reallocation' ? 'bg-violet-500/20' : 'bg-emerald-500/20'}`}>
                {suggestion.type === 'reallocation'
                    ? <RefreshCw className="w-4 h-4 text-violet-400" />
                    : <TrendingUp className="w-4 h-4 text-emerald-400" />
                }
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                        {suggestion.type === 'reallocation'
                            ? `Reallocate $${suggestion.amount.toLocaleString()}`
                            : `Increase ${suggestion.platform} by $${suggestion.amount.toLocaleString()}`
                        }
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{suggestion.impact} lift</span>
                </div>
                <p className="text-xs text-white/50 mb-2">{suggestion.reason}</p>
                {suggestion.type === 'reallocation' && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{suggestion.from}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-emerald-400">{suggestion.to}</span>
                    </div>
                )}
            </div>
        </div>
        <button className="w-full mt-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            Apply Suggestion
        </button>
    </motion.div>
);

const TrendAlert = ({ alert, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`flex items-center gap-3 p-3 rounded-xl ${alert.trend === 'up' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'
            }`}
    >
        <Zap className={`w-4 h-4 ${alert.trend === 'up' ? 'text-emerald-400' : 'text-amber-400'}`} />
        <div className="flex-1">
            <p className="text-sm font-medium text-white">{alert.platform} {alert.change}</p>
            <p className="text-xs text-white/50">{alert.message}</p>
        </div>
    </motion.div>
);

const PredictiveAnalytics = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-brand-sky/20 to-violet-500/20">
                        <BarChart3 className="w-5 h-5 text-brand-sky" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Predictive Insights</h3>
                        <p className="text-xs text-white/50">AI-powered projections</p>
                    </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                </span>
            </div>

            {/* ROAS Projection Chart */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-white/50">ROAS Projection (6 weeks)</span>
                    <span className="text-xs text-brand-sky">Projected: 9.1x</span>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ROAS_PROJECTIONS}>
                            <defs>
                                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="week"
                                stroke="#52525b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#52525b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `${v}x`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="upper"
                                stroke="none"
                                fill="rgba(56, 189, 248, 0.1)"
                            />
                            <Area
                                type="monotone"
                                dataKey="lower"
                                stroke="none"
                                fill="#0e0e11"
                            />
                            <Line
                                type="monotone"
                                dataKey="projected"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                name="Projected"
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                                name="Actual"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-0.5 bg-emerald-500 rounded" />
                        <span className="text-white/50">Actual</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-0.5 bg-brand-sky rounded border-dashed" />
                        <span className="text-white/50">Projected</span>
                    </div>
                </div>
            </div>

            {/* Budget Suggestions */}
            <div className="mb-6">
                <h4 className="text-xs font-medium text-white/50 mb-3">Budget Optimization</h4>
                <div className="space-y-3">
                    {BUDGET_SUGGESTIONS.map((suggestion, i) => (
                        <SuggestionCard key={suggestion.id} suggestion={suggestion} delay={i * 0.1} />
                    ))}
                </div>
            </div>

            {/* Trend Alerts */}
            <div>
                <h4 className="text-xs font-medium text-white/50 mb-3">Platform Trends</h4>
                <div className="space-y-2">
                    {TREND_ALERTS.map((alert, i) => (
                        <TrendAlert key={i} alert={alert} delay={0.2 + i * 0.1} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default PredictiveAnalytics;
