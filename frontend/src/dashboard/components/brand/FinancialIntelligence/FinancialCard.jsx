import React from 'react';

/**
 * FinancialCard — Reusable card wrapper for the Financial Intelligence section.
 * Uses fi-card CSS class. Supports optional click handler and aria-label.
 */
const FinancialCard = React.memo(function FinancialCard({
    children,
    className = '',
    onClick,
    ariaLabel,
    role,
}) {
    const isClickable = typeof onClick === 'function';

    const handleKeyDown = (e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(e);
        }
    };

    return (
        <div
            className={`fi-card ${isClickable ? 'fi-card--clickable' : ''} ${className}`}
            onClick={isClickable ? onClick : undefined}
            onKeyDown={isClickable ? handleKeyDown : undefined}
            tabIndex={isClickable ? 0 : undefined}
            role={role || (isClickable ? 'button' : undefined)}
            aria-label={ariaLabel}
        >
            {children}
        </div>
    );
});

export default FinancialCard;
