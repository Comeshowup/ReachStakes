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
import { TrendingUp, Calendar } from 'lucide-react';
import api from '../../../api/axios';

const RevenueChart = ({ campaignId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTimeline = async () => {
            if (!campaignId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/attribution/timeline/${campaignId}?days=${days}`);
                setData(res.data.data.timeline || []);
            } catch (err) {
                console.error('Failed to fetch timeline:', err);
                setError(err.response?.data?.error || 'Failed to load chart data');
            } finally {
                setLoading(false);
            }
        };

        fetchTimeline();
    }, [campaignId, days]);

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-72 bg-white/5 border border-white/10 rounded-2xl animate-pulse flex items-center justify-center"
            >
                <div className="flex items-center gap-3 text-slate-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500" />
                    Loading chart...
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-72 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center"
            >
                <div className="text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            </motion.div>
        );
    }

    if (data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-72 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-violet-400" />
                    </div>
                    <p className="text-slate-400">No data yet.</p>
                    <p className="text-slate-500 text-sm mt-1">
                        Revenue will appear here once creators drive traffic.
                    </p>
                </div>
            </motion.div>
        );
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatCurrency = (value) => `₹${(value || 0).toLocaleString()}`;

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-sm">
                    <p className="text-slate-300 text-sm font-medium mb-2">
                        {formatDate(label)}
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-violet-400 text-sm">Revenue</span>
                            <span className="text-white font-semibold">
                                {formatCurrency(payload[0]?.value)}
                            </span>
                        </div>
                        {payload[0]?.payload?.clicks > 0 && (
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-blue-400 text-sm">Clicks</span>
                                <span className="text-white">
                                    {payload[0]?.payload?.clicks?.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {payload[0]?.payload?.conversions > 0 && (
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-emerald-400 text-sm">Conversions</span>
                                <span className="text-white">
                                    {payload[0]?.payload?.conversions?.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Revenue Over Time</h3>
                    <p className="text-slate-400 text-sm mt-1">Daily attribution performance</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <select
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition cursor-pointer"
                    >
                        <option value={7} className="bg-slate-800">Last 7 days</option>
                        <option value={14} className="bg-slate-800">Last 14 days</option>
                        <option value={30} className="bg-slate-800">Last 30 days</option>
                        <option value={60} className="bg-slate-800">Last 60 days</option>
                    </select>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.06)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8B5CF6"
                            strokeWidth={2.5}
                            fill="url(#revenueGradient)"
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: '#8B5CF6',
                                stroke: '#1E1B4B',
                                strokeWidth: 2
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Summary */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-violet-500" />
                        <span className="text-slate-400">Revenue</span>
                    </div>
                </div>
                <div className="text-slate-500 text-xs">
                    Total: {formatCurrency(data.reduce((sum, d) => sum + (d.revenue || 0), 0))}
                </div>
            </div>
        </motion.div>
    );
};

export default RevenueChart;
