import React, { memo } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * LiquidityBreakdown — 3-column grid showing Available, Locked, and Pending amounts.
 */
const METRICS = [
    {
        key: 'available',
        label: 'Available Liquidity',
        icon: null,
        dotColor: 'var(--bd-color-success)',
        bgClass: 'vault-metric--green',
        hint: 'Ready for deployment',
    },
    {
        key: 'locked',
        label: 'Locked in Escrow',
        icon: 'lock',
        dotColor: null,
        bgClass: 'vault-metric--amber',
        hint: 'Active campaigns',
    },
    {
        key: 'pending',
        label: 'Pending Release',
        icon: 'hourglass_empty',
        dotColor: null,
        bgClass: 'vault-metric--blue',
        hint: 'Awaiting approval',
    },
];

function LiquidityBreakdown({ available = 0, locked = 0, pending = 0, isLoading }) {
    const values = { available, locked, pending };

    if (isLoading) {
        return (
            <div className="vault-liquidity-grid">
                {METRICS.map((m) => (
                    <div key={m.key} className="vault-metric vault-metric--skeleton">
                        <div className="vault-skeleton vault-skeleton--label" />
                        <div className="vault-skeleton vault-skeleton--value" />
                        <div className="vault-skeleton vault-skeleton--hint" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="vault-liquidity-grid">
            {METRICS.map((m) => (
                <div key={m.key} className={`vault-metric ${m.bgClass}`}>
                    <div className="vault-metric__header">
                        {m.dotColor ? (
                            <span className="vault-metric__dot" style={{ backgroundColor: m.dotColor }} />
                        ) : (
                            <span className={`material-symbols-outlined vault-metric__icon vault-metric__icon--${m.key}`}>
                                {m.icon}
                            </span>
                        )}
                        <span className="vault-metric__label">{m.label}</span>
                    </div>
                    <p className="vault-metric__value">{formatCurrency(values[m.key])}</p>
                    <p className="vault-metric__hint">{m.hint}</p>
                </div>
            ))}
        </div>
    );
}

export default memo(LiquidityBreakdown);
