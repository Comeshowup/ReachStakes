/**
 * WithdrawModal — Creator-initiated withdrawal modal.
 * Validates amount against available balance, enforces $25 minimum.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, AlertCircle, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { useWithdraw } from '../hooks/useEarnings';

const fmt$ = (v) =>
  `$${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MIN_WITHDRAWAL = 25;

const WithdrawModal = ({ isOpen, onClose, availableBalance = 0 }) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('input'); // input | confirm | success | error
  const [error, setError] = useState(null);
  const withdraw = useWithdraw();

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setStep('input');
      setError(null);
    }
  }, [isOpen]);

  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount >= MIN_WITHDRAWAL && parsedAmount <= availableBalance;

  const handleContinue = () => {
    if (parsedAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ${fmt$(MIN_WITHDRAWAL)}`);
      return;
    }
    if (parsedAmount > availableBalance) {
      setError(`Maximum withdrawal is ${fmt$(availableBalance)}`);
      return;
    }
    setError(null);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      await withdraw.mutateAsync(parsedAmount);
      setStep('success');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Withdrawal failed');
      setStep('error');
    }
  };

  const handleSetMax = () => {
    setAmount(availableBalance.toFixed(2));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '100%', maxWidth: 420,
              background: 'var(--bd-surface)',
              border: '1px solid var(--bd-border-default)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DollarSign style={{ width: 16, height: 16, color: '#fff' }} />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--bd-text-primary)', margin: 0 }}>
                  Withdraw Funds
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bd-text-muted)', padding: 4 }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Content based on step */}
            {step === 'input' && (
              <>
                {/* Balance display */}
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  background: 'var(--bd-surface-input)',
                  border: '1px solid var(--bd-border-default)',
                  marginBottom: '1rem',
                }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.15rem' }}>Available Balance</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt$(availableBalance)}
                  </p>
                </div>

                {/* Amount input */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem', color: 'var(--bd-text-secondary)' }}>
                    Withdrawal Amount
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.9375rem', fontWeight: 600, color: 'var(--bd-text-muted)',
                    }}>$</span>
                    <input
                      type="number"
                      min={MIN_WITHDRAWAL}
                      max={availableBalance}
                      step="0.01"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setError(null); }}
                      placeholder="0.00"
                      style={{
                        width: '100%', padding: '0.7rem 0.9rem 0.7rem 1.75rem',
                        borderRadius: '0.625rem', fontSize: '1.125rem', fontWeight: 600,
                        border: `1px solid ${error ? '#f87171' : 'var(--bd-border-default)'}`,
                        background: 'var(--bd-surface-input)', color: 'var(--bd-text-primary)',
                        outline: 'none', boxSizing: 'border-box',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSetMax}
                      style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                        border: 'none', cursor: 'pointer', letterSpacing: '0.03em',
                      }}
                    >
                      Max
                    </button>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginTop: '0.35rem' }}>
                    Minimum: {fmt$(MIN_WITHDRAWAL)} · Processing: 1-3 business days
                  </p>
                </div>

                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                    background: 'rgba(248,113,113,0.08)', fontSize: '0.8rem', color: '#f87171',
                    marginBottom: '0.75rem',
                  }}>
                    <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  disabled={!amount || parsedAmount <= 0}
                  style={{
                    width: '100%', padding: '0.65rem 1rem', borderRadius: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 600,
                    background: isValidAmount ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bd-surface-input)',
                    color: isValidAmount ? '#fff' : 'var(--bd-text-muted)',
                    border: 'none', cursor: isValidAmount ? 'pointer' : 'not-allowed',
                    boxShadow: isValidAmount ? '0 4px 14px rgba(16,185,129,0.25)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Continue
                </button>
              </>
            )}

            {step === 'confirm' && (
              <>
                <div style={{
                  textAlign: 'center', padding: '1rem 0',
                }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--bd-text-secondary)', marginBottom: '0.5rem' }}>You are about to withdraw</p>
                  <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#34d399', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt$(parsedAmount)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginTop: '0.5rem' }}>
                    Funds will be deposited to your connected bank account within 1-3 business days.
                  </p>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  background: 'rgba(16,185,129,0.06)', fontSize: '0.75rem', color: '#10b981',
                  marginBottom: '1rem', justifyContent: 'center',
                }}>
                  <Shield style={{ width: 13, height: 13 }} />
                  Secured by Tazapay
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setStep('input')}
                    disabled={withdraw.isPending}
                    style={{
                      flex: 1, padding: '0.6rem 1rem', borderRadius: '0.75rem',
                      fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                      background: 'var(--bd-surface-input)', color: 'var(--bd-text-primary)', border: 'none',
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={withdraw.isPending}
                    style={{
                      flex: 1, padding: '0.6rem 1rem', borderRadius: '0.75rem',
                      fontSize: '0.875rem', fontWeight: 600,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff', border: 'none',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                      cursor: withdraw.isPending ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}
                  >
                    {withdraw.isPending ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
                    {withdraw.isPending ? 'Processing…' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <CheckCircle2 style={{ width: 28, height: 28, color: '#10b981' }} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bd-text-primary)', marginBottom: '0.35rem' }}>
                  Withdrawal Submitted!
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--bd-text-secondary)', marginBottom: '1rem' }}>
                  Your withdrawal of <strong style={{ color: '#34d399' }}>{fmt$(parsedAmount)}</strong> will be processed within 1-3 business days.
                </p>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.6rem 2rem', borderRadius: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 600,
                    background: 'var(--bd-primary)', color: 'var(--bd-primary-fg)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            )}

            {step === 'error' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(248,113,113,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <AlertCircle style={{ width: 28, height: 28, color: '#f87171' }} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bd-text-primary)', marginBottom: '0.35rem' }}>
                  Withdrawal Failed
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#f87171', marginBottom: '1rem' }}>{error}</p>
                <button
                  onClick={() => setStep('input')}
                  style={{
                    padding: '0.6rem 2rem', borderRadius: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 600,
                    background: 'var(--bd-surface-input)', color: 'var(--bd-text-primary)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawModal;
