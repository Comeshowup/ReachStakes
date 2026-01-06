import React from "react";
import { motion } from "framer-motion";
import { STATS_DATA } from "../data";
import LiveTicker from "../components/LiveTicker";
import GlobalROIHeatmap from "../components/GlobalROIHeatmap";

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

const DashboardHome = () => {
    return (
        <div className="space-y-6">
            {/* War Room: Live Ticker */}
            <div className="-mx-6 -mt-6 mb-6 rounded-t-xl overflow-hidden">
                <LiveTicker />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Command Center
                        <span className="text-xs px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-500 bg-indigo-500/10 font-mono">LIVE</span>
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Real-time performance across all active vectors.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 dark:shadow-none font-mono text-sm">
                    Generate Report_v2.pdf
                </button>
            </div>

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
        </div>
    );
};

export default DashboardHome;
