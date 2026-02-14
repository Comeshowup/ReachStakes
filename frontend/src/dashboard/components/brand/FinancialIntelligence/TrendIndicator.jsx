import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * TrendIndicator — Compact trend badge with directional arrow.
 * Positive = green with up-right arrow, negative = red with down-right arrow.
 */
const TrendIndicator = React.memo(function TrendIndicator({
    value,
    label,
    isPositive = true,
}) {
    const ArrowIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    const badgeClass = isPositive ? 'fi-trend__badge--positive' : 'fi-trend__badge--negative';

    return (
        <div
            className="fi-trend"
            role="status"
            aria-label={`Trend: ${isPositive ? 'up' : 'down'} ${value}${label ? `, ${label}` : ''}`}
        >
            <span className={`fi-trend__badge ${badgeClass}`}>
                <ArrowIcon className="fi-trend__icon" aria-hidden="true" />
                {value}
            </span>
            {label && <span className="fi-trend__label">{label}</span>}
        </div>
    );
});

export default TrendIndicator;
