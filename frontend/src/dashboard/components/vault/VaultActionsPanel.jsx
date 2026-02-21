import React, { memo } from 'react';

/**
 * VaultActionsPanel — Three action buttons: Add Funds, Withdraw Capital, Allocate to Campaign.
 */
function VaultActionsPanel({ onAddFunds, onWithdraw, onAllocate }) {
    return (
        <div className="vault-actions-card">
            <h3 className="vault-actions-card__title">Vault Actions</h3>
            <div className="vault-actions-card__list">
                <button className="vault-action-btn vault-action-btn--primary" onClick={onAddFunds}>
                    <div className="vault-action-btn__left">
                        <div className="vault-action-btn__icon vault-action-btn__icon--primary">
                            <span className="material-symbols-outlined">add_card</span>
                        </div>
                        <div className="vault-action-btn__text">
                            <p className="vault-action-btn__label">Add Funds</p>
                            <p className="vault-action-btn__hint">Deposit via Wire or ACH</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined vault-action-btn__arrow">arrow_forward</span>
                </button>

                <button className="vault-action-btn vault-action-btn--secondary" onClick={onWithdraw}>
                    <div className="vault-action-btn__left">
                        <div className="vault-action-btn__icon vault-action-btn__icon--secondary">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div className="vault-action-btn__text">
                            <p className="vault-action-btn__label">Withdraw Capital</p>
                            <p className="vault-action-btn__hint">Transfer to linked bank</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined vault-action-btn__arrow">arrow_forward</span>
                </button>

                <button className="vault-action-btn vault-action-btn--secondary" onClick={onAllocate}>
                    <div className="vault-action-btn__left">
                        <div className="vault-action-btn__icon vault-action-btn__icon--secondary">
                            <span className="material-symbols-outlined">handshake</span>
                        </div>
                        <div className="vault-action-btn__text">
                            <p className="vault-action-btn__label">Allocate to Campaign</p>
                            <p className="vault-action-btn__hint">Fund new influencer escrow</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined vault-action-btn__arrow">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}

export default memo(VaultActionsPanel);
