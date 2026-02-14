import React from "react";

const statusConfig = {
    // Campaign statuses
    active: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    pending: {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
    },
    completed: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        dot: "bg-blue-500",
    },
    paused: {
        bg: "bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
        dot: "bg-gray-500",
    },
    cancelled: {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        dot: "bg-red-500",
    },
    draft: {
        bg: "bg-slate-500/10",
        text: "text-slate-600 dark:text-slate-400",
        dot: "bg-slate-500",
    },
    // Approval statuses
    approved: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    rejected: {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        dot: "bg-red-500",
    },
    "in_review": {
        bg: "bg-violet-500/10",
        text: "text-violet-600 dark:text-violet-400",
        dot: "bg-violet-500",
    },
    review: {
        bg: "bg-violet-500/10",
        text: "text-violet-600 dark:text-violet-400",
        dot: "bg-violet-500",
    },
    // Payment statuses
    paid: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    unpaid: {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
    },
    processing: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        dot: "bg-blue-500 animate-pulse",
    },
    // Generic
    new: {
        bg: "bg-violet-500/10",
        text: "text-violet-600 dark:text-violet-400",
        dot: "bg-violet-500",
    },
    open: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-600 dark:text-cyan-400",
        dot: "bg-cyan-500",
    },
    closed: {
        bg: "bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
        dot: "bg-gray-500",
    },
};

const StatusBadge = ({ status, showDot = true, size = "sm", className = "" }) => {
    const normalizedStatus = status?.toLowerCase()?.replace(/\s+/g, "_") || "pending";
    const config = statusConfig[normalizedStatus] || statusConfig.pending;

    const sizeClasses = {
        xs: "text-[10px] px-1.5 py-0.5",
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5",
    };

    const dotSizes = {
        xs: "w-1 h-1",
        sm: "w-1.5 h-1.5",
        md: "w-2 h-2",
        lg: "w-2.5 h-2.5",
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 font-medium rounded-full
                ${config.bg} ${config.text} ${sizeClasses[size]}
                ${className}
            `}
        >
            {showDot && (
                <span className={`${dotSizes[size]} rounded-full ${config.dot}`} />
            )}
            <span className="capitalize">{status?.replace(/_/g, " ") || "Pending"}</span>
        </span>
    );
};

export default StatusBadge;
