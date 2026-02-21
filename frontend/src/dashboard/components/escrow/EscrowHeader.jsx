import { Shield } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

/**
 * EscrowHeader — Clean institutional page header with trust badge.
 */
const EscrowHeader = () => {
    return (
        <header className="ev-header" role="banner">
            <div className="ev-header__content">
                <div className="ev-header__title-group">
                    <h1 className="ev-header__title">Escrow Vault</h1>
                    <p className="ev-header__subtitle">
                        Capital management with milestone-based releases
                    </p>
                </div>
                <div className="ev-header__actions">
                    <span className="ev-header__timestamp" aria-label="Last updated">
                        Updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                        className="ev-header__trust-badge"
                        data-tooltip-id="ev-trust-tooltip"
                        data-tooltip-content="All funds are securely held in escrow until milestones are verified and approved. Protected by transaction-level atomicity and audit-trail accounting."
                        role="status"
                        aria-label="Escrow Protected"
                    >
                        <span className="ev-header__trust-icon">
                            <Shield size={13} />
                        </span>
                        <span>Escrow Protected</span>
                    </div>
                    <Tooltip
                        id="ev-trust-tooltip"
                        place="bottom-end"
                        className="ev-tooltip"
                    />
                </div>
            </div>
        </header>
    );
};

export default EscrowHeader;
