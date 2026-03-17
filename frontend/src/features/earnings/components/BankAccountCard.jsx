/**
 * BankAccountCard — Displays the connected bank account or an empty-state CTA.
 * Used in PayoutSettingsPage.
 */
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Plus, Loader2, AlertTriangle } from 'lucide-react';
import payoutService from '../../../api/payoutService';
import SecureOnboardingModal from '../../../dashboard/components/SecureOnboardingModal';

/**
 * @param {{
 *   bankConnected: boolean;
 *   bankName: string | null;
 *   bankLastFour: string | null;
 *   bankCountry?: string;
 *   bankCurrency?: string;
 *   loading?: boolean;
 *   onUpdate?: () => void;
 * }} props
 */
const BankAccountCard = memo(({
  bankConnected = false,
  bankName = null,
  bankLastFour = null,
  bankCountry = null,
  bankCurrency = null,
  loading = false,
  onUpdate,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState(null);

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your bank account? You will not be able to receive payouts until you reconnect.')) return;
    setDisconnecting(true);
    setDisconnectError(null);
    try {
      await payoutService.disconnectBank();
      onUpdate?.();
    } catch (err) {
      setDisconnectError(err?.response?.data?.message ?? 'Failed to disconnect bank account.');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}>
        <div className="h-3 w-24 rounded mb-4" style={{ background: 'var(--bd-surface-input)' }} />
        <div className="h-16 rounded-xl mb-3" style={{ background: 'var(--bd-surface-input)' }} />
        <div className="h-9 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>Payout Account</h3>
        {bankConnected && (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#34d399' }}>
            <CheckCircle size={11} />
            Connected
          </span>
        )}
      </div>

      {bankConnected ? (
        <>
          <div
            className="flex items-center gap-3 p-3.5 rounded-xl mb-3"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Building2 size={15} style={{ color: '#34d399' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--bd-text-primary)' }}>{bankName ?? 'Bank Account'}</p>
              <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                •••• {bankLastFour}
                {bankCountry && ` · ${bankCountry}`}
                {bankCurrency && ` · ${bankCurrency}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: 'var(--bd-surface-input)',
                color: 'var(--bd-text-primary)',
                border: '1px solid var(--bd-border-subtle)',
              }}
            >
              Replace Account
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {disconnecting ? <Loader2 size={11} className="animate-spin" /> : null}
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>

          {disconnectError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#f87171' }}>
              <AlertTriangle size={11} />
              {disconnectError}
            </div>
          )}
        </>
      ) : (
        <>
          <div
            className="flex flex-col items-center text-center p-5 mb-3 rounded-xl"
            style={{ background: 'rgba(148,163,184,0.05)', border: '1px dashed var(--bd-border-subtle)' }}
          >
            <Building2 size={24} style={{ color: 'var(--bd-text-secondary)', opacity: 0.4, marginBottom: 6 }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--bd-text-primary)' }}>No bank connected</p>
            <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>Connect your bank to receive campaign payouts.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              boxShadow: '0 3px 12px rgba(16,185,129,0.22)',
            }}
          >
            <Plus size={13} />
            Connect Bank Account
          </button>
        </>
      )}

      <SecureOnboardingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); onUpdate?.(); }}
      />
    </motion.div>
  );
});

BankAccountCard.displayName = 'BankAccountCard';
export default BankAccountCard;
