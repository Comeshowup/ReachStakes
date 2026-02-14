import React, { useMemo } from 'react';

/**
 * MetricValue — Renders a formatted financial value.
 * Uses Intl.NumberFormat for currency, multiplier for ROAS.
 * Tabular-nums via CSS class .fi-value
 */

const SIZE_CLASS = {
    lg: 'fi-value--lg',
    md: 'fi-value--md',
    sm: 'fi-value--sm',
};

/** @type {Intl.NumberFormat} */
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const MetricValue = React.memo(function MetricValue({
    value,
    format = 'currency', // 'currency' | 'multiplier'
    size = 'lg',
    ariaLabel,
    className = '',
}) {
    const formattedValue = useMemo(() => {
        if (value == null || isNaN(value)) return '$0';

        if (format === 'multiplier') {
            return `${Number(value).toFixed(1)}x`;
        }

        return currencyFormatter.format(value);
    }, [value, format]);

    return (
        <div
            className={`fi-value ${SIZE_CLASS[size] || SIZE_CLASS.lg} ${className}`}
            aria-label={ariaLabel || `${formattedValue}`}
            role="text"
        >
            {formattedValue}
        </div>
    );
});

export default MetricValue;
