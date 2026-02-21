import React, { useState, useCallback, useMemo } from 'react';
import ErrorBoundary from '../../../components/ErrorBoundary';
import {
    useVaultSummary,
    useVaultTransactions,
    useSystemStatus,
    useDepositFunds,
    useWithdrawFunds,
    useAllocateCampaign,
} from '../../../hooks/useVaultData';

// Components
import VaultBalanceHeader from './VaultBalanceHeader';
import LiquidityBreakdown from './LiquidityBreakdown';
import TransactionLedgerTable from './TransactionLedgerTable';
import VaultActionsPanel from './VaultActionsPanel';
import CapitalDistributionChart from './CapitalDistributionChart';
import SystemStatusBadge from './SystemStatusBadge';
import StatementAlertCard from './StatementAlertCard';

// Modals
import AddFundsModal from './AddFundsModal';
import WithdrawModal from './WithdrawModal';
import AllocateCampaignModal from './AllocateCampaignModal';

import '../../../styles/vault-overview.css';

/**
 * VaultPage — Main Vault Overview page.
 * Assembles all vault components with React Query data.
 */
export default function VaultPage() {
    // ─── Data hooks ─────────────────────────────────
    const { data: summary, isLoading: summaryLoading, error: summaryError } = useVaultSummary();
    const { data: systemStatus, isLoading: statusLoading } = useSystemStatus();

    // ─── Transaction state ──────────────────────────
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [search, setSearch] = useState('');
    const [searchDebounced, setSearchDebounced] = useState('');

    // Debounce search
    const searchTimerRef = React.useRef(null);
    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setSearchDebounced(value);
            setPage(1);
        }, 300);
    }, []);

    const {
        data: txData,
        isLoading: txLoading,
    } = useVaultTransactions(page, 10, { sortBy, sortOrder, search: searchDebounced });

    // ─── Mutations ──────────────────────────────────
    const depositMutation = useDepositFunds();
    const withdrawMutation = useWithdrawFunds();
    const allocateMutation = useAllocateCampaign();

    // ─── Modal state ────────────────────────────────
    const [modal, setModal] = useState(null); // 'add' | 'withdraw' | 'allocate' | null
    const [addFundsMinimum, setAddFundsMinimum] = useState(null);
    const [addFundsContext, setAddFundsContext] = useState(null);

    // Handler for insufficient funds redirect from allocation modal
    const handleInsufficientFunds = useCallback(({ minimumAmount, campaignName }) => {
        setAddFundsMinimum(minimumAmount);
        setAddFundsContext(campaignName);
        setModal('add');
    }, []);

    // Clear minimum when Add Funds modal closes
    const handleAddFundsClose = useCallback(() => {
        setModal(null);
        setAddFundsMinimum(null);
        setAddFundsContext(null);
    }, []);

    const handleSortChange = useCallback((col, order) => {
        setSortBy(col);
        setSortOrder(order);
        setPage(1);
    }, []);

    // ─── Error boundary fallback ────────────────────
    if (summaryError) {
        return (
            <div className="vault-page">
                <div className="vault-page__error">
                    <span className="material-symbols-outlined vault-page__error-icon">error</span>
                    <h2 className="vault-page__error-title">Unable to load vault data</h2>
                    <p className="vault-page__error-text">{summaryError.message || 'Something went wrong.'}</p>
                    <button className="vault-page__error-btn" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="vault-page">
            {/* Page Header */}
            <div className="vault-page__header">
                <div className="vault-page__header-left">
                    <div className="vault-breadcrumb">
                        <span>Dashboard</span>
                        <span className="material-symbols-outlined vault-breadcrumb__sep">chevron_right</span>
                        <span>Capital Intelligence</span>
                    </div>
                    <h1 className="vault-page__title">Vault Overview</h1>
                    <p className="vault-page__subtitle">Real-time escrow vault overview and liquidity management.</p>
                </div>
                <div className="vault-page__header-right">
                    <SystemStatusBadge
                        operational={systemStatus?.operational ?? true}
                        label={systemStatus?.label ?? 'System Operational'}
                        isLoading={statusLoading}
                    />
                    <span className="vault-escrow-badge">
                        <span className="material-symbols-outlined vault-escrow-badge__icon">shield</span>
                        Protected by ReachStakes Escrow
                    </span>
                    <button className="vault-export-btn">
                        <span className="material-symbols-outlined">download</span>
                        Export Report
                    </button>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="vault-grid">
                {/* ─── Main Column (8/12) ─── */}
                <div className="vault-grid__main">
                    <ErrorBoundary>
                        <VaultBalanceHeader
                            totalBalance={summary?.totalBalance ?? 0}
                            trendPercent={summary?.trendPercent ?? 0}
                            lastUpdated={summary?.lastUpdated}
                            isLoading={summaryLoading}
                        />
                        <LiquidityBreakdown
                            available={summary?.available ?? 0}
                            locked={summary?.locked ?? 0}
                            pending={summary?.pending ?? 0}
                            isLoading={summaryLoading}
                        />
                    </ErrorBoundary>

                    <ErrorBoundary>
                        <TransactionLedgerTable
                            transactions={txData?.transactions ?? []}
                            pagination={txData?.pagination ?? {}}
                            isLoading={txLoading}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            search={search}
                            onSortChange={handleSortChange}
                            onSearchChange={handleSearchChange}
                            onPageChange={setPage}
                        />
                    </ErrorBoundary>
                </div>

                {/* ─── Sidebar Column (4/12) ─── */}
                <div className="vault-grid__sidebar">
                    <ErrorBoundary>
                        <CapitalDistributionChart
                            available={summary?.available ?? 0}
                            locked={summary?.locked ?? 0}
                            pending={summary?.pending ?? 0}
                            isLoading={summaryLoading}
                        />
                    </ErrorBoundary>

                    <ErrorBoundary>
                        <VaultActionsPanel
                            onAddFunds={() => setModal('add')}
                            onWithdraw={() => setModal('withdraw')}
                            onAllocate={() => setModal('allocate')}
                        />
                    </ErrorBoundary>

                    <StatementAlertCard />
                </div>
            </div>

            {/* ─── Modals ─── */}
            <AddFundsModal
                isOpen={modal === 'add'}
                onClose={handleAddFundsClose}
                onSubmit={(data) => depositMutation.mutateAsync(data)}
                isSubmitting={depositMutation.isPending}
                minimumAmount={addFundsMinimum}
                fundingContext={addFundsContext}
            />
            <WithdrawModal
                isOpen={modal === 'withdraw'}
                onClose={() => setModal(null)}
                onSubmit={(data) => withdrawMutation.mutateAsync(data)}
                isSubmitting={withdrawMutation.isPending}
                availableBalance={summary?.available ?? 0}
            />
            <AllocateCampaignModal
                isOpen={modal === 'allocate'}
                onClose={() => setModal(null)}
                onSubmit={(data) => allocateMutation.mutateAsync(data)}
                isSubmitting={allocateMutation.isPending}
                availableBalance={summary?.available ?? 0}
                onInsufficientFunds={handleInsufficientFunds}
            />
        </div>
    );
}
