import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, MapPin, ChevronRight, Instagram, Youtube, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * AudienceInsights Widget
 * 
 * Shows aggregated social stats from linked platforms.
 * Addresses creator pain point: performance analytics
 */

const PlatformBar = ({ platform, percentage, icon: Icon, color }) => (
    <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${color.bg}`}>
            <Icon className={`w-4 h-4 ${color.text}`} />
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{platform}</span>
                <span className="text-slate-500 dark:text-slate-400">{percentage}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color.bar}`}
                />
            </div>
        </div>
    </div>
);

const StatItem = ({ label, value, icon: Icon }) => (
    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
            <Icon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

export default function AudienceInsights({
    totalReach = 0,
    platformBreakdown = [],
    topLocation = null,
    topAge = null,
    isLinked = false
}) {
    const navigate = useNavigate();

    // Default platform data if none provided
    const platforms = platformBreakdown.length > 0 ? platformBreakdown : [
        { platform: 'Instagram', percentage: 62, icon: Instagram, color: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600', bar: 'bg-gradient-to-r from-pink-500 to-purple-500' } },
        { platform: 'TikTok', percentage: 28, icon: Sparkles, color: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600', bar: 'bg-gradient-to-r from-cyan-500 to-blue-500' } },
        { platform: 'YouTube', percentage: 10, icon: Youtube, color: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600', bar: 'bg-gradient-to-r from-red-500 to-orange-500' } },
    ];

    const formatReach = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    // If no social accounts linked, show CTA
    if (!isLinked && totalReach === 0) {
        return (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Audience Insights</h3>
                </div>

                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <LinkIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                        Link your social accounts
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">
                        See aggregated audience insights across platforms
                    </p>
                    <button
                        onClick={() => navigate('/creator/social-accounts')}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Connect Accounts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Audience Insights</h3>
                </div>
                <button
                    onClick={() => navigate('/creator/analytics')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                    Details <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Total Reach */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Reach</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {formatReach(totalReach || 45200)}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">+12%</span>
                    </div>
                </div>
            </div>

            {/* Platform Breakdown */}
            <div className="p-4 space-y-3">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Platform Distribution
                </p>
                {platforms.map((p, idx) => (
                    <PlatformBar key={idx} {...p} />
                ))}
            </div>

            {/* Demographics */}
            <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                    <StatItem
                        label="Top Location"
                        value={topLocation || "USA"}
                        icon={MapPin}
                    />
                    <StatItem
                        label="Top Age"
                        value={topAge || "18-24"}
                        icon={Users}
                    />
                </div>
            </div>
        </div>
    );
}
