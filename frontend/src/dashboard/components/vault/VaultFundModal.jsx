import React, { useState, useEffect, useCallback, memo } from 'react';
import toast from 'react-hot-toast';
import paymentService from '../../../api/paymentService';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * VaultFundModal — Premium modal for funding a campaign escrow.
 * Displays campaign info, calculates fees, and initiates Tazapay payment.
 * Uses vault-modal design tokens for visual consistency.
 */
function VaultFundModal({ isOpen, onClose, campaign, onFundSuccess }) {
    const [amount, setAmount] = useState('');
    const [fees, setFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [redirecting, setRedirecting] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen && campaign) {
            const remaining = Math.max(0, (campaign.targetBudget || 0) - (campaign.fundedAmount || 0));
            setAmount(remaining > 0 ? remaining.toFixed(2) : '');
            setFees(null);
            setAgreed(false);
            setError('');
            setSubmitting(false);
            setRedirecting(false);
        }
    }, [isOpen, campaign]);

    // Calculate fees on amount change (debounced)
    useEffect(() => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            setFees(null);
            return;
        }

        const timer = setTimeout(async () => {
            setLoadingFees(true);
            try {
                const result = await paymentService.calculateFees(numAmount);
                setFees(result);
            } catch {
                // Fallback calculation
                setFees({
                    amount: numAmount,
                    platformFee: numAmount * 0.029,
                    processingFee: 0.30,
                    total: numAmount + numAmount * 0.029 + 0.30,
                });
            } finally {
                setLoadingFees(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [amount]);


    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        const numAmt = parseFloat(amount);

        if (!numAmt || numAmt <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        // Must fund at least the full remaining balance
        const rem = Math.max(
            0,
            (campaign?.targetBudget || 0) - (campaign?.fundedAmount || 0)
        );
        if (numAmt < rem) {
            setError(
                `Minimum funding amount is ${formatCurrency(rem)} — the full remaining balance must be covered.`
            );
            return;
        }

        if (!agreed) {
            setError('Please agree to the escrow terms.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const result = await paymentService.initiateCampaignPayment(
                campaign.id,
                numAmt
            );

            if (result?.url) {
                setRedirecting(true);
                toast.success('Redirecting to payment gateway...');
                window.location.href = result.url;
            } else {
                onFundSuccess?.(campaign.id, numAmt);
                toast.success(`Campaign "${campaign.name}" funded successfully!`);
                onClose();
            }
        } catch (err) {
            const userMessage = err?.userMessage || err?.message || 'Payment initiation failed. Please try again.';
            setError(userMessage);
            setSubmitting(false);
        }
    }, [amount, agreed, campaign, onFundSuccess, onClose]);

    if (!isOpen || !campaign) return null;

    const numAmount = parseFloat(amount) || 0;
    const targetBudget = campaign.targetBudget || 0;
    const fundedAmount = campaign.fundedAmount || 0;
    const remaining = Math.max(0, targetBudget - fundedAmount);
    const fundedPct = targetBudget > 0 ? Math.min(100, (fundedAmount / targetBudget) * 100) : 0;
    const isFullyFunded = remaining <= 0;
    const isValid = numAmount > 0 && agreed;

    return (
        <div className="vault-modal-overlay" onClick={onClose}>
            <div className="vault-modal vault-fund-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="fund-campaign-title">
                {/* ─── Header ─── */}
                <div className="vault-modal__header">
                    <div className="vault-fund-modal__header-left">
                        <div className="vault-fund-modal__header-icon">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <h2 id="fund-campaign-title" className="vault-modal__title">Fund Campaign</h2>
                            <p className="vault-fund-modal__campaign-name">{campaign.name}</p>
                        </div>
                    </div>
                    <button className="vault-modal__close" onClick={onClose} aria-label="Close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="vault-modal__body">
                        {/* ─── Campaign Progress Card ─── */}
                        <div className="vault-fund-modal__progress-card">
                            <div className="vault-fund-modal__progress-stats">
                                <div className="vault-fund-modal__stat">
                                    <span className="vault-fund-modal__stat-label">Target Budget</span>
                                    <span className="vault-fund-modal__stat-value">{formatCurrency(targetBudget)}</span>
                                </div>
                                <div className="vault-fund-modal__stat">
                                    <span className="vault-fund-modal__stat-label">Already Funded</span>
                                    <span className="vault-fund-modal__stat-value vault-fund-modal__stat-value--success">{formatCurrency(fundedAmount)}</span>
                                </div>
                                <div className="vault-fund-modal__stat">
                                    <span className="vault-fund-modal__stat-label">Remaining</span>
                                    <span className="vault-fund-modal__stat-value vault-fund-modal__stat-value--warning">{formatCurrency(remaining)}</span>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="vault-fund-modal__progress-bar">
                                <div className="vault-fund-modal__progress-track">
                                    <div
                                        className="vault-fund-modal__progress-fill"
                                        style={{ width: `${fundedPct}%` }}
                                    />
                                </div>
                                <span className="vault-fund-modal__progress-pct">{Math.round(fundedPct)}% funded</span>
                            </div>
                        </div>

                        {/* ─── Fully Funded Notice ─── */}
                        {isFullyFunded && (
                            <div className="vault-modal__funded-notice">
                                <span className="material-symbols-outlined">check_circle</span>
                                <span>This campaign is fully funded.</span>
                            </div>
                        )}

                        {/* ─── Amount Input ─── */}
                        {!isFullyFunded && (
                            <>
                                <label className="vault-modal__label">
                                    Funding Amount
                                    <div className="vault-modal__input-wrap">
                                        <span className="vault-modal__input-prefix">$</span>
                                        <input
                                            type="number"
                                            className="vault-modal__input"
                                            placeholder="0.00"
                                            min={remaining}
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => { setAmount(e.target.value); setError(''); }}
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </label>

                                {/* Quick Fill */}
                                {remaining > 0 && (
                                    <button
                                        type="button"
                                        className="vault-fund-modal__quick-fill"
                                        onClick={() => { setAmount(remaining.toFixed(2)); setError(''); }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>
                                        Fill remaining: {formatCurrency(remaining)}
                                    </button>
                                )}

                                {/* ─── Fee Breakdown ─── */}
                                {numAmount > 0 && (
                                    <div className="vault-modal__fee-breakdown">
                                        <p className="vault-modal__fee-title">Fee Breakdown</p>
                                        <div className="vault-modal__fee-row vault-modal__fee-row--sub">
                                            <span>Funding Amount</span>
                                            <span>{formatCurrency(numAmount)}</span>
                                        </div>
                                        {loadingFees ? (
                                            <div className="vault-modal__fee-row vault-modal__fee-row--sub">
                                                <span>Calculating fees...</span>
                                                <span className="vault-modal__spinner" />
                                            </div>
                                        ) : fees ? (
                                            <>
                                                <div className="vault-modal__fee-row vault-modal__fee-row--sub">
                                                    <span>Platform Fee (2.9%)</span>
                                                    <span>{formatCurrency(fees.platformFee)}</span>
                                                </div>
                                                <div className="vault-modal__fee-row vault-modal__fee-row--sub">
                                                    <span>Processing Fee</span>
                                                    <span>{formatCurrency(fees.processingFee)}</span>
                                                </div>
                                                <div className="vault-modal__fee-divider" />
                                                <div className="vault-modal__fee-row vault-modal__fee-row--total">
                                                    <span>Total Charge</span>
                                                    <span>{formatCurrency(fees.total)}</span>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                )}

                                {/* ─── Escrow Terms ─── */}
                                <label className="vault-fund-modal__terms">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => { setAgreed(e.target.checked); setError(''); }}
                                        className="vault-fund-modal__checkbox"
                                    />
                                    <div className="vault-fund-modal__terms-content">
                                        <span className="material-symbols-outlined vault-fund-modal__terms-icon">shield</span>
                                        <span>I agree that funds will be held in escrow and released only upon milestone approval.</span>
                                    </div>
                                </label>
                            </>
                        )}

                        {/* ─── Error ─── */}
                        {error && <p className="vault-modal__error">{error}</p>}
                    </div>

                    {/* ─── Footer ─── */}
                    <div className="vault-modal__footer">
                        <button type="button" className="vault-modal__btn vault-modal__btn--cancel" onClick={onClose}>
                            Cancel
                        </button>
                        {!isFullyFunded && (
                            <button
                                type="submit"
                                className="vault-modal__btn vault-modal__btn--submit"
                                disabled={!isValid || submitting || redirecting}
                            >
                                {redirecting ? (
                                    <>
                                        <span className="vault-modal__spinner" />
                                        Redirecting...
                                    </>
                                ) : submitting ? (
                                    <>
                                        <span className="vault-modal__spinner" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shield</span>
                                        Fund Escrow {numAmount > 0 ? formatCurrency(numAmount) : ''}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(VaultFundModal);

