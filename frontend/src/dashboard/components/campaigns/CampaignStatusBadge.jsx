import React from 'react';
import { PlayCircle, Clock, RotateCcw, CheckCircle, Users, AlertCircle } from 'lucide-react';

const STATUS_MAP = {
    In_Progress: {
        label: 'Active',
        bg: 'rgba(16, 185, 129, 0.1)',
        color: 'rgb(52, 211, 153)',
        border: 'rgba(16, 185, 129, 0.25)',
        icon: PlayCircle,
    },
    Applied: {
        label: 'Pending Review',
        bg: 'rgba(245, 158, 11, 0.1)',
        color: 'rgb(251, 191, 36)',
        border: 'rgba(245, 158, 11, 0.25)',
        icon: Clock,
    },
    Invited: {
        label: 'Invited',
        bg: 'rgba(139, 92, 246, 0.1)',
        color: 'rgb(167, 139, 250)',
        border: 'rgba(139, 92, 246, 0.25)',
        icon: Users,
    },
    Under_Review: {
        label: 'Under Review',
        bg: 'rgba(245, 158, 11, 0.1)',
        color: 'rgb(251, 191, 36)',
        border: 'rgba(245, 158, 11, 0.25)',
        icon: Clock,
    },
    Revision_Requested: {
        label: 'Revision',
        bg: 'rgba(168, 85, 247, 0.1)',
        color: 'rgb(192, 132, 252)',
        border: 'rgba(168, 85, 247, 0.25)',
        icon: RotateCcw,
    },
    Completed: {
        label: 'Completed',
        bg: 'rgba(100, 116, 139, 0.1)',
        color: 'rgb(148, 163, 184)',
        border: 'rgba(100, 116, 139, 0.25)',
        icon: CheckCircle,
    },
    Rejected: {
        label: 'Rejected',
        bg: 'rgba(239, 68, 68, 0.1)',
        color: 'rgb(248, 113, 113)',
        border: 'rgba(239, 68, 68, 0.25)',
        icon: AlertCircle,
    },
};

/**
 * Reusable campaign status badge.
 */
const CampaignStatusBadge = ({ status, size = 'sm' }) => {
    const config = STATUS_MAP[status] || STATUS_MAP.Applied;
    const Icon = config.icon;

    const sizeClasses = size === 'lg'
        ? 'px-3 py-1.5 text-xs gap-1.5'
        : 'px-2.5 py-1 text-[11px] gap-1';

    return (
        <span
            className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold tracking-wide`}
            style={{
                background: config.bg,
                color: config.color,
                border: `1px solid ${config.border}`,
            }}
        >
            <Icon className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
            {config.label}
        </span>
    );
};

export default CampaignStatusBadge;
