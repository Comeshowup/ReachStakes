import React, { memo } from 'react';

/**
 * StatementAlertCard — Blue info card for monthly statement notification.
 */
function StatementAlertCard() {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="vault-alert-card">
            <div className="vault-alert-card__inner">
                <span className="material-symbols-outlined vault-alert-card__icon">info</span>
                <div className="vault-alert-card__content">
                    <h4 className="vault-alert-card__title">Monthly Statement Ready</h4>
                    <p className="vault-alert-card__text">
                        Your {currentMonth} statement is now available for download. Review your escrow allocations.
                    </p>
                    <button
                        className="vault-alert-card__link"
                        onClick={() => {/* TODO: Download PDF */ }}
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(StatementAlertCard);
