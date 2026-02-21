import React, { useState, useMemo, memo } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useVaultCampaigns } from '../../../hooks/useVaultData';

/**
 * AllocateCampaignModal — Allocate vault funds to a campaign.
 * Auto-computes required amount from targetBudget + fees.
 * If insufficient balance, redirects to Add Funds with minimum pre-filled.
 */
function AllocateCampaignModal({ isOpen, onClose, onSubmit, isSubmitting, availableBalance = 0, onInsufficientFunds }) {
    const [campaignId, setCampaignId] = useState('');
    const [error, setError] = useState('');
    const { data: campaigns = [], isLoading: loadingCampaigns } = useVaultCampaigns();

    const selectedCampaign = campaigns.find(c => String(c.id) === String(campaignId));

    // Compute the required allocation for the selected campaign
    const allocation = useMemo(() => {
        if (!selectedCampaign) return null;

        const breakdown = selectedCampaign.allocationBreakdown;
        if (!breakdown) {
            // Fallback: compute locally if backend didn't provide it
            const budget = selectedCampaign.targetBudget || 0;
            const platformFee = parseFloat((budget * 0.05).toFixed(2));
            const processingFee = parseFloat((budget * 0.029).toFixed(2));
            return {
                targetBudget: budget,
                platformFee,
                processingFee,
                platformFeePercent: 5,
                processingFeePercent: 2.9,
                totalRequired: parseFloat((budget + platformFee + processingFee).toFixed(2)),
            };
        }

        return breakdown;
    }, [selectedCampaign]);

    // Amount already funded vs. what's still needed
    const alreadyFunded = selectedCampaign?.fundedAmount || 0;
    const totalRequired = allocation?.totalRequired || 0;
    const remainingNeeded = Math.max(0, parseFloat((totalRequired - alreadyFunded).toFixed(2)));
    const isInsufficient = remainingNeeded > availableBalance;
    const shortfall = Math.max(0, parseFloat((remainingNeeded - availableBalance).toFixed(2)));

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!campaignId) {
            setError('Please select a campaign.');
            return;
        }

        if (remainingNeeded <= 0) {
            setError('This campaign is already fully funded.');
            return;
        }

        if (isInsufficient) {
            // Redirect to Add Funds modal with shortfall as minimum
            onInsufficientFunds?.({
                minimumAmount: shortfall,
                campaignName: selectedCampaign?.name || 'campaign',
                fullAmount: remainingNeeded,
            });
            onClose();
            return;
        }

        try {
            await onSubmit({ campaignId: parseInt(campaignId), amount: remainingNeeded });
            toast.success(`Allocated ${formatCurrency(remainingNeeded)} to ${selectedCampaign?.name || 'campaign'}`);
            setCampaignId('');
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Allocation failed. Please try again.');
        }
    };

    return (
        <div className="vault-modal-overlay" onClick={onClose}>
            <div className="vault-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="allocate-title">
                <div className="vault-modal__header">
                    <h2 id="allocate-title" className="vault-modal__title">Allocate to Campaign</h2>
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
                            Campaign
                            <select
                                className="vault-modal__select"
                                value={campaignId}
                                onChange={(e) => { setCampaignId(e.target.value); setError(''); }}
                                disabled={loadingCampaigns}
                                required
                            >
                                <option value="">
                                    {loadingCampaigns ? 'Loading campaigns...' : 'Select a campaign'}
                                </option>
                                {campaigns.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — Budget: {formatCurrency(c.targetBudget || 0)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Fee Breakdown */}
                        {selectedCampaign && allocation && (
                            <div className="vault-modal__fee-breakdown">
                                <h4 className="vault-modal__fee-title">Allocation Breakdown</h4>
                                <div className="vault-modal__fee-row">
                                    <span>Target Budget</span>
                                    <span>{formatCurrency(allocation.targetBudget)}</span>
                                </div>
                                <div className="vault-modal__fee-row vault-modal__fee-row--sub">
                                    <span>Platform Fee ({allocation.platformFeePercent}%)</span>
                                    <span>{formatCurrency(allocation.platformFee)}</span>
                                </div>
                                <div className="vault-modal__fee-row vault-modal__fee-row--sub">
                                    <span>Processing Fee ({allocation.processingFeePercent}%)</span>
                                    <span>{formatCurrency(allocation.processingFee)}</span>
                                </div>
                                <div className="vault-modal__fee-divider" />
                                <div className="vault-modal__fee-row vault-modal__fee-row--total">
                                    <span>Total Required</span>
                                    <span>{formatCurrency(totalRequired)}</span>
                                </div>
                                {alreadyFunded > 0 && (
                                    <div className="vault-modal__fee-row vault-modal__fee-row--sub">
                                        <span>Already Funded</span>
                                        <span>−{formatCurrency(alreadyFunded)}</span>
                                    </div>
                                )}
                                <div className="vault-modal__fee-row vault-modal__fee-row--lock">
                                    <span>Amount to Lock</span>
                                    <strong>{formatCurrency(remainingNeeded)}</strong>
                                </div>

                                {/* Impact preview */}
                                {!isInsufficient && remainingNeeded > 0 && (
                                    <p className="vault-modal__impact">
                                        Available after allocation: <strong>{formatCurrency(availableBalance - remainingNeeded)}</strong>
                                    </p>
                                )}

                                {/* Insufficient funds warning */}
                                {isInsufficient && (
                                    <div className="vault-modal__insufficient">
                                        <span className="material-symbols-outlined vault-modal__insufficient-icon">warning</span>
                                        <div>
                                            <p className="vault-modal__insufficient-title">Insufficient Vault Balance</p>
                                            <p className="vault-modal__insufficient-text">
                                                You need {formatCurrency(shortfall)} more to fund this campaign.
                                                Add funds first, then retry allocation.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Fully funded notice */}
                                {remainingNeeded <= 0 && (
                                    <div className="vault-modal__funded-notice">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        <span>This campaign is already fully funded.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <p className="vault-modal__error">{error}</p>}
                    </div>
                    <div className="vault-modal__footer">
                        <button type="button" className="vault-modal__btn vault-modal__btn--cancel" onClick={onClose}>Cancel</button>
                        {isInsufficient ? (
                            <button
                                type="submit"
                                className="vault-modal__btn vault-modal__btn--submit vault-modal__btn--warning"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>add_card</span>
                                Add Funds ({formatCurrency(shortfall)})
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="vault-modal__btn vault-modal__btn--submit"
                                disabled={!campaignId || remainingNeeded <= 0 || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="vault-modal__spinner" />
                                ) : (
                                    <>Lock {remainingNeeded > 0 ? formatCurrency(remainingNeeded) : ''}</>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(AllocateCampaignModal);
