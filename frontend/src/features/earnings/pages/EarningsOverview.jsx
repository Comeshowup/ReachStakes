/**
 * EarningsOverview — The main Earnings tab. Assembles all overview components.
 * Answers: How much have I earned? How much can I withdraw? When do I get paid?
 */
import React, { useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEarnings, EARNINGS_KEYS } from '../hooks/useEarnings';
import EarningsSummaryCards from '../components/EarningsSummaryCards';
import WithdrawCard from '../components/WithdrawCard';
import EarningsGraph from '../components/EarningsGraph';
import RecentTransactions from '../components/RecentTransactions';
import PayoutHistoryTable from '../components/PayoutHistoryTable';
import WithdrawModal from '../components/WithdrawModal';

const EarningsOverview = () => {
  const { data, isLoading, isError, refetch } = useEarnings();
  const queryClient = useQueryClient();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const handleBankConnected = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: EARNINGS_KEYS.summary });
  }, [queryClient]);

  const handleWithdrawClose = useCallback(() => {
    setWithdrawModalOpen(false);
    // Refresh earnings data after withdrawal
    queryClient.invalidateQueries({ queryKey: EARNINGS_KEYS.summary });
    queryClient.invalidateQueries({ queryKey: ['payout-history'] });
  }, [queryClient]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <AlertTriangle size={32} style={{ color: '#f87171', marginBottom: 12 }} className="opacity-80" />
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--bd-text-primary)' }}>Unable to load earnings</p>
        <p className="text-xs mb-4" style={{ color: 'var(--bd-text-secondary)' }}>Check your connection and try again.</p>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-primary)', border: '1px solid var(--bd-border-subtle)' }}
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Row 1 — Three summary metric cards */}
      <EarningsSummaryCards
        availableBalance={data?.availableBalance}
        pendingBalance={data?.pendingBalance}
        lifetimeEarnings={data?.lifetimeEarnings}
        loading={isLoading}
      />

      {/* Row 2 — Withdraw action + Earnings chart side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <WithdrawCard
            availableBalance={data?.availableBalance}
            nextPayoutDate={data?.nextPayoutDate}
            bankConnected={data?.bankConnected}
            loading={isLoading}
            onBankConnected={handleBankConnected}
          />
        </div>
        <div className="lg:col-span-2">
          <EarningsGraph
            timeseries={data?.earningsTimeseries ?? []}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Row 3 — Recent transactions */}
      <RecentTransactions
        transactions={data?.recentTransactions ?? []}
        loading={isLoading}
      />

      {/* Row 4 — Payout history table */}
      <PayoutHistoryTable />

      {/* Withdraw modal */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={handleWithdrawClose}
        availableBalance={data?.availableBalance ?? 0}
      />
    </div>
  );
};

export default EarningsOverview;

