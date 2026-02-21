import React, { memo, useState, useMemo, useCallback } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';

const STATUS_CONFIG = {
    Locked: { bg: 'vault-status--amber', dot: true },
    Completed: { bg: 'vault-status--green', dot: true },
    'Release Pending': { bg: 'vault-status--blue', dot: true },
    Settled: { bg: 'vault-status--gray', icon: 'check_circle' },
    Pending: { bg: 'vault-status--blue', dot: true },
    Failed: { bg: 'vault-status--red', dot: true },
};

function getInitials(name) {
    if (!name) return '?';
    return name.split(/[\s_-]+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = [
    'vault-avatar--indigo',
    'vault-avatar--emerald',
    'vault-avatar--pink',
    'vault-avatar--orange',
    'vault-avatar--purple',
    'vault-avatar--teal',
];

function getAvatarColor(str) {
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * TransactionLedgerTable — Full production ledger with pagination, sort, search.
 */
function TransactionLedgerTable({
    transactions = [],
    pagination = {},
    isLoading,
    sortBy,
    sortOrder,
    search,
    onSortChange,
    onSearchChange,
    onPageChange,
}) {
    const isEmpty = !isLoading && transactions.length === 0;

    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, []);

    const formatAmount = useCallback((amount, type) => {
        const isCredit = type === 'Funding' || type === 'Adjustment' || amount > 0;
        const prefix = isCredit ? '+' : '-';
        const absAmount = Math.abs(amount);
        return { text: `${prefix}${formatCurrency(absAmount)}`, isCredit };
    }, []);

    const renderSortIcon = (column) => {
        if (sortBy !== column) return <span className="material-symbols-outlined vault-sort-icon">unfold_more</span>;
        return (
            <span className="material-symbols-outlined vault-sort-icon vault-sort-icon--active">
                {sortOrder === 'asc' ? 'expand_less' : 'expand_more'}
            </span>
        );
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            onSortChange?.(column, sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            onSortChange?.(column, 'desc');
        }
    };

    if (isLoading) {
        return (
            <div className="vault-ledger">
                <div className="vault-ledger__header">
                    <div className="vault-skeleton vault-skeleton--label" style={{ width: 120 }} />
                    <div className="vault-skeleton vault-skeleton--label" style={{ width: 80 }} />
                </div>
                <div className="vault-ledger__body">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="vault-ledger__skeleton-row">
                            <div className="vault-skeleton vault-skeleton--cell" />
                            <div className="vault-skeleton vault-skeleton--cell" />
                            <div className="vault-skeleton vault-skeleton--cell" />
                            <div className="vault-skeleton vault-skeleton--cell" />
                            <div className="vault-skeleton vault-skeleton--cell" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="vault-ledger">
            <div className="vault-ledger__header">
                <h3 className="vault-ledger__title">Recent Activity</h3>
                <div className="vault-ledger__controls">
                    <div className="vault-ledger__search">
                        <span className="material-symbols-outlined vault-ledger__search-icon">search</span>
                        <input
                            type="text"
                            className="vault-ledger__search-input"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            aria-label="Search transactions"
                        />
                    </div>
                </div>
            </div>

            {isEmpty ? (
                <div className="vault-ledger__empty">
                    <span className="material-symbols-outlined vault-ledger__empty-icon">receipt_long</span>
                    <p className="vault-ledger__empty-title">No transactions yet</p>
                    <p className="vault-ledger__empty-text">Fund your vault to see activity here.</p>
                </div>
            ) : (
                <>
                    <div className="vault-ledger__table-wrap">
                        <table className="vault-ledger__table">
                            <thead>
                                <tr>
                                    <th className="vault-ledger__th">Transaction ID</th>
                                    <th
                                        className="vault-ledger__th vault-ledger__th--sortable"
                                        onClick={() => handleSort('date')}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Sort by date"
                                    >
                                        Date {renderSortIcon('date')}
                                    </th>
                                    <th className="vault-ledger__th">Counterparty</th>
                                    <th className="vault-ledger__th">Status</th>
                                    <th
                                        className="vault-ledger__th vault-ledger__th--sortable vault-ledger__th--right"
                                        onClick={() => handleSort('amount')}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Sort by amount"
                                    >
                                        Amount {renderSortIcon('amount')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => {
                                    const { text: amountText, isCredit } = formatAmount(tx.amount, tx.type);
                                    const status = STATUS_CONFIG[tx.status] || STATUS_CONFIG.Pending;
                                    const counterparty = tx.campaignName || 'Unknown';
                                    const initials = getInitials(counterparty);
                                    const avatarColor = getAvatarColor(counterparty);

                                    return (
                                        <tr key={tx.id} className="vault-ledger__row" tabIndex={0}>
                                            <td className="vault-ledger__td vault-ledger__td--id">
                                                #{tx.id?.toString().slice(-6) || tx.id}
                                            </td>
                                            <td className="vault-ledger__td">{formatDate(tx.date)}</td>
                                            <td className="vault-ledger__td">
                                                <div className="vault-ledger__counterparty">
                                                    <div className={`vault-avatar ${avatarColor}`}>{initials}</div>
                                                    <span className="vault-ledger__counterparty-name">{counterparty}</span>
                                                </div>
                                            </td>
                                            <td className="vault-ledger__td">
                                                <span className={`vault-status ${status.bg}`}>
                                                    {status.dot && <span className="vault-status__dot" />}
                                                    {status.icon && (
                                                        <span className="material-symbols-outlined vault-status__icon">{status.icon}</span>
                                                    )}
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`vault-ledger__td vault-ledger__td--amount ${isCredit ? 'vault-ledger__td--credit' : ''}`}>
                                                {amountText}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="vault-ledger__pagination">
                            <span className="vault-ledger__pagination-info">
                                Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
                            </span>
                            <div className="vault-ledger__pagination-controls">
                                <button
                                    className="vault-ledger__pagination-btn"
                                    disabled={pagination.page <= 1}
                                    onClick={() => onPageChange?.(pagination.page - 1)}
                                    aria-label="Previous page"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button
                                    className="vault-ledger__pagination-btn"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => onPageChange?.(pagination.page + 1)}
                                    aria-label="Next page"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default memo(TransactionLedgerTable);
