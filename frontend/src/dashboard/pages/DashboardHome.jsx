import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Briefcase, TrendingUp, Sparkles } from "lucide-react";
import { STATS_DATA } from "../data";
import LiveTicker from "../components/LiveTicker";
import GlobalROIHeatmap from "../components/GlobalROIHeatmap";
import CreatorProgressCard from "../components/CreatorProgressCard";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const StatCard = ({ stat, index }) => {
    const isPositiveChange = stat.change && !stat.change.startsWith('-');
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="kpi-card-polished group"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`kpi-card-polished__icon bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
            </div>
            <p className="kpi-card-polished__label">{stat.label}</p>
            <div className="flex items-end gap-2 mt-1">
                <span className="kpi-card-polished__value">{stat.value}</span>
                {stat.change && (
                    <span className={`kpi-card-polished__delta ${isPositiveChange ? 'kpi-card-polished__delta--up' : 'kpi-card-polished__delta--down'}`}>
                        {stat.change}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// Creator Stats for dashboard
const CREATOR_STATS = [
    { label: "Active Campaigns", value: "3", change: "+1", icon: Briefcase, color: "text-indigo-500" },
    { label: "Total Earnings", value: "$2,450", change: "+$350", icon: TrendingUp, color: "text-emerald-500" },
];

const DashboardHome = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [creatorProfile, setCreatorProfile] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        // Fetch creator profile for progress card
        if (storedUser?.role === 'creator') {
            const fetchProfile = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_BASE_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCreatorProfile(res.data.data?.creatorProfile || {});
                } catch (err) {
                    console.error("Failed to fetch creator profile", err);
                }
            };
            fetchProfile();
        }
    }, []);

    const isCreator = user?.role === 'creator';

    return (
        <div className="space-y-6">
            {/* War Room: Live Ticker */}
            <div className="-mx-6 -mt-6 mb-6 rounded-t-xl overflow-hidden">
                <LiveTicker />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        {isCreator ? "Creator Dashboard" : "Command Center"}
                        <span className="status-pill status-pill--success" style={{ fontSize: '0.625rem', padding: '2px 8px' }}>
                            <span className="status-pill__dot" style={{ animation: 'pulse 2s infinite' }} />
                            LIVE
                        </span>
                    </h1>
                    <p className="page-subtitle">
                        {isCreator
                            ? "Track your progress and discover new opportunities."
                            : "Real-time performance across all active campaigns."
                        }
                    </p>
                </div>
                {!isCreator && (
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: 'var(--bd-primary)',
                            color: 'var(--bd-primary-fg)',
                            boxShadow: 'var(--bd-shadow-primary-btn)',
                        }}
                    >
                        Export Report
                    </button>
                )}
            </div>

            {/* Creator Dashboard */}
            {isCreator ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Progress Card */}
                        <div className="lg:col-span-1">
                            <CreatorProgressCard
                                verificationTier={creatorProfile?.verificationTier || 'None'}
                                completedCampaigns={creatorProfile?.completedCampaigns || 0}
                                onTimeDeliveryRate={creatorProfile?.onTimeDeliveryRate || 0}
                                currentStreak={creatorProfile?.currentStreak || 0}
                                longestStreak={creatorProfile?.longestStreak || 0}
                            />
                        </div>

                        {/* Quick Stats */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {CREATOR_STATS.map((stat, index) => (
                                <StatCard key={index} stat={stat} index={index} />
                            ))}

                            {/* Find Campaigns CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => navigate('/dashboard/discovery')}
                                className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl cursor-pointer hover:shadow-xl transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Discover Campaigns
                                        </h3>
                                        <p className="text-indigo-200 text-sm mt-1">
                                            Find opportunities matched to your niche
                                        </p>
                                    </div>
                                    <div className="text-white/80 group-hover:translate-x-2 transition-transform">
                                        →
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            ) : (
                /* Brand Dashboard - Original Content */
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {STATS_DATA.map((stat, index) => (
                            <StatCard key={index} stat={stat} index={index} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 surface-card p-6 transition-colors">
                            <div className="section-header" style={{ marginBottom: 'var(--bd-space-5)' }}>
                                <div>
                                    <h2 className="section-header__title">Global ROI Heatmap</h2>
                                    <p className="section-header__subtitle">Activity intensity based on daily revenue generation</p>
                                </div>
                                <select
                                    className="text-sm font-medium rounded-lg px-3 py-1 focus:ring-0 border-none"
                                    style={{
                                        background: 'var(--bd-bg-secondary)',
                                        color: 'var(--bd-text-secondary)',
                                    }}
                                >
                                    <option>Last 365 Days</option>
                                    <option>YTD</option>
                                </select>
                            </div>

                            <div className="w-full overflow-hidden">
                                <GlobalROIHeatmap />
                            </div>
                        </div>

                        <div
                            className="rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
                            style={{
                                background: 'var(--bd-primary)',
                                color: 'var(--bd-primary-fg)',
                                border: '1px solid var(--bd-border-subtle)',
                            }}
                        >
                            <div className="relative z-10">
                                <p
                                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                                    style={{ opacity: 0.6 }}
                                >
                                    Current Plan
                                </p>
                                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--bd-font-display)' }}>Enterprise Tier</h2>
                                <ul className="space-y-3 mb-6 text-sm" style={{ opacity: 0.8 }}>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--bd-success)' }} />
                                        Whitelisting Automation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--bd-success)' }} />
                                        Rights Management
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--bd-success)' }} />
                                        Creative Studio Access
                                    </li>
                                </ul>
                            </div>
                            <button
                                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'inherit',
                                }}
                            >
                                View Active Plans
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardHome;
