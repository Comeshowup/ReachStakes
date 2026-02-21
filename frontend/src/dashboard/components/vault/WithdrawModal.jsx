import React, { useState, memo } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * WithdrawModal — Withdraw funds from the vault.
 * Shows available balance, validates amount against available liquidity.
 */
function WithdrawModal({ isOpen, onClose, onSubmit, isSubmitting, availableBalance = 0 }) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const parsedAmount = parseFloat(amount);
    const isValid = parsedAmount > 0 && parsedAmount <= availableBalance;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (parsedAmount > availableBalance) {
            setError(`Cannot exceed available balance of ${formatCurrency(availableBalance)}.`);
            return;
        }
        if (!isValid) {
            setError('Enter a valid amount.');
            return;
        }

        try {
            await onSubmit({ amount: parsedAmount });
            toast.success(`Successfully withdrew ${formatCurrency(parsedAmount)}`);
            setAmount('');
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Withdrawal failed. Please try again.');
        }
    };

    return (
        <div className="vault-modal-overlay" onClick={onClose}>
            <div className="vault-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="withdraw-title">
                <div className="vault-modal__header">
                    <h2 id="withdraw-title" className="vault-modal__title">Withdraw Capital</h2>
                    <button className="vault-modal__close" onClick={onClose} aria-label="Close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="vault-modal__body">
                        <div className="vault-modal__available-badge">
                            <span className="vault-modal__available-label">Available Balance</span>
                            <span className="vault-modal__available-value">{formatCurrency(availableBalance)}</span>
                        </div>

                        <label className="vault-modal__label">
                            Withdrawal Amount (USD)
                            <div className="vault-modal__input-wrap">
                                <span className="vault-modal__input-prefix">$</span>
                                <input
                                    type="number"
                                    className="vault-modal__input"
                                    placeholder="0.00"
                                    min="1"
                                    max={availableBalance}
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => { setAmount(e.target.value); setError(''); }}
                                    autoFocus
                                    required
                                />
                            </div>
                        </label>

                        {parsedAmount > 0 && parsedAmount <= availableBalance && (
                            <p className="vault-modal__impact">
                                Remaining after withdrawal: <strong>{formatCurrency(availableBalance - parsedAmount)}</strong>
                            </p>
                        )}

                        {error && <p className="vault-modal__error">{error}</p>}
                    </div>
                    <div className="vault-modal__footer">
                        <button type="button" className="vault-modal__btn vault-modal__btn--cancel" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="vault-modal__btn vault-modal__btn--submit vault-modal__btn--withdraw"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="vault-modal__spinner" />
                            ) : (
                                <>Withdraw {amount ? formatCurrency(parsedAmount) : ''}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(WithdrawModal);
