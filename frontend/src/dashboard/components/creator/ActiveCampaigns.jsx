import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Briefcase, ChevronRight, ArrowUpRight, Calendar,
    AlertCircle, Upload, Eye, Play
} from 'lucide-react';

const STATUS_CONFIG = {
    In_Progress: { label: 'In Progress', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    Applied: { label: 'Applied', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    Invited: { label: 'Invited', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    Approved: { label: 'Approved', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    Concept_Approval: { label: 'Concept Approval', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    Script_Review: { label: 'Script Review', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    Draft_Due: { label: 'Draft Due', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    Final_Edit: { label: 'Final Edit', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    Go_Live: { label: 'Go Live', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const getActionButton = (status) => {
    if (status === 'In_Progress') return { label: 'Upload Deliverable', icon: Upload };
    if (status === 'Approved') return { label: 'Continue Work', icon: Play };
    return { label: 'View Campaign', icon: Eye };
};

const getDeadlineUrgency = (deadlineStr) => {
    if (!deadlineStr) return null;
    const date = new Date(deadlineStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (diffDays <= 0) return { label: 'Overdue', cls: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400', urgent: true };
    if (diffDays <= 3) return { label, cls: 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400', urgent: true };
    if (diffDays <= 7) return { label, cls: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400', urgent: false };
    return { label, cls: 'text-gray-500 bg-gray-50 dark:bg-slate-800 dark:text-slate-400', urgent: false };
};

const RowSkeleton = () => (
    <div className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        </div>
        <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
        <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0 hidden sm:block" />
    </div>
);

const ActiveCampaigns = memo(({ campaigns = [], loading = false, onCampaignClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Campaigns</h3>
                    {campaigns.length > 0 && (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                            {campaigns.length}
                        </span>
                    )}
                </div>
                <Link
                    to="/creator/submissions"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Content */}
            {loading ? (
                <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
                    {[1, 2, 3].map(i => <RowSkeleton key={i} />)}
                </div>
            ) : campaigns.length === 0 ? (
                /* Empty State */
                <div className="p-10 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1.5">
                            No active campaigns yet
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
                            Start applying to earn. Creators earn $500–$3,000 per campaign.
                        </p>
                        <Link
                            to="/creator/explore"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                        >
                            Explore Campaigns <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            ) : (
                /* Campaign list */
                <div className="divide-y divide-gray-50 dark:divide-slate-800/50" role="list">
                    {campaigns.map((campaign, index) => {
                        const title = campaign.campaign?.title || 'Campaign';
                        const brand = campaign.campaign?.brand?.brandProfile?.companyName || 'Brand';
                        const logo = campaign.campaign?.brand?.brandProfile?.logoUrl;
                        const status = campaign.status || 'Applied';
                        const deadline = getDeadlineUrgency(campaign.deadline);
                        const earnings = campaign.agreedPrice
                            ? `$${parseFloat(campaign.agreedPrice).toLocaleString()}`
                            : null;
                        const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
                        const action = getActionButton(status);

                        return (
                            <motion.div
                                key={campaign.id}
                                role="listitem"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.06 }}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                                {/* Brand avatar */}
                                {logo ? (
                                    <img src={logo} alt={brand} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {brand[0]}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500 dark:text-slate-400">{brand}</span>
                                        {earnings && (
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{earnings}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Deadline */}
                                {deadline && (
                                    <span className={`hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${deadline.cls}`}>
                                        {deadline.label === 'Overdue'
                                            ? <AlertCircle className="w-2.5 h-2.5" />
                                            : <Calendar className="w-2.5 h-2.5" />
                                        }
                                        {deadline.label}
                                    </span>
                                )}

                                {/* Status badge */}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${statusCfg.cls}`}>
                                    {statusCfg.label}
                                </span>

                                {/* Action button */}
                                <button
                                    onClick={() => onCampaignClick?.(campaign, index)}
                                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shrink-0"
                                >
                                    <action.icon className="w-3 h-3" />
                                    {action.label}
                                </button>

                                {/* Mobile chevron */}
                                <button
                                    onClick={() => onCampaignClick?.(campaign, index)}
                                    className="md:hidden shrink-0"
                                    aria-label={`Open ${title}`}
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
});

ActiveCampaigns.displayName = 'ActiveCampaigns';
export default ActiveCampaigns;
