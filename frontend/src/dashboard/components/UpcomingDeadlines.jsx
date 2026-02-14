import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * UpcomingDeadlines Widget
 * 
 * Shows upcoming campaign deadlines sorted by urgency.
 * Addresses creator pain point: workflow efficiency
 */

const getUrgencyLevel = (deadline) => {
    if (!deadline) return { level: 'none', label: 'No deadline', color: 'slate' };

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate - now) / (1000 * 60 * 60);
    const daysLeft = hoursLeft / 24;

    if (hoursLeft < 0) return { level: 'overdue', label: 'Overdue', color: 'red', daysLeft: 0 };
    if (hoursLeft < 24) return { level: 'urgent', label: 'Today', color: 'red', daysLeft: 0 };
    if (daysLeft < 3) return { level: 'soon', label: `${Math.ceil(daysLeft)} days`, color: 'orange', daysLeft: Math.ceil(daysLeft) };
    if (daysLeft < 7) return { level: 'upcoming', label: `${Math.ceil(daysLeft)} days`, color: 'yellow', daysLeft: Math.ceil(daysLeft) };
    return { level: 'normal', label: `${Math.ceil(daysLeft)} days`, color: 'slate', daysLeft: Math.ceil(daysLeft) };
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const UrgencyBadge = ({ urgency }) => {
    const colorClasses = {
        red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colorClasses[urgency.color]}`}>
            {urgency.label}
        </span>
    );
};

const DeadlineItem = ({ campaign, onClick }) => {
    const urgency = getUrgencyLevel(campaign.deadline);
    const isUrgent = urgency.level === 'urgent' || urgency.level === 'overdue';

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                ${isUrgent
                    ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
        >
            {/* Icon */}
            <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-white dark:bg-slate-700'}`}>
                {isUrgent ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                    <FileText className="w-4 h-4 text-indigo-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isUrgent ? 'text-red-900 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>
                    {campaign.title || 'Campaign'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {campaign.brandName || 'Brand'} • {campaign.deliverableType || 'Content'}
                </p>
            </div>

            {/* Urgency Badge */}
            <UrgencyBadge urgency={urgency} />

            {/* Date */}
            <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 dark:text-slate-500">Due</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(campaign.deadline)}
                </p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </motion.div>
    );
};

export default function UpcomingDeadlines({ campaigns = [], maxItems = 5 }) {
    const navigate = useNavigate();

    // Filter campaigns with deadlines and sort by urgency
    const upcomingDeadlines = campaigns
        .filter(c => c.deadline && (c.status === 'In_Progress' || c.status === 'Invited'))
        .map(c => ({ ...c, urgency: getUrgencyLevel(c.deadline) }))
        .sort((a, b) => {
            // Sort by urgency level first
            const urgencyOrder = { overdue: 0, urgent: 1, soon: 2, upcoming: 3, normal: 4, none: 5 };
            return urgencyOrder[a.urgency.level] - urgencyOrder[b.urgency.level];
        })
        .slice(0, maxItems);

    const urgentCount = upcomingDeadlines.filter(c =>
        c.urgency.level === 'urgent' || c.urgency.level === 'overdue'
    ).length;

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h3>
                    {urgentCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                            {urgentCount} urgent
                        </span>
                    )}
                </div>
                <button
                    onClick={() => navigate('/creator/calendar')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                    View All <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No upcoming deadlines</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                            Apply to campaigns to see deadlines here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {upcomingDeadlines.map((campaign, idx) => (
                            <DeadlineItem
                                key={campaign.id || idx}
                                campaign={campaign}
                                onClick={() => navigate(`/creator/campaign/${campaign.campaignId || campaign.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
