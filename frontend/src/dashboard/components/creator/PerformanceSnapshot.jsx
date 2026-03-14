import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Eye, TrendingUp, ArrowUpRight, Link2 } from 'lucide-react';

const platformConfig = {
    tiktok: { name: 'TikTok', gradient: 'from-gray-900 to-gray-700', icon: '🎵' },
    youtube: { name: 'YouTube', gradient: 'from-red-600 to-red-500', icon: '▶️' },
    instagram: { name: 'Instagram', gradient: 'from-pink-500 via-purple-500 to-indigo-500', icon: '📸' },
    twitter: { name: 'X / Twitter', gradient: 'from-slate-900 to-slate-700', icon: '𝕏' },
};

const MOCK_PERFORMANCE = [
    { platform: 'tiktok', avgViews: '12.4K', engagement: 4.3 },
    { platform: 'youtube', avgViews: '8.1K', engagement: 5.2 },
];

const SkeletonCard = () => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 animate-pulse">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
);

const PerformanceSnapshot = memo(({ socialPerformance = [], loading = false }) => {
    const data = socialPerformance.length > 0 ? socialPerformance : MOCK_PERFORMANCE;
    const hasRealData = socialPerformance.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                        <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Performance Snapshot</h3>
                    {!hasRealData && !loading && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Sample
                        </span>
                    )}
                </div>
                <Link
                    to="/creator/reports"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                >
                    Open Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Content — horizontal card row */}
            <div className="p-4">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.map((item, index) => {
                            const config = platformConfig[item.platform] || platformConfig.tiktok;
                            const engNum = parseFloat(item.engagement) || 0;

                            return (
                                <motion.div
                                    key={item.platform}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 + index * 0.08 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-base shrink-0`}>
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{config.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                                                <Eye className="w-3 h-3" /> {item.avgViews}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                                                <TrendingUp className="w-3 h-3" /> {item.engagement}{typeof item.engagement === 'number' ? '%' : ''}
                                            </span>
                                        </div>
                                        {/* Mini bar */}
                                        <div className="h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                                            <motion.div
                                                className="h-full bg-indigo-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(engNum * 10, 100)}%` }}
                                                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Connect prompt (when no real data) */}
                        {!hasRealData && (
                            <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                                <Link
                                    to="/creator/social-accounts"
                                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                >
                                    <Link2 className="w-3.5 h-3.5" />
                                    Connect More Accounts
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

PerformanceSnapshot.displayName = 'PerformanceSnapshot';
export default PerformanceSnapshot;
