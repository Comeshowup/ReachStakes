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
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && minimumAmount && minimumAmount > 0) {
            setAmount(String(minimumAmount));
        }
    }, [isOpen, minimumAmount]);

    useEffect(() => {
        if (!isOpen) {
            setSubmitting(false);
            setError('');
            setAmount('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const parsedAmount = parseFloat(amount);
    const hasMinimum = minimumAmount && minimumAmount > 0;
    const meetsMinimum = !hasMinimum || parsedAmount >= minimumAmount;
    const isValid = parsedAmount > 0 && parsedAmount <= 10000000 && meetsMinimum;

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

        setSubmitting(true);
        try {
            const result = await onSubmit({ amount: parsedAmount });
            const checkoutUrl = result?.data?.url || result?.url;

            if (checkoutUrl) {
                toast.success('Redirecting to payment gateway...');
                window.location.href = checkoutUrl;
            } else {
                toast.success(`Successfully deposited ${formatCurrency(parsedAmount)}`);
                setAmount('');
                onClose();
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Deposit failed. Please try again.');
            setSubmitting(false);
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
                        {error && <p className="vault-modal__error">{error}</p>}
                    </div>
                    <div className="vault-modal__footer">
                        <button type="button" className="vault-modal__btn vault-modal__btn--cancel" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="vault-modal__btn vault-modal__btn--submit"
                            disabled={!isValid || isSubmitting || submitting}
                        >
                            {submitting || isSubmitting ? (
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
