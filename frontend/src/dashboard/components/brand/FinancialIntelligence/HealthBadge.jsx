import React from 'react';

/**
 * HealthBadge — Dynamic status pill (Healthy / Warning / Critical).
 * Includes a coloured dot + text label for non-colour-only indication.
 */

const STATUS_MAP = {
    healthy: 'fi-health--healthy',
    Healthy: 'fi-health--healthy',
    warning: 'fi-health--warning',
    Warning: 'fi-health--warning',
    critical: 'fi-health--critical',
    Critical: 'fi-health--critical',
};

const HealthBadge = React.memo(function HealthBadge({ status = 'Healthy' }) {
    const statusClass = STATUS_MAP[status] || STATUS_MAP.Healthy;
    const displayLabel = typeof status === 'string'
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : 'Healthy';

    return (
        <span
            className={`fi-health ${statusClass}`}
            role="status"
            aria-label={`Health status: ${displayLabel}`}
        >
            <span className="fi-health__dot" aria-hidden="true" />
            {displayLabel}
        </span>
    );
});

export default HealthBadge;
