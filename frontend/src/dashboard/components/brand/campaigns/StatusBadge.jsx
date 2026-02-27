import React from 'react';

/**
 * StatusBadge — renders campaign status pill.
 * Uses standardized status-pill system with token-driven variant styles.
 */

const STATUS_TO_VARIANT = {
    Draft: 'neutral',
    Active: 'success',
    Completed: 'info',
    'Pending Payment': 'warning',
    Paused: 'warning',
    Cancelled: 'danger',
};

const StatusBadge = ({ status, className = '' }) => {
    const variant = STATUS_TO_VARIANT[status] || 'neutral';
    const label = status ? status.toUpperCase() : 'DRAFT';

    return (
        <span className={`status-pill status-pill--${variant} ${className}`} style={{ fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
            <span className="status-pill__dot" style={{ width: 5, height: 5 }} />
            {label}
        </span>
    );
};

export default StatusBadge;
