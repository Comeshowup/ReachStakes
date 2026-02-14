import React from 'react';

/**
 * LiquidityBar — Simple progress bar showing liquidity ratio.
 * Clamped 0–100 for safety. Uses CSS transitions for mount animation.
 */
const LiquidityBar = React.memo(function LiquidityBar({
    ratio = 0,
    label = 'Liquidity Ratio',
}) {
    const clampedRatio = Math.max(0, Math.min(100, Number(ratio) || 0));

    return (
        <div className="fi-liquidity" aria-label={`${label}: ${clampedRatio}% available`}>
            <div className="fi-liquidity__header">
                <span className="fi-liquidity__label">{label}</span>
                <span className="fi-liquidity__value">{clampedRatio}% available</span>
            </div>
            <div
                className="fi-liquidity__track"
                role="progressbar"
                aria-valuenow={clampedRatio}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${clampedRatio}%`}
            >
                <div
                    className="fi-liquidity__fill"
                    style={{ width: `${clampedRatio}%` }}
                />
            </div>
        </div>
    );
});

export default LiquidityBar;
