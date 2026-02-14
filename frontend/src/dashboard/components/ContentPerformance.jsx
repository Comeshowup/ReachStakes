import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Eye, Heart, MessageCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ContentPerformance Widget
 * 
 * Shows recent posts performance from linked socials.
 * Addresses creator pain point: understanding algorithm impact
 */

const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const TrendIndicator = ({ value, isPositive }) => (
    <div className={`flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{isPositive ? '+' : ''}{value}%</span>
    </div>
);

const MetricPill = ({ icon: Icon, value, label }) => (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>
    </div>
);

const TopPost = ({ post, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
    >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {post.thumbnail ? (
                <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
                <BarChart3 className="w-6 h-6 text-indigo-500" />
            )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.title || 'Recent Post'}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <MetricPill icon={Eye} value={formatNumber(post.views || 0)} />
                <MetricPill icon={Heart} value={formatNumber(post.likes || 0)} />
            </div>
        </div>

        {/* Engagement Rate */}
        <div className="text-right">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {post.engagementRate || '4.2'}%
            </p>
            <p className="text-xs text-slate-400">engagement</p>
        </div>

        <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500" />
    </motion.div>
);

export default function ContentPerformance({
    impressions = 12400,
    impressionsTrend = 23,
    engagements = 842,
    engagementsTrend = 12,
    topPosts = [],
    period = 'Last 7 days'
}) {
    const navigate = useNavigate();

    // Default posts if none provided
    const posts = topPosts.length > 0 ? topPosts : [
        { id: 1, title: 'Summer outfit haul 2024', views: 4200, likes: 312, engagementRate: 7.4 },
    ];

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Content Performance</h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {period}
                </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Impressions</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatNumber(impressions)}
                        </p>
                        <TrendIndicator value={impressionsTrend} isPositive={impressionsTrend > 0} />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Engagements</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatNumber(engagements)}
                        </p>
                        <TrendIndicator value={engagementsTrend} isPositive={engagementsTrend > 0} />
                    </div>
                </div>
            </div>

            {/* Top Performing */}
            <div className="p-4 pt-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Best Performing
                </p>
                <div className="space-y-2">
                    {posts.slice(0, 1).map((post, idx) => (
                        <TopPost
                            key={post.id || idx}
                            post={post}
                            onClick={() => post.url && window.open(post.url, '_blank')}
                        />
                    ))}
                </div>
            </div>

            {/* View More */}
            <div className="px-4 pb-4">
                <button
                    onClick={() => navigate('/creator/analytics')}
                    className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center justify-center gap-1"
                >
                    View Full Analytics <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
