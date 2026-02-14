import React from 'react';

/**
 * StatusBadge — renders campaign status pill.
 * Uses bd-cm-badge class + token-driven variant styles.
 */

const STATUS_STYLES = {
    Draft: {
        background: 'var(--bd-muted)',
        color: 'var(--bd-muted-fg)',
        border: '1px solid var(--bd-border-default)',
    },
    Active: {
        background: 'var(--bd-success-muted)',
        color: 'var(--bd-success)',
        border: '1px solid var(--bd-success-border)',
    },
    Completed: {
        background: 'var(--bd-info-muted)',
        color: 'var(--bd-info)',
        border: '1px solid var(--bd-info-border)',
    },
    'Pending Payment': {
        background: 'var(--bd-warning-muted)',
        color: 'var(--bd-warning)',
        border: '1px solid var(--bd-warning-border)',
    },
};

const StatusBadge = ({ status, className = '' }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.Draft;

    return (
        <span className={`bd-cm-badge ${className}`} style={style}>
            {status ? status.toUpperCase() : 'DRAFT'}
        </span>
    );
};

export default StatusBadge;
