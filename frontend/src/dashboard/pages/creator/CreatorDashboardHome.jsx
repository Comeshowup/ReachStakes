import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
    ArrowUpRight, ChevronRight, PlayCircle, Clock, CheckCircle,
    AlertCircle, FileText, DollarSign, Briefcase, Users, Activity,
    Loader2, Target, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCalendar from "../../components/CampaignCalendar";
import CountingNumber from "../../components/CountingNumber";
import CampaignDrawer from "../../components/CampaignDrawer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Icon map for dynamic rendering from API
const iconMap = {
    Briefcase,
    Users,
    DollarSign,
    Activity
};

// Loading skeleton for stat cards
const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse">
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
);

// Quick Win Tasks Component
const QuickWinTasks = ({ tasks, onRefresh }) => {
    const navigate = useNavigate();
    const completedCount = Object.values(tasks || {}).filter(Boolean).length;
    const totalTasks = 3;
    const progress = (completedCount / totalTasks) * 100;
    const allComplete = completedCount === totalTasks;

    const taskList = [
        {
            id: "profileComplete",
            label: "Complete your profile",
            description: "Add avatar, tagline & about",
            path: "/creator/profile",
            icon: CheckCircle,
            completed: tasks?.profileComplete
        },
        {
            id: "firstApplied",
            label: "Apply to your first campaign",
            description: "Browse available opportunities",
            path: "/creator/explore",
            icon: Target,
            completed: tasks?.firstApplied
        },
        {
            id: "socialLinked",
            label: "Link a social account",
            description: "Connect YouTube, TikTok, or Instagram",
            path: "/creator/social-accounts",
            icon: Users,
            completed: tasks?.socialLinked
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Quick Wins</h3>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {completedCount}/{totalTasks} Complete
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <motion.div
                    className={`h-full rounded-full ${allComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                />
            </div>

            {allComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4 text-center"
                >
                    <span className="text-2xl mb-2">🎉</span>
                    <p className="text-green-700 dark:text-green-400 font-medium text-sm">
                        All tasks complete! You're ready to earn.
                    </p>
                </motion.div>
            )}

            <div className="space-y-2">
                {taskList.map((task, index) => (
                    <motion.button
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => navigate(task.path)}
                        disabled={task.completed}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group
                            ${task.completed
                                ? 'bg-green-50 dark:bg-green-900/10 cursor-default'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                            }`}
                    >
                        <div className={`p-2 rounded-lg transition-transform
                            ${task.completed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 group-hover:scale-110'
                            }`}
                        >
                            {task.completed ? <CheckCircle className="w-5 h-5" /> : <task.icon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-700 dark:text-slate-300'}`}>
                                {task.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
                                {task.description}
                            </p>
                        </div>
                        {!task.completed && (
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        )}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

const CreatorDashboardHome = () => {
    const navigate = useNavigate();
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeCampaigns, setActiveCampaigns] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchActiveCampaigns();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/users/me/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === "success") {
                setDashboardData(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveCampaigns = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-campaigns`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === "success") {
                // Filter for active campaigns only
                const active = response.data.data.filter(c =>
                    c.status === "In_Progress" || c.status === "Applied" || c.status === "Invited"
                );
                setActiveCampaigns(active.slice(0, 3));
            }
        } catch (err) {
            console.error("Failed to fetch campaigns:", err);
            // Silently fail - campaigns section will show empty state
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="animate-pulse">
                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-5 w-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
                <button
                    onClick={() => { setLoading(true); setError(null); fetchDashboardData(); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { stats = [], pendingEarnings = 0, quickWinTasks = {}, userName = "Creator", matchScore = 0 } = dashboardData || {};

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Welcome back, {userName?.split(' ')[0] || 'Creator'}! 👋
                </h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1">
                    Here's what's happening with your campaigns today.
                </p>
            </div>

            {/* Match Score Banner (if profile incomplete) */}
            {matchScore < 70 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium">Your Profile Match Score: {matchScore}%</p>
                            <p className="text-sm text-indigo-100">Complete your profile to unlock better campaign matches!</p>
                        </div>
                    </div>
                    <Link
                        to="/creator/profile"
                        className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors"
                    >
                        Complete Profile
                    </Link>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const IconComponent = iconMap[stat.icon] || Activity;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.color.replace("text-", "bg-").replace("500", "100")} dark:bg-opacity-10`}>
                                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith("+") || stat.change === "New!" || stat.change === "Great!" || stat.change === "In Progress"
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    <CountingNumber
                                        value={stat.value}
                                        prefix={stat.value.includes("$") ? "$" : ""}
                                        suffix={stat.value.includes("%") ? "%" : ""}
                                    />
                                </h3>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Pending Earnings Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <DollarSign className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                Pending
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Estimated Earnings</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                ${pendingEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                                Available after completion
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Live Content Calendar */}
            <CampaignCalendar />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Campaigns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Campaigns</h2>
                        <Link
                            to="/creator/submissions"
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                        >
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {activeCampaigns.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 text-center"
                        >
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Active Campaigns Yet</h3>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                                Start applying to campaigns to begin earning!
                            </p>
                            <Link
                                to="/creator/explore"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
                            >
                                Explore Campaigns <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {activeCampaigns.map((campaign, index) => (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    onClick={() => {
                                        setSelectedCampaign({
                                            ...campaign,
                                            brandColor: ["#6366f1", "#ec4899", "#ef4444"][index % 3]
                                        });
                                        setIsDrawerOpen(true);
                                    }}
                                    className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-indigo-500/30 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="relative">
                                            <img
                                                src={campaign.campaign?.brand?.brandProfile?.logoUrl || "/placeholder-brand.png"}
                                                alt={campaign.campaign?.title || "Campaign"}
                                                className="w-12 h-12 rounded-xl object-cover shadow-sm relative z-10"
                                            />
                                            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 scale-110"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                                    {campaign.campaign?.title || "Campaign"}
                                                </h3>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${campaign.status === "In_Progress"
                                                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                                    : campaign.status === "Applied"
                                                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                        : "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                                                    }`}>
                                                    {campaign.status?.replace("_", " ")}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-500 truncate">
                                                {campaign.campaign?.brand?.brandProfile?.companyName || "Brand"} • {campaign.campaign?.platformRequired || "Multiple Platforms"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {campaign.agreedPrice && (
                                                <div className="text-right hidden sm:block">
                                                    <p className="font-black text-white">${parseFloat(campaign.agreedPrice).toLocaleString()}</p>
                                                </div>
                                            )}
                                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-slate-500 group-hover:text-indigo-400 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Quick Win Tasks */}
                <div className="space-y-8">
                    <QuickWinTasks tasks={quickWinTasks} onRefresh={fetchDashboardData} />

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                to="/creator/submissions"
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group"
                            >
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Upload Deliverable</span>
                            </Link>
                            <Link
                                to="/creator/profile"
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group"
                            >
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Update Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <CampaignDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                campaign={selectedCampaign}
            />
        </div>
    );
};

export default CreatorDashboardHome;
