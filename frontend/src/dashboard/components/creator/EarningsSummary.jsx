import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Calendar, ArrowUpRight } from 'lucide-react';

const EarningSkeleton = () => (
    <div className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 animate-pulse h-full">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="space-y-5">
            <div className="space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="space-y-1.5">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
        </div>
    </div>
);

const formatCurrency = (val) => `$${Number(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const EarningsSummary = memo(({ earnings, loading = false }) => {
    if (loading) return <EarningSkeleton />;

    const { pending = 0, available = 0, nextPayoutDate = null } = earnings || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm p-5 h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Earnings</h3>
            </div>

            {/* Metrics */}
            <div className="flex-1 space-y-5">
                {/* Pending */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Pending Earnings</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(pending)}</p>
                </div>

                {/* Available */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Available Balance</p>
                    </div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(available)}</p>
                </div>

                {/* Next Payout */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Next Payout</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                        {formatDate(nextPayoutDate)}
                    </p>
                </div>
            </div>

            {/* CTA */}
            <Link
                to="/creator/earnings"
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
                View Earnings
                <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
        </motion.div>
    );
});

EarningsSummary.displayName = 'EarningsSummary';
export default EarningsSummary;
