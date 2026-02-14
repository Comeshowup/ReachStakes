import React from 'react';

/**
 * EmptyState — Structured empty state for financial cards.
 * Renders icon, headline, subtitle, and optional CTA button.
 */
const EmptyState = React.memo(function EmptyState({
    icon: Icon,
    title = 'No data available',
    subtitle,
    ctaLabel,
    onCtaClick,
}) {
    return (
        <div className="fi-empty" role="status">
            {Icon && (
                <div className="fi-empty__icon-wrap" aria-hidden="true">
                    <Icon className="fi-empty__icon" />
                </div>
            )}
            <h3 className="fi-empty__title">{title}</h3>
            {subtitle && <p className="fi-empty__subtitle">{subtitle}</p>}
            {ctaLabel && onCtaClick && (
                <button
                    className="fi-empty__cta"
                    onClick={onCtaClick}
                    type="button"
                >
                    {ctaLabel}
                </button>
            )}
        </div>
    );
});

export default EmptyState;
