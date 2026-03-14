import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Camera, FileText, Link2, ChevronRight, X } from 'lucide-react';

const ACTION_BUTTONS = [
    { id: 'social', label: 'Connect TikTok', icon: Link2, path: '/creator/social-accounts', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400' },
    { id: 'avatar', label: 'Upload Avatar', icon: Camera, path: '/creator/profile', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' },
    { id: 'bio', label: 'Add Bio', icon: FileText, path: '/creator/profile', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
];

const BannerSkeleton = () => (
    <div className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-2 w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
        </div>
    </div>
);

const CreatorStatusBanner = memo(({ profileCompletion, loading = false }) => {
    const [dismissed, setDismissed] = React.useState(false);

    if (loading) return <BannerSkeleton />;

    const { percentage = 0, tasks = [] } = profileCompletion || {};

    // Auto-hide when profile is > 80% complete or user dismissed
    if (percentage > 80 || dismissed) return null;

    const incompleteTasks = tasks.filter(t => !t.completed);
    const actionButtons = ACTION_BUTTONS.filter(a =>
        incompleteTasks.some(t => t.id === a.id || (a.id === 'social' && t.id === 'social'))
    );

    // If no relevant actions, show a generic message
    const message = percentage < 30
        ? 'Complete your profile to unlock more campaigns'
        : percentage < 60
            ? 'You\'re making progress — finish setting up to get matched'
            : 'Almost there! A few more steps to maximize your earnings';

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative rounded-[14px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/10"
            role="banner"
            aria-label={`Profile completion: ${percentage}%`}
        >
            <div className="relative rounded-[13px] bg-white dark:bg-slate-900 p-5">
                {/* Dismiss button */}
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                    aria-label="Dismiss banner"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Icon + Progress */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {message}
                                </p>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full shrink-0">
                                    {percentage}%
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-sm">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    {actionButtons.length > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                            {actionButtons.slice(0, 2).map(action => (
                                <Link
                                    key={action.id}
                                    to={action.path}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:shadow-sm ${action.color}`}
                                >
                                    <action.icon className="w-3.5 h-3.5" />
                                    {action.label}
                                    <ChevronRight className="w-3 h-3 opacity-50" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

CreatorStatusBanner.displayName = 'CreatorStatusBanner';
export default CreatorStatusBanner;
