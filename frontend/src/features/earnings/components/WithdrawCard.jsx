/**
 * WithdrawCard — Primary action card. Shows available balance + withdraw button,
 * or a bank-connect CTA if no bank is connected yet.
 */
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar, ArrowRight, Building2, Loader2, CheckCircle } from 'lucide-react';
import { useWithdraw } from '../hooks/useEarnings';
import SecureOnboardingModal from '../../../dashboard/components/SecureOnboardingModal';

const fmt$ = (v) =>
  `$${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* Skeleton */
export const WithdrawCardSkeleton = () => (
  <div
    className="rounded-2xl p-6 animate-pulse"
    style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}
  >
    <div className="h-3 w-28 rounded mb-4" style={{ background: 'var(--bd-surface-input)' }} />
    <div className="h-10 w-40 rounded mb-2" style={{ background: 'var(--bd-surface-input)' }} />
    <div className="h-3 w-32 rounded mb-6" style={{ background: 'var(--bd-surface-input)' }} />
    <div className="h-10 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
  </div>
);

/**
 * @param {{
 *   availableBalance: number;
 *   nextPayoutDate: string | null;
 *   bankConnected: boolean;
 *   loading?: boolean;
 *   onBankConnected?: (data: any) => void;
 * }} props
 */
const WithdrawCard = memo(({
  availableBalance = 0,
  nextPayoutDate = null,
  bankConnected = false,
  loading = false,
  onBankConnected,
}) => {
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const withdraw = useWithdraw();

  const handleWithdraw = async () => {
    if (availableBalance <= 0) return;
    try {
      await withdraw.mutateAsync(availableBalance);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 3000);
    } catch {
      // Error toast could be added here; for now the button reverts
    }
  };

  if (loading) return <WithdrawCardSkeleton />;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: bankConnected
            ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, var(--bd-surface-card) 60%)'
            : 'var(--bd-surface-card)',
          border: `1px solid ${bankConnected ? 'rgba(16,185,129,0.2)' : 'var(--bd-border-subtle)'}`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(16,185,129,0.06) 0%, transparent 65%)' }} />

        <div className="relative z-10">
          {bankConnected ? (
            /* ── Bank connected view ── */
            <>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Available to Withdraw</p>
              <p className="text-4xl font-bold tabular-nums mb-1" style={{ color: '#34d399' }}>
                {fmt$(availableBalance)}
              </p>

              {nextPayoutDate && (
                <div className="flex items-center gap-1.5 mb-5">
                  <Calendar size={11} style={{ color: 'var(--bd-text-secondary)' }} />
                  <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                    Next payout: <span className="font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{fmtDate(nextPayoutDate)}</span>
                  </p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {withdrawSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
                  >
                    <CheckCircle size={15} />
                    Withdrawal requested!
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    onClick={handleWithdraw}
                    disabled={availableBalance <= 0 || withdraw.isPending}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      background: availableBalance > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bd-surface-input)',
                      color: availableBalance > 0 ? '#fff' : 'var(--bd-text-secondary)',
                      boxShadow: availableBalance > 0 ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
                      cursor: availableBalance <= 0 ? 'not-allowed' : 'pointer',
                      opacity: availableBalance <= 0 ? 0.6 : 1,
                    }}
                    title={availableBalance <= 0 ? 'No funds available to withdraw' : undefined}
                  >
                    {withdraw.isPending ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                    {withdraw.isPending ? 'Processing…' : 'Withdraw Funds'}
                  </motion.button>
                )}
              </AnimatePresence>

              {withdraw.isError && (
                <p className="text-xs mt-2 text-center" style={{ color: '#f87171' }}>
                  Withdrawal failed. Please try again or contact support.
                </p>
              )}
            </>
          ) : (
            /* ── No bank connected view ── */
            <>
              <div
                className="flex flex-col items-center text-center p-4 mb-4 rounded-xl"
                style={{ background: 'rgba(148,163,184,0.06)', border: '1px dashed var(--bd-border-subtle)' }}
              >
                <Building2 size={28} style={{ color: 'var(--bd-text-secondary)', marginBottom: 8, opacity: 0.5 }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--bd-text-primary)' }}>No bank account connected</p>
                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>Connect your bank to receive payouts from your campaigns.</p>
              </div>
              <button
                onClick={() => setBankModalOpen(true)}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                }}
              >
                Connect Bank Account
                <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>
      </motion.div>

      <SecureOnboardingModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onSuccess={(data) => {
          setBankModalOpen(false);
          onBankConnected?.(data);
        }}
      />
    </>
  );
});

WithdrawCard.displayName = 'WithdrawCard';
export default WithdrawCard;
