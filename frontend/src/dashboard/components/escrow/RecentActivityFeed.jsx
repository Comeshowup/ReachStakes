import { motion } from 'framer-motion';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Activity,
    CheckCircle2,
    Clock,
    XCircle,
    BookOpen,
} from 'lucide-react';

/**
 * RecentActivityFeed — Ledger-quality transaction feed with type badges,
 * tabular numbers, clear timestamps, and smart empty state.
 */

const TYPE_CONFIG = {
    Funding: {
        icon: ArrowDownToLine,
        label: 'Funding',
        className: 'ev-feed__type--funding',
        amountClass: 'ev-feed__amt--positive',
        sign: '+',
    },
    Release: {
        icon: ArrowUpFromLine,
        label: 'Release',
        className: 'ev-feed__type--release',
        amountClass: 'ev-feed__amt--negative',
        sign: '−',
    },
    Adjustment: {
        icon: Activity,
        label: 'Adjustment',
        className: 'ev-feed__type--adjustment',
        amountClass: '',
        sign: '',
    },
};

const STATUS_ICONS = {
    Completed: { icon: CheckCircle2, className: 'ev-feed__status--ok' },
    Pending: { icon: Clock, className: 'ev-feed__status--pending' },
    Failed: { icon: XCircle, className: 'ev-feed__status--fail' },
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(v || 0);

const RecentActivityFeed = ({ transactions, loading, onViewAll }) => {
    if (loading) {
        return (
            <div className="ev-section ev-section--sidebar" aria-busy="true">
                <div className="ev-section__header">
                    <h2 className="ev-section__title">Recent Activity</h2>
                </div>
                <div className="ev-feed__skeleton">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="ev-feed__skel-row">
                            <div className="bd-skeleton ev-skel--circle-sm" />
                            <div className="ev-feed__skel-body">
                                <div className="bd-skeleton ev-skel--line-md" />
                                <div className="bd-skeleton ev-skel--line-sm" />
                            </div>
                            <div className="bd-skeleton ev-skel--amt-sm" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const entries = transactions?.transactions || [];

    return (
        <div className="ev-section ev-section--sidebar">
            <div className="ev-section__header">
                <h2 className="ev-section__title">Escrow Ledger</h2>
                {entries.length > 0 && (
                    <button className="ev-section__link" onClick={onViewAll}>
                        <BookOpen size={13} />
                        View Full Ledger
                    </button>
                )}
            </div>

            {entries.length === 0 ? (
                <div className="ev-empty-state ev-empty-state--compact">
                    <Activity size={24} className="ev-empty-state__icon" />
                    <p className="ev-empty-state__text">No transactions yet</p>
                    <span className="ev-empty-state__sub">Fund a campaign to see activity here.</span>
                </div>
            ) : (
                <div className="ev-feed__list" role="list">
                    {entries.map((entry, index) => {
                        const typeConf = TYPE_CONFIG[entry.type] || TYPE_CONFIG.Adjustment;
                        const statusConf = STATUS_ICONS[entry.status] || STATUS_ICONS.Completed;
                        const TypeIcon = typeConf.icon;
                        const StatusIcon = statusConf.icon;

                        return (
                            <motion.div
                                key={entry.id || index}
                                className="ev-feed__item"
                                role="listitem"
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.2 }}
                            >
                                {/* Icon circle */}
                                <div className={`ev-feed__icon ${typeConf.className}`}>
                                    <TypeIcon size={15} strokeWidth={2} />
                                </div>

                                {/* Description */}
                                <div className="ev-feed__body">
                                    <div className="ev-feed__top-row">
                                        <span className="ev-feed__campaign">{entry.campaignName}</span>
                                        <span className={`ev-feed__type-badge ${typeConf.className}`}>
                                            {typeConf.label}
                                        </span>
                                    </div>
                                    <div className="ev-feed__bottom-row">
                                        <span className="ev-feed__date">{formatDate(entry.date)}</span>
                                        <span className={`ev-feed__status ${statusConf.className}`}>
                                            <StatusIcon size={11} />
                                            {entry.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className={`ev-feed__amount ${typeConf.amountClass}`}>
                                    {typeConf.sign}{formatCurrency(entry.amount)}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecentActivityFeed;
