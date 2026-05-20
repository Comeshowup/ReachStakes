import React, { useState, useEffect, useCallback, memo } from 'react';
import toast from 'react-hot-toast';
import paymentService from '../../../api/paymentService';
import { fundCampaignEscrow } from '../../../api/escrowService';
import { formatCurrency } from '../../../utils/formatCurrency';
import '../../../styles/escrow-vault.css';

/**
 * VaultFundModal — Premium modal for funding a campaign escrow.
 * Displays campaign info, calculates fees, and initiates Tazapay payment.
 * Uses vault-modal design tokens for visual consistency.
 */
function VaultFundModal({ isOpen, onClose, campaign, availableBalance = 0, onFundSuccess }) {
    const [amount, setAmount] = useState('');
    const [fees, setFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [redirecting, setRedirecting] = useState(false);
    const [fundMethod, setFundMethod] = useState('gateway'); // 'vault' or 'gateway'

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen && campaign) {
            const remaining = Math.max(0, (campaign.requiredAmount || 0) - (campaign.fundedAmount || 0));
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
            (campaign?.requiredAmount || 0) - (campaign?.fundedAmount || 0)
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
            if (fundMethod === 'vault') {
                if (numAmt > availableBalance) {
                    setError('Insufficient vault balance for this allocation.');
                    setSubmitting(false);
                    return;
                }

                // Call internal allocation endpoint
                await fundCampaignEscrow(campaign.id, numAmt);
                toast.success('Funds successfully allocated from vault!');
                onFundSuccess?.(campaign.id, numAmt);
                onClose();
            } else {
                // Initiate payment via Tazapay
                const result = await paymentService.initiateCampaignPayment(
                    campaign.id,
                    numAmt
                );

                if (result?.url) {
                    setRedirecting(true);
                    window.location.href = result.url;
                } else {
                    // Direct funding (fallback)
                    onFundSuccess?.(campaign.id, numAmt);
                    onClose();
                }
            }
        } catch (err) {
            const userMessage = err?.userMessage || err?.message || 'Payment initiation failed. Please try again.';
            setError(userMessage);
            setSubmitting(false);
        }
    }, [amount, agreed, campaign, onFundSuccess, onClose, fundMethod, availableBalance]);

    if (!isOpen || !campaign) return null;

    const numAmount = parseFloat(amount) || 0;
    const targetBudget = campaign.requiredAmount || 0;
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

                {/* ─── Form ─── */}
                <form onSubmit={handleSubmit}>
                    <div className="vault-modal__body">
                        {/* ─── Campaign Progress Card ─── */}
                        <div className="vault-fund-modal__progress-card">
                            <div className="ev-modal__info-row">
                                <div className="ev-modal__info-item">
                                    <span className="ev-modal__info-label">Available Liquidity</span>
                                    <span className={`ev-modal__info-value ${availableBalance > 0 ? 'ev-modal__info-value--success' : 'ev-modal__info-value--muted'}`}>
                                        {formatCurrency(availableBalance)}
                                    </span>
                                </div>
                                <div className="ev-modal__info-item">
                                    <span className="ev-modal__info-label">Campaign Gap</span>
                                    <span className="ev-modal__info-value ev-modal__info-value--warning">{formatCurrency(remaining)}</span>
                                </div>
                            </div>
                            
                            {/* Funding Method */}
                            <div className="ev-modal__section">
                                <h4 className="ev-modal__section-title">Funding Method</h4>
                                <div className="ev-modal__methods">
                                    <button
                                        className={`ev-modal__method ${fundMethod === 'vault' ? 'ev-modal__method--active' : ''} ${availableBalance < numAmount ? 'ev-modal__method--disabled' : ''}`}
                                        onClick={() => availableBalance >= numAmount && setFundMethod('vault')}
                                        type="button"
                                        disabled={availableBalance < numAmount}
                                    >
                                        <span className="material-symbols-outlined">account_balance_wallet</span>
                                        <div className="ev-modal__method-content">
                                            <span className="ev-modal__method-name">Vault Balance</span>
                                            <span className="ev-modal__method-desc">Allocate existing liquidity</span>
                                        </div>
                                        {fundMethod === 'vault' && <span className="material-symbols-outlined ev-modal__method-check">check_circle</span>}
                                    </button>

                                    <button
                                        className={`ev-modal__method ${fundMethod === 'gateway' ? 'ev-modal__method--active' : ''}`}
                                        onClick={() => setFundMethod('gateway')}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined">payments</span>
                                        <div className="ev-modal__method-content">
                                            <span className="ev-modal__method-name">External Payment</span>
                                            <span className="ev-modal__method-desc">Pay via Card or Wire</span>
                                        </div>
                                        {fundMethod === 'gateway' && <span className="material-symbols-outlined ev-modal__method-check">check_circle</span>}
                                    </button>
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

                                {/* ─── Fee Breakdown ─── */}
                                {fundMethod === 'gateway' && numAmount > 0 && (
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
                                        <span>
                                            {fundMethod === 'vault'
                                                ? `Confirming this will allocate ${formatCurrency(numAmount)} from your vault to this campaign escrow. This action is immediate.`
                                                : `I agree to the escrow terms and acknowledge that a processing fee will be added to the total charge.`
                                            }
                                        </span>
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
                            <>
                                
                                <button
                                    className={`ev-modal__btn ev-modal__btn--primary ${(!agreed || submitting || redirecting || (fundMethod === 'vault' && availableBalance < numAmount)) ? 'ev-modal__btn--disabled' : ''}`}
                                    type="submit"
                                    disabled={!agreed || submitting || redirecting || (fundMethod === 'vault' && availableBalance < numAmount)}
                                >
                                {submitting || redirecting ? (
                                    <span className="ev-modal__btn-spinner" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shield</span>
                                        {fundMethod === 'vault' ? 'Allocate from Vault' : `Fund Escrow ${numAmount > 0 ? formatCurrency(numAmount) : ''}`}
                                    </>
                                )}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(VaultFundModal);

