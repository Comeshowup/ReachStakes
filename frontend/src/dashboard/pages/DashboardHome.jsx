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
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-opacity-10 ${stat.color.replace('text-', 'bg-')} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400`}>
                    {stat.change}
                </span>
            </div>
            <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{stat.value}</div>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {isCreator ? "Creator Dashboard" : "Command Center"}
                        <span className="text-xs px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-500 bg-indigo-500/10 font-mono">LIVE</span>
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">
                        {isCreator
                            ? "Track your progress and discover new opportunities."
                            : "Real-time performance across all active vectors."
                        }
                    </p>
                </div>
                {!isCreator && (
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 dark:shadow-none font-mono text-sm">
                        Generate Report_v2.pdf
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STATS_DATA.map((stat, index) => (
                            <StatCard key={index} stat={stat} index={index} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Global ROI Heatmap</h2>
                                    <p className="text-xs text-slate-500">Activity intensity based on daily revenue generation</p>
                                </div>
                                <select className="bg-gray-50 dark:bg-slate-800 border-none text-sm font-medium text-gray-600 dark:text-slate-300 rounded-lg px-3 py-1 focus:ring-0">
                                    <option>Last 365 Days</option>
                                    <option>YTD</option>
                                </select>
                            </div>

                            <div className="w-full overflow-hidden">
                                <GlobalROIHeatmap />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden flex flex-col justify-between border border-indigo-500/30">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-xl font-bold mb-2 font-mono">ENTERPRISE TIER</h2>
                                <ul className="space-y-3 my-6 text-sm text-indigo-200">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        Whitelisting Automation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        Rights Management
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        Creative Studio Access
                                    </li>
                                </ul>
                            </div>
                            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                View Active Plans
                            </button>

                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 opacity-10 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardHome;
