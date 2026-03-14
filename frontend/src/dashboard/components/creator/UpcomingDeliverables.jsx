import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, FileText } from 'lucide-react';

const MOCK_DELIVERABLES = [
    { id: 'd1', title: 'Script Review', campaign: 'Nike Air Max', date: '2026-03-08', status: 'active' },
    { id: 'd2', title: 'Draft Submission', campaign: 'ReachStakes Promo', date: '2026-03-12', status: 'upcoming' },
    { id: 'd3', title: 'Final Video', campaign: 'Creative Cloud', date: '2026-03-18', status: 'upcoming' },
];

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDateUrgency = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'text-red-600 dark:text-red-400';
    if (diff <= 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-500 dark:text-slate-400';
};

const DeliverableSkeleton = () => (
    <div className="space-y-3 animate-pulse p-5">
        {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-0.5 w-4 bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1">
                    <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </div>
        ))}
    </div>
);

const UpcomingDeliverables = memo(({ deliverables = [], loading = false }) => {
    const items = deliverables.length > 0 ? deliverables : MOCK_DELIVERABLES;
    const isMock = deliverables.length === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Deliverables</h3>
                    {isMock && !loading && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Sample
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <DeliverableSkeleton />
            ) : items.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">No upcoming deliverables</p>
                </div>
            ) : (
                <div className="p-3">
                    {items.map((item, index) => {
                        const dateLabel = formatDate(item.date || item.dueDate);
                        const urgencyClass = getDateUrgency(item.date || item.dueDate);
                        const campaignName = item.campaign || item.campaignTitle || 'Campaign';
                        const title = item.title || item.step || 'Deliverable';

                        return (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <Link
                                    to="/creator/submissions"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group"
                                >
                                    {/* Date */}
                                    <div className={`text-xs font-bold w-12 shrink-0 text-right ${urgencyClass}`}>
                                        {dateLabel}
                                    </div>

                                    {/* Connector */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-purple-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
                                        {index < items.length - 1 && (
                                            <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mt-0.5" />
                                        )}
                                    </div>

                                    {/* Title + Campaign */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{campaignName}</p>
                                    </div>

                                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
});

UpcomingDeliverables.displayName = 'UpcomingDeliverables';
export default UpcomingDeliverables;
