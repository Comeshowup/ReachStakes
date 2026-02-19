import React from 'react';
import { Wallet, TrendingUp, PieChart, DollarSign } from 'lucide-react';

/**
 * FinancialSnapshot — Compact financial card showing escrow, fee, budget, and ROAS.
 */
const FinancialSnapshot = ({ escrow = 0, creatorFee = 0, budgetRemaining = 0, roas = null }) => {
    const formatCurrency = (val) => {
        if (val === 0) return '—';
        return `₹${val.toLocaleString('en-IN')}`;
    };

    return (
        <div className="aq-financial">
            <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)',
                marginBottom: 'var(--bd-space-4)'
            }}>
                <Wallet size={15} style={{ color: 'var(--bd-aq-accent-bar)' }} />
                <span style={{
                    fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: 'var(--bd-text-muted)'
                }}>
                    Financial Snapshot
                </span>
            </div>

            <div className="aq-financial__grid">
                <div>
                    <div className="aq-financial__label">Escrow Locked</div>
                    <div className="aq-financial__value aq-financial__value--escrow">
                        {formatCurrency(escrow)}
                    </div>
                </div>
                <div>
                    <div className="aq-financial__label">Creator Fee</div>
                    <div className="aq-financial__value">{formatCurrency(creatorFee)}</div>
                </div>
                <div>
                    <div className="aq-financial__label">Budget Left</div>
                    <div className="aq-financial__value">{formatCurrency(budgetRemaining)}</div>
                </div>
                <div>
                    <div className="aq-financial__label">
                        {roas !== null ? 'ROAS' : 'Pacing'}
                    </div>
                    <div className="aq-financial__value" style={{
                        display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        {roas !== null ? (
                            <>
                                <TrendingUp size={14} style={{ color: 'var(--bd-success)' }} />
                                {roas}x
                            </>
                        ) : (
                            <>
                                <PieChart size={14} style={{ color: 'var(--bd-info)' }} />
                                On track
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialSnapshot;
