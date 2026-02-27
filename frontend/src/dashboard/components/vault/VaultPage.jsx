import React, { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import ErrorBoundary from '../../../components/ErrorBoundary';
import {
    useVaultSummary,
    useVaultTransactions,
    useVaultCampaigns,
    useSystemStatus,
} from '../../../hooks/useVaultData';
import { verifyDeposit } from '../../../api/escrowService';
import { useQueryClient } from '@tanstack/react-query';

// Components
import VaultBalanceHeader from './VaultBalanceHeader';
import LiquidityBreakdown from './LiquidityBreakdown';
import TransactionLedgerTable from './TransactionLedgerTable';
import CapitalDistributionChart from './CapitalDistributionChart';
import SystemStatusBadge from './SystemStatusBadge';
import StatementAlertCard from './StatementAlertCard';
import CapitalDeploymentSection from './CapitalDeploymentSection';

// Modal
import VaultFundModal from './VaultFundModal';

import '../../../styles/vault-overview.css';

/**
 * VaultPage — Main Vault Overview page.
 * Shows vault balance, campaigns needing funding, and transaction history.
 */
export default function VaultPage() {
    const queryClient = useQueryClient();

    // ─── Payment redirect verification ──────────────
    const verifyAttempted = useRef(false);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const txnId = params.get('txn');

        if (paymentStatus === 'success' && txnId && !verifyAttempted.current) {
            verifyAttempted.current = true;

            // Clean URL
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);

            // Poll verify endpoint (Tazapay may take a moment)
            const pollVerify = async (retriesLeft = 5) => {
                try {
                    const res = await verifyDeposit(txnId);
                    const status = res?.data?.paymentStatus;

                    if (status === 'Completed') {
                        toast.success('Payment confirmed! Campaign funded successfully.');
                        queryClient.invalidateQueries({ queryKey: ['vault', 'summary'] });
                        queryClient.invalidateQueries({ queryKey: ['vault', 'transactions'] });
                        queryClient.invalidateQueries({ queryKey: ['vault', 'campaigns'] });
                        return;
                    }
                    if (status === 'Failed') {
                        toast.error('Payment was not successful.');
                        return;
                    }
                    // Still pending — retry after delay
                    if (retriesLeft > 0) {
                        setTimeout(() => pollVerify(retriesLeft - 1), 3000);
                    } else {
                        toast('Payment verification is taking longer than expected. Your balance will update shortly.', { icon: '⏳' });
                        queryClient.invalidateQueries({ queryKey: ['vault', 'summary'] });
                        queryClient.invalidateQueries({ queryKey: ['vault', 'transactions'] });
                        queryClient.invalidateQueries({ queryKey: ['vault', 'campaigns'] });
                    }
                } catch (err) {
                    console.error('Verify deposit error:', err);
                    toast.error('Could not verify payment. Please refresh the page.');
                }
            };

            toast.loading('Verifying payment...', { id: 'verify-payment', duration: 15000 });
            pollVerify().finally(() => toast.dismiss('verify-payment'));
        } else if (paymentStatus === 'cancelled' && txnId) {
            window.history.replaceState({}, '', window.location.pathname);
            toast.error('Payment was cancelled.');
        }
    }, [queryClient]);

    // ─── Data hooks ─────────────────────────────────
    const { data: summary, isLoading: summaryLoading, error: summaryError } = useVaultSummary();
    const { data: systemStatus, isLoading: statusLoading } = useSystemStatus();
    const { data: campaignsData, isLoading: campaignsLoading } = useVaultCampaigns();

    // ─── Transaction state ──────────────────────────
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [search, setSearch] = useState('');
    const [searchDebounced, setSearchDebounced] = useState('');

    // Debounce search
    const searchTimerRef = useRef(null);
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

    // ─── Fund Modal state ───────────────────────────
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const handleFundCampaign = useCallback((campaign) => {
        setSelectedCampaign(campaign);
    }, []);

    const handleFundSuccess = useCallback(() => {
        setSelectedCampaign(null);
        queryClient.invalidateQueries({ queryKey: ['vault', 'summary'] });
        queryClient.invalidateQueries({ queryKey: ['vault', 'campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['vault', 'transactions'] });
    }, [queryClient]);

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
                        <span>Escrow Vault</span>
                    </div>
                    <h1 className="vault-page__title">Escrow Vault</h1>
                    <p className="vault-page__subtitle">Fund your campaigns and manage escrow payments.</p>
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

                    {/* Capital Deployment Section — campaign allocation engine */}
                    <ErrorBoundary>
                        <CapitalDeploymentSection
                            campaigns={campaignsData?.campaigns || campaignsData || []}
                            vault={{
                                availableLiquidity: summary?.available ?? 0,
                                lockedInEscrow: summary?.locked ?? 0,
                                pendingRelease: summary?.pending ?? 0,
                            }}
                            onAllocate={(campaignId) => {
                                const campaign = (campaignsData?.campaigns || campaignsData || []).find(c => c.id === campaignId);
                                if (campaign) handleFundCampaign(campaign);
                            }}
                            isLoading={campaignsLoading || summaryLoading}
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

                    <StatementAlertCard />
                </div>
            </div>

            {/* ─── Fund Campaign Modal ─── */}
            <VaultFundModal
                isOpen={!!selectedCampaign}
                onClose={() => setSelectedCampaign(null)}
                campaign={selectedCampaign}
                onFundSuccess={handleFundSuccess}
            />
        </div>
    );
}
