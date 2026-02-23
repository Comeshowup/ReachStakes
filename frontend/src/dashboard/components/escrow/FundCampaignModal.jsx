import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    DollarSign,
    Shield,
    AlertCircle,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import paymentService from '../../../api/paymentService';

/**
 * FundCampaignModal — Modal to fund a campaign escrow.
 * Includes fee calculation, terms, and payment initiation.
 */
const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v || 0);

const FundCampaignModal = ({ isOpen, onClose, campaign, onFundSuccess }) => {
    const [amount, setAmount] = useState('');
    const [fees, setFees] = useState(null);
    const [loadingFees, setLoadingFees] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setFees(null);
            setAgreed(false);
            setError('');
            setSubmitting(false);
        }
    }, [isOpen]);

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
            } catch (err) {
                // fallback calculation
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

    const handleSubmit = useCallback(async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (!agreed) {
            setError('Please agree to the terms.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Initiate payment via Tazapay
            const result = await paymentService.initiateCampaignPayment(
                campaign.id,
                numAmount
            );

            if (result?.url) {
                // Redirect to Tazapay checkout
                window.location.href = result.url;
            } else {
                // Direct funding (no external payment needed)
                onFundSuccess?.(campaign.id, numAmount);
                onClose();
            }
        } catch (err) {
            // paymentService.js now throws structured errors with userMessage, code, message
            const userMessage = err?.userMessage || err?.message || 'Payment initiation failed. Please try again.';
            setError(userMessage);
            setSubmitting(false);
        }
    }, [amount, agreed, campaign, onFundSuccess, onClose]);

    if (!isOpen || !campaign) return null;

    const numAmount = parseFloat(amount) || 0;
    const remaining = Math.max(0, (campaign.targetBudget || 0) - (campaign.fundedAmount || 0));

    return (
        <AnimatePresence>
            <motion.div
                className="ev-modal__overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="ev-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="fund-modal-title"
                >
                    <div className="ev-modal__header">
                        <div>
                            <h3 id="fund-modal-title" className="ev-modal__title">
                                <DollarSign size={18} />
                                Fund Campaign
                            </h3>
                            <p className="ev-modal__subtitle">{campaign.name}</p>
                        </div>
                        <button className="ev-modal__close" onClick={onClose} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="ev-modal__body">
                        {/* Campaign Info */}
                        <div className="ev-modal__info-row">
                            <div className="ev-modal__info-item">
                                <span className="ev-modal__info-label">Target Budget</span>
                                <span className="ev-modal__info-value">{formatCurrency(campaign.targetBudget)}</span>
                            </div>
                            <div className="ev-modal__info-item">
                                <span className="ev-modal__info-label">Already Funded</span>
                                <span className="ev-modal__info-value">{formatCurrency(campaign.fundedAmount)}</span>
                            </div>
                            <div className="ev-modal__info-item">
                                <span className="ev-modal__info-label">Remaining</span>
                                <span className="ev-modal__info-value" style={{ color: 'var(--bd-warning)' }}>
                                    {formatCurrency(remaining)}
                                </span>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div className="ev-modal__input-group">
                            <label className="ev-modal__input-label" htmlFor="fund-amount">
                                Funding Amount
                            </label>
                            <div className="ev-modal__input-wrap">
                                <span className="ev-modal__input-prefix">$</span>
                                <input
                                    id="fund-amount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="ev-modal__input"
                                    autoFocus
                                />
                            </div>
                            {remaining > 0 && (
                                <button
                                    className="ev-modal__quick-fill"
                                    onClick={() => setAmount(remaining.toFixed(2))}
                                >
                                    Fill remaining: {formatCurrency(remaining)}
                                </button>
                            )}
                        </div>

                        {/* Fee Breakdown */}
                        {numAmount > 0 && (
                            <div className="ev-modal__fees">
                                <div className="ev-modal__fee-row">
                                    <span>Amount</span>
                                    <span>{formatCurrency(numAmount)}</span>
                                </div>
                                {loadingFees ? (
                                    <div className="ev-modal__fee-row">
                                        <span>Calculating fees...</span>
                                        <Loader2 size={14} className="ev-modal__spinner" />
                                    </div>
                                ) : fees ? (
                                    <>
                                        <div className="ev-modal__fee-row">
                                            <span>Platform Fee (2.9%)</span>
                                            <span>{formatCurrency(fees.platformFee)}</span>
                                        </div>
                                        <div className="ev-modal__fee-row">
                                            <span>Processing Fee</span>
                                            <span>{formatCurrency(fees.processingFee)}</span>
                                        </div>
                                        <div className="ev-modal__fee-row ev-modal__fee-row--total">
                                            <span>Total</span>
                                            <span>{formatCurrency(fees.total)}</span>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* Terms */}
                        <label className="ev-modal__terms">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="ev-modal__checkbox"
                            />
                            <span>
                                I agree that funds will be held in escrow and released only upon milestone approval.
                            </span>
                        </label>

                        {/* Error */}
                        {error && (
                            <div className="ev-modal__error">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="ev-modal__footer">
                        <button className="ev-modal__btn ev-modal__btn--secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="ev-modal__btn ev-modal__btn--primary"
                            onClick={handleSubmit}
                            disabled={submitting || !agreed || numAmount <= 0}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={14} className="ev-modal__spinner" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Shield size={14} />
                                    Fund Escrow
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FundCampaignModal;
