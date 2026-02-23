import React, { useState, useEffect, memo } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatCurrency';

// Fee constants (match backend)
const PLATFORM_FEE_PERCENT = 5;
const PROCESSING_FEE_PERCENT = 2.9;

/**
 * AddFundsModal — Deposit funds into the vault via Tazapay payment.
 * Accepts optional minimumAmount + context for insufficient-funds redirect flow.
 */
function AddFundsModal({ isOpen, onClose, onSubmit, isSubmitting, minimumAmount, fundingContext }) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Wire');
    const [error, setError] = useState('');
    const [redirecting, setRedirecting] = useState(false);

    // Pre-fill with minimum amount when provided (from insufficient-funds redirect)
    useEffect(() => {
        if (isOpen && minimumAmount && minimumAmount > 0) {
            setAmount(String(minimumAmount));
        }
    }, [isOpen, minimumAmount]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setRedirecting(false);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const parsedAmount = parseFloat(amount);
    const hasMinimum = minimumAmount && minimumAmount > 0;
    const meetsMinimum = !hasMinimum || parsedAmount >= minimumAmount;
    const isValid = parsedAmount > 0 && parsedAmount <= 10000000 && meetsMinimum;

    // Fee preview
    const platformFee = parsedAmount > 0 ? parsedAmount * (PLATFORM_FEE_PERCENT / 100) : 0;
    const processingFee = parsedAmount > 0 ? parsedAmount * (PROCESSING_FEE_PERCENT / 100) : 0;
    const totalCharge = parsedAmount + platformFee + processingFee;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (hasMinimum && !meetsMinimum) {
            setError(`Minimum deposit of ${formatCurrency(minimumAmount)} required to fund ${fundingContext || 'campaign'}.`);
            return;
        }

        if (!isValid) {
            setError('Enter an amount between $1 and $10,000,000.');
            return;
        }

        try {
            const result = await onSubmit({ amount: parsedAmount, method });

            // Check if the backend returned a Tazapay checkout URL
            if (result?.data?.url || result?.url) {
                const checkoutUrl = result?.data?.url || result?.url;
                setRedirecting(true);
                toast.success('Redirecting to payment gateway...');
                // Redirect to Tazapay checkout page
                window.location.href = checkoutUrl;
            } else {
                // Fallback: direct deposit (no payment gateway)
                toast.success(`Successfully deposited ${formatCurrency(parsedAmount)}`);
                setAmount('');
                setMethod('Wire');
                onClose();
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Deposit failed. Please try again.');
        }
    };

    return (
        <div className="vault-modal-overlay" onClick={onClose}>
            <div className="vault-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="add-funds-title">
                <div className="vault-modal__header">
                    <h2 id="add-funds-title" className="vault-modal__title">Add Funds</h2>
                    <button className="vault-modal__close" onClick={onClose} aria-label="Close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="vault-modal__body">
                        {/* Minimum deposit notice from allocation redirect */}
                        {hasMinimum && (
                            <div className="vault-modal__minimum-notice">
                                <span className="material-symbols-outlined vault-modal__minimum-icon">info</span>
                                <p>
                                    Minimum <strong>{formatCurrency(minimumAmount)}</strong> required
                                    {fundingContext ? ` to fund ${fundingContext}` : ''}.
                                </p>
                            </div>
                        )}

                        <label className="vault-modal__label">
                            Amount (USD)
                            <div className="vault-modal__input-wrap">
                                <span className="vault-modal__input-prefix">$</span>
                                <input
                                    type="number"
                                    className="vault-modal__input"
                                    placeholder="0.00"
                                    min={hasMinimum ? minimumAmount : 1}
                                    max="10000000"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => { setAmount(e.target.value); setError(''); }}
                                    autoFocus
                                    required
                                />
                            </div>
                        </label>

                        {/* Fee breakdown */}
                        {parsedAmount > 0 && (
                            <div className="vault-modal__fees" style={{ margin: '12px 0', padding: '12px', background: 'var(--surface-secondary, #f8f9fa)', borderRadius: '8px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span>Deposit amount</span>
                                    <span>{formatCurrency(parsedAmount)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', opacity: 0.7 }}>
                                    <span>Platform fee ({PLATFORM_FEE_PERCENT}%)</span>
                                    <span>{formatCurrency(platformFee)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', opacity: 0.7 }}>
                                    <span>Processing fee ({PROCESSING_FEE_PERCENT}%)</span>
                                    <span>{formatCurrency(processingFee)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid var(--border-primary, #e0e0e0)', paddingTop: '8px' }}>
                                    <span>Total charge</span>
                                    <span>{formatCurrency(totalCharge)}</span>
                                </div>
                            </div>
                        )}

                        <label className="vault-modal__label">
                            Funding Method
                            <div className="vault-modal__method-group">
                                {['Wire', 'ACH'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`vault-modal__method-btn ${method === m ? 'vault-modal__method-btn--active' : ''}`}
                                        onClick={() => setMethod(m)}
                                    >
                                        {m} Transfer
                                    </button>
                                ))}
                            </div>
                        </label>

                        {error && <p className="vault-modal__error">{error}</p>}
                    </div>
                    <div className="vault-modal__footer">
                        <button type="button" className="vault-modal__btn vault-modal__btn--cancel" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="vault-modal__btn vault-modal__btn--submit"
                            disabled={!isValid || isSubmitting || redirecting}
                        >
                            {redirecting ? (
                                <>
                                    <span className="vault-modal__spinner" />
                                    Redirecting to payment...
                                </>
                            ) : isSubmitting ? (
                                <span className="vault-modal__spinner" />
                            ) : (
                                <>Deposit {amount ? formatCurrency(parsedAmount) : ''}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(AddFundsModal);

