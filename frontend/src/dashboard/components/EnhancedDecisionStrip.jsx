/**
 * Enhanced Decision Strip
 * Powered by Decision Engine for proactive alerts and insights
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    AlertTriangle,
    Zap,
    TrendingDown,
    TrendingUp,
    DollarSign,
    Users,
    ArrowRight,
    X,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { useEnhancedDecisionStrip, AlertSeverity, AlertType } from '../../data';

// Alert badge component
const AlertBadge = ({ alert, onClick }) => {
    const navigate = useNavigate();

    const getStyles = () => {
        switch (alert.severity) {
            case AlertSeverity.CRITICAL:
                return {
                    bg: 'bg-rose-500/10',
                    border: 'border-rose-500/20',
                    text: 'text-rose-400',
                    hover: 'hover:bg-rose-500/15'
                };
            case AlertSeverity.WARNING:
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    text: 'text-amber-400',
                    hover: 'hover:bg-amber-500/15'
                };
            case AlertSeverity.SUCCESS:
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    text: 'text-emerald-400',
                    hover: 'hover:bg-emerald-500/15'
                };
            default:
                return {
                    bg: 'bg-violet-500/10',
                    border: 'border-violet-500/20',
                    text: 'text-violet-400',
                    hover: 'hover:bg-violet-500/15'
                };
        }
    };

    const getIcon = () => {
        switch (alert.type) {
            case AlertType.PACING_OVERSPEND:
            case AlertType.PACING_UNDERSPEND:
                return Zap;
            case AlertType.BUDGET_LOW:
            case AlertType.BUDGET_DEPLETED:
                return DollarSign;
            case AlertType.ROI_DECLINING:
                return TrendingDown;
            case AlertType.ROI_IMPROVING:
                return TrendingUp;
            case AlertType.CAMPAIGN_AT_RISK:
                return AlertTriangle;
            case AlertType.CREATOR_INACTIVE:
                return Users;
            default:
                return Sparkles;
        }
    };

    const styles = getStyles();
    const Icon = getIcon();
    const isClickable = alert.campaignId != null;

    const handleClick = () => {
        if (onClick) onClick(alert);
        if (alert.campaignId) {
            navigate(`/brand/workspace/${alert.campaignId}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
                flex items-center gap-3 px-5 py-3 rounded-xl border
                ${styles.bg} ${styles.border} ${styles.hover}
                ${isClickable ? 'cursor-pointer hover:-translate-y-0.5' : ''}
                transition-all group
            `}
            onClick={isClickable ? handleClick : undefined}
        >
            <div className="relative">
                <Icon className={`w-5 h-5 ${styles.text}`} />
                {alert.severity === AlertSeverity.CRITICAL && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                )}
            </div>
            <div className="flex flex-col">
                <span className={`text-sm font-semibold ${styles.text}`}>
                    {alert.title}
                </span>
                {alert.message && (
                    <span className={`text-xs ${styles.text} opacity-70`}>
                        {alert.message}
                    </span>
                )}
            </div>
            {isClickable && (
                <ChevronRight className={`w-4 h-4 ${styles.text} opacity-50 group-hover:opacity-100 transition-opacity`} />
            )}
        </motion.div>
    );
};

// Pending approvals badge
const PendingApprovalsBadge = ({ count }) => {
    const navigate = useNavigate();

    if (count === 0) return null;

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/brand/approvals')}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all hover:-translate-y-0.5 group"
        >
            <div className="relative">
                <FileText className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-amber-400">
                {count} Pending Approval{count !== 1 ? 's' : ''}
            </span>
            <ArrowRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
        </motion.button>
    );
};

// Insight card component
const InsightCard = ({ insight }) => {
    const navigate = useNavigate();

    const getIcon = () => {
        switch (insight.type) {
            case 'success': return TrendingUp;
            case 'optimization': return Zap;
            case 'opportunity': return Sparkles;
            default: return FileText;
        }
    };

    const Icon = getIcon();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
        >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{insight.title}</p>
                <p className="text-xs text-white/50 truncate">{insight.message}</p>
            </div>
            {insight.action && (
                <button
                    onClick={() => navigate(insight.action.route)}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
                >
                    {insight.action.label}
                </button>
            )}
        </motion.div>
    );
};

/**
 * Enhanced Decision Strip Component
 * Shows critical alerts, warnings, and proactive insights
 */
const EnhancedDecisionStrip = ({ showInsights = false }) => {
    const {
        pendingCount,
        criticalCount,
        warningCount,
        alerts,
        insights,
        hasIssues,
        isLoading
    } = useEnhancedDecisionStrip();

    if (isLoading) {
        return (
            <div className="flex gap-3 mb-8">
                {[1, 2].map(i => (
                    <div key={i} className="h-12 w-48 rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    // No issues to show
    if (!hasIssues && insights.length === 0) {
        return null;
    }

    // Take top 3 critical/warning alerts
    const displayAlerts = alerts
        .filter(a => a.severity === AlertSeverity.CRITICAL || a.severity === AlertSeverity.WARNING)
        .slice(0, 3);

    return (
        <div className="mb-8 space-y-4">
            {/* Alert Strip */}
            <AnimatePresence>
                {(pendingCount > 0 || displayAlerts.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-3"
                    >
                        <PendingApprovalsBadge count={pendingCount} />
                        {displayAlerts.map(alert => (
                            <AlertBadge key={alert.id} alert={alert} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Insights Row (optional) */}
            {showInsights && insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {insights.slice(0, 3).map((insight, idx) => (
                        <InsightCard key={idx} insight={insight} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EnhancedDecisionStrip;
export { AlertBadge, PendingApprovalsBadge, InsightCard };
