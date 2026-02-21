import React, { memo } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * VaultBalanceHeader — Massive balance display card with trend indicator.
 * Shows total vault balance, trend %, and last-updated timestamp.
 */
function VaultBalanceHeader({ totalBalance, trendPercent, lastUpdated, isLoading }) {
    if (isLoading) {
        return (
            <div className="vault-balance-card">
                <div className="vault-balance-card__inner">
                    <div className="vault-balance-card__left">
                        <div className="vault-skeleton vault-skeleton--label" />
                        <div className="vault-skeleton vault-skeleton--balance" />
                        <div className="vault-skeleton vault-skeleton--hint" />
                    </div>
                </div>
            </div>
        );
    }

    const isPositive = trendPercent >= 0;
    const trendClass = isPositive ? 'vault-trend--up' : 'vault-trend--down';

    const formatLastUpdated = () => {
        if (!lastUpdated) return 'Just now';
        const diff = (Date.now() - new Date(lastUpdated).getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return new Date(lastUpdated).toLocaleString();
    };

    return (
        <div className="vault-balance-card">
            <div className="vault-balance-card__inner">
                <div className="vault-balance-card__left">
                    <h2 className="vault-balance-card__label">Total Vault Balance</h2>
                    <div className="vault-balance-card__row">
                        <span className="vault-balance-card__amount">
                            {formatCurrency(totalBalance)}
                        </span>
                        <span className={`vault-trend ${trendClass}`}>
                            <span className="material-symbols-outlined vault-trend__icon">
                                {isPositive ? 'trending_up' : 'trending_down'}
                            </span>
                            {isPositive ? '+' : ''}{trendPercent}%
                        </span>
                    </div>
                    <p className="vault-balance-card__updated">Last updated: {formatLastUpdated()}</p>
                </div>
                <div className="vault-balance-card__icon-wrap">
                    <span className="material-symbols-outlined">account_balance</span>
                </div>
            </div>
        </div>
    );
}

export default memo(VaultBalanceHeader);
