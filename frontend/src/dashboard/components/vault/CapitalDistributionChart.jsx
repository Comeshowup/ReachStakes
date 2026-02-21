import React, { memo, useMemo } from 'react';

/**
 * CapitalDistributionChart — CSS-only donut chart using conic-gradient.
 * Responsive, accessible, animated on load.
 */
function CapitalDistributionChart({ available = 0, locked = 0, pending = 0, isLoading }) {
    const { segments, isEmpty } = useMemo(() => {
        const total = available + locked + pending;
        if (total <= 0) return { segments: [], isEmpty: true };

        const availPct = Math.round((available / total) * 100);
        const lockedPct = Math.round((locked / total) * 100);
        const pendingPct = 100 - availPct - lockedPct;

        return {
            isEmpty: false,
            segments: [
                { label: 'Available', pct: availPct, color: 'var(--bd-vault-chart-available)' },
                { label: 'Locked Escrow', pct: lockedPct, color: 'var(--bd-vault-chart-locked)' },
                { label: 'Pending', pct: pendingPct, color: 'var(--bd-vault-chart-pending)' },
            ],
        };
    }, [available, locked, pending]);

    const conicGradient = useMemo(() => {
        if (isEmpty) return 'var(--bd-muted)';
        let acc = 0;
        const stops = segments.map((s) => {
            const start = acc;
            acc += s.pct;
            return `${s.color} ${start}% ${acc}%`;
        });
        return `conic-gradient(${stops.join(', ')})`;
    }, [segments, isEmpty]);

    if (isLoading) {
        return (
            <div className="vault-chart-card">
                <div className="vault-skeleton vault-skeleton--label" />
                <div className="vault-chart__donut-wrap">
                    <div className="vault-chart__donut vault-skeleton vault-skeleton--circle" />
                </div>
                <div className="vault-chart__legend">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="vault-skeleton vault-skeleton--legend-row" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="vault-chart-card">
            <h3 className="vault-chart-card__title">Capital Distribution</h3>
            <div className="vault-chart__donut-wrap" role="img" aria-label={`Capital distribution: ${segments.map(s => `${s.label} ${s.pct}%`).join(', ')}`}>
                <div
                    className="vault-chart__donut"
                    style={{ background: conicGradient }}
                />
                <div className="vault-chart__center">
                    <span className="vault-chart__center-label">Total</span>
                    <span className="vault-chart__center-value">{isEmpty ? '—' : '100%'}</span>
                </div>
            </div>
            {isEmpty ? (
                <p className="vault-chart__empty">No capital allocated yet</p>
            ) : (
                <div className="vault-chart__legend">
                    {segments.map((s) => (
                        <div key={s.label} className="vault-chart__legend-row">
                            <div className="vault-chart__legend-label">
                                <span className="vault-chart__legend-dot" style={{ backgroundColor: s.color }} />
                                <span>{s.label}</span>
                            </div>
                            <span className="vault-chart__legend-value">{s.pct}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default memo(CapitalDistributionChart);
