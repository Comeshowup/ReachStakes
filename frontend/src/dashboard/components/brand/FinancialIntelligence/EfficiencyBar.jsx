import React from 'react';

/**
 * EfficiencyBar — ROAS efficiency bar with gradient track, indicator dot,
 * and Poor→Elite quartile labels.
 * Uses CSS transitions (no framer-motion). Score clamped 0–100.
 */
const EfficiencyBar = React.memo(function EfficiencyBar({
    score = 0,
    label = 'Campaign efficiency',
}) {
    const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));

    return (
        <div className="fi-efficiency" aria-label={`Efficiency: ${clampedScore}%`}>
            <div className="fi-efficiency__header">
                <span className="fi-efficiency__label">{label}</span>
                <span className="fi-efficiency__quartile">Top Quartile</span>
            </div>
            <div
                className="fi-efficiency__track"
                role="meter"
                aria-valuenow={clampedScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Efficiency score: ${clampedScore}%`}
            >
                {/* Subtle background gradient */}
                <div className="fi-efficiency__gradient" aria-hidden="true" />

                {/* Fill bar up to indicator */}
                <div
                    className="fi-efficiency__fill"
                    style={{ width: `${clampedScore}%` }}
                />

                {/* Marker dot */}
                <div
                    className="fi-efficiency__indicator"
                    style={{ left: `${clampedScore}%` }}
                />
            </div>
            <div className="fi-efficiency__labels" aria-hidden="true">
                <span>Poor</span>
                <span>Elite</span>
            </div>
        </div>
    );
});

export default EfficiencyBar;
