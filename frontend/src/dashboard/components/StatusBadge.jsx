import React from "react";

/**
 * StatusBadge — Standardized status pill system.
 * Variants: success (green), warning (orange), danger (red), neutral (gray), info (blue), purple.
 * Fully rounded, small semibold text, consistent padding, no glow/shadow.
 */

// Map each status to a semantic pill variant
const STATUS_TO_VARIANT = {
    // Success (green)
    active: "success",
    approved: "success",
    paid: "success",
    completed: "info",
    released: "success",
    settled: "success",
    funded: "success",

    // Warning (orange)
    pending: "warning",
    unpaid: "warning",
    paused: "warning",
    overdue: "warning",

    // Danger (red)
    cancelled: "danger",
    rejected: "danger",
    failed: "danger",

    // Info (blue)
    processing: "info",
    in_review: "purple",
    review: "purple",
    new: "purple",
    open: "info",

    // Neutral (gray)
    draft: "neutral",
    closed: "neutral",
};

const StatusBadge = ({ status, showDot = true, size = "sm", className = "" }) => {
    const normalizedStatus = status?.toLowerCase()?.replace(/\s+/g, "_") || "pending";
    const variant = STATUS_TO_VARIANT[normalizedStatus] || "neutral";

    const sizeClasses = {
        xs: { pill: "text-[10px] px-1.5 py-0.5 gap-1", dot: "w-1 h-1" },
        sm: { pill: "text-[11px] px-2.5 py-0.5 gap-1.5", dot: "w-1.5 h-1.5" },
        md: { pill: "text-xs px-3 py-1 gap-1.5", dot: "w-1.5 h-1.5" },
        lg: { pill: "text-sm px-3.5 py-1.5 gap-2", dot: "w-2 h-2" },
    };

    const s = sizeClasses[size] || sizeClasses.sm;

    return (
        <span
            className={`status-pill status-pill--${variant} ${s.pill} ${className}`}
        >
            {showDot && (
                <span className={`status-pill__dot ${s.dot} rounded-full ${normalizedStatus === 'processing' ? 'animate-pulse' : ''}`} />
            )}
            <span className="capitalize leading-none">{status?.replace(/_/g, " ") || "Pending"}</span>
        </span>
    );
};

export default StatusBadge;
