import React, { useState, useEffect, memo } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * AddFundsModal — Deposit funds into the vault.
 * Accepts optional minimumAmount + context for insufficient-funds redirect flow.
 */
function AddFundsModal({ isOpen, onClose, onSubmit, isSubmitting, minimumAmount, fundingContext }) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Wire');
    const [error, setError] = useState('');

    // Pre-fill with minimum amount when provided (from insufficient-funds redirect)
    useEffect(() => {
        if (isOpen && minimumAmount && minimumAmount > 0) {
            setAmount(String(minimumAmount));
        }
    }, [isOpen, minimumAmount]);

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

        try {
            await onSubmit({ amount: parsedAmount, method });
            toast.success(`Successfully deposited ${formatCurrency(parsedAmount)} via ${method}`);
            setAmount('');
            setMethod('Wire');
            onClose();
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
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? (
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
