import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, Tag, Zap, Target } from 'lucide-react';

const MOCK_CAMPAIGNS = [
    { id: 'rec-1', title: 'Nike Air Max Launch', brandName: 'Nike', payout: 800, category: 'Sneakers', matchPercentage: 92, hot: true },
    { id: 'rec-2', title: 'Spotify Wrapped Campaign', brandName: 'Spotify', payout: 500, category: 'Music & Tech', matchPercentage: 87, hot: false },
    { id: 'rec-3', title: 'Glossier Summer Drop', brandName: 'Glossier', payout: 650, category: 'Beauty', matchPercentage: 81, hot: false },
];

const BRAND_GRADIENTS = [
    'from-indigo-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-pink-500 to-rose-500',
];

const getMatchColor = (pct) => {
    if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (pct >= 70) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800';
};

const CardSkeleton = () => (
    <div className="rounded-xl bg-gray-50 dark:bg-slate-800/50 p-4 animate-pulse space-y-3">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
        </div>
        <div className="flex justify-between">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
    </div>
);

const CampaignOpportunities = memo(({ campaigns = [], loading = false }) => {
    const displayCampaigns = campaigns.length > 0 ? campaigns : MOCK_CAMPAIGNS;
    const isMock = campaigns.length === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Opportunities</h3>
                    {isMock && !loading && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Sample
                        </span>
                    )}
                </div>
            </div>

            {/* Campaign cards */}
            <div className="p-4 space-y-3 flex-1">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    displayCampaigns.slice(0, 3).map((campaign, index) => {
                        const matchPct = campaign.matchPercentage ?? campaign.matchScore ?? 0;
                        const matchCls = getMatchColor(matchPct);

                        return (
                            <motion.div
                                key={campaign.id || index}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + index * 0.08 }}
                                className="rounded-xl bg-gray-50 dark:bg-slate-800/50 p-4 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
                            >
                                {/* Brand row */}
                                <div className="flex items-center gap-3 mb-3">
                                    {campaign.brandLogo ? (
                                        <img src={campaign.brandLogo} alt={campaign.brandName} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                    ) : (
                                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${BRAND_GRADIENTS[index % BRAND_GRADIENTS.length]} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                            {campaign.brandName?.[0] || '?'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {campaign.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{campaign.brandName}</p>
                                    </div>
                                    {campaign.hot && (
                                        <span className="flex items-center gap-0.5 text-[10px] font-black text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full shrink-0">
                                            <Zap className="w-2.5 h-2.5" /> Hot
                                        </span>
                                    )}
                                </div>

                                {/* Payout + Category + Match */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            ${campaign.payout?.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full">
                                            <Tag className="w-2.5 h-2.5" />
                                            {campaign.category}
                                        </span>
                                    </div>
                                    {matchPct > 0 && (
                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${matchCls}`}>
                                            <Target className="w-2.5 h-2.5" />
                                            Match {matchPct}%
                                        </span>
                                    )}
                                </div>

                                {/* Apply button */}
                                <Link
                                    to="/creator/explore"
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                                    aria-label={`Apply to ${campaign.title}`}
                                >
                                    Apply <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Footer link */}
            <div className="px-5 pb-4 pt-1">
                <Link
                    to="/creator/explore"
                    className="text-xs text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                    View All Campaigns →
                </Link>
            </div>
        </motion.div>
    );
});

CampaignOpportunities.displayName = 'CampaignOpportunities';
export default CampaignOpportunities;
