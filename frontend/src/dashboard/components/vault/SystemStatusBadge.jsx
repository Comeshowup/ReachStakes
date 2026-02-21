import React, { memo } from 'react';

/**
 * SystemStatusBadge — Lightweight system status indicator.
 */
function SystemStatusBadge({ operational = true, label = 'System Operational', isLoading }) {
    if (isLoading) return null;

    return (
        <div className={`vault-system-badge ${operational ? 'vault-system-badge--ok' : 'vault-system-badge--warn'}`}>
            <span className={`vault-system-badge__dot ${operational ? '' : 'vault-system-badge__dot--warn'}`} />
            <span className="vault-system-badge__label">{label}</span>
        </div>
    );
}

export default memo(SystemStatusBadge);
