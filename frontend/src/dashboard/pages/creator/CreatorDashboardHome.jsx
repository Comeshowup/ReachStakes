import React, { useEffect, useState } from "react";
import { ArrowUpRight, ChevronRight, PlayCircle, Clock, CheckCircle, AlertCircle, FileText, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { CREATOR_STATS, AVAILABLE_CAMPAIGNS } from "../../data";
import CampaignCalendar from "../../components/CampaignCalendar";
import CountingNumber from "../../components/CountingNumber";
import CampaignDrawer from "../../components/CampaignDrawer";


// CountUp moved to centralized CountingNumber component

const CreatorDashboardHome = () => {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    if (!CREATOR_STATS) return <div className="p-8 text-center bg-slate-950 min-h-screen text-slate-500">Loading stats...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back, Alex! 👋</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1">Here's what's happening with your campaigns today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {CREATOR_STATS.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color.replace("text-", "bg-").replace("500", "100")} dark:bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith("+") ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                <CountingNumber value={stat.value} prefix={stat.value.includes("$") ? "$" : ""} suffix={stat.value.includes("%") ? "%" : ""} />
                            </h3>
                        </div>
                    </motion.div>
                ))}
                {/* New Pending Earnings Card */}
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
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$1,250.00</h3>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Available after completion</p>
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
                        <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {AVAILABLE_CAMPAIGNS.slice(0, 3).map((campaign, index) => (
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
                                        <img src={campaign.logo} alt={campaign.brand} className="w-12 h-12 rounded-xl object-cover shadow-sm relative z-10" />
                                        <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 scale-110"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{campaign.title}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                                                DUE {campaign.deadline}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-500 truncate">{campaign.brand} • {campaign.platform}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="font-black text-white">{campaign.budget}</p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-slate-500 group-hover:text-indigo-400 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Deliverable Tracking */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                                            <FileText className="w-4 h-4 text-indigo-500" />
                                            <span className="font-medium">Next Deliverable: <span className="text-indigo-600 dark:text-indigo-400">Rough Cut</span></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                                            <AlertCircle className="w-3 h-3" />
                                            Due in 2 days
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Progress</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">In Progress</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Goal Progress & Tips */}
                <div className="space-y-8">
                    {/* Monthly Goal */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Monthly Goal</h3>
                            <p className="text-indigo-100 text-sm mb-6">You're 75% of the way there!</p>

                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold">$3,750</span>
                                <span className="text-indigo-200 mb-1">/ $5,000</span>
                            </div>

                            <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-white rounded-full" style={{ width: "75%" }}></div>
                            </div>

                            <p className="text-xs text-indigo-100 leading-relaxed">
                                Tip: Apply to 2 more campaigns this week to hit your target early.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Upload Deliverable</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Update Profile</span>
                            </button>
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
