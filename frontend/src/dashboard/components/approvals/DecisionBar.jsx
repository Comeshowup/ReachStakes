import React from 'react';
import { CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';

/**
 * DecisionBar — Sticky bottom bar with Approve & Request Changes actions.
 * Shows escrow amount dynamically and keyboard hints.
 */
const DecisionBar = ({ item, onApprove, onRequestChanges, isLoading, batchMode, batchCount }) => {
    if (!item && !batchMode) return null;

    const escrowLabel = batchMode && batchCount > 0
        ? `${batchCount} item${batchCount > 1 ? 's' : ''} selected`
        : item?.escrow > 0
            ? `₹${item.escrow.toLocaleString('en-IN')} will be released upon approval`
            : 'No escrow attached';

    return (
        <div className="aq-decision-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-3)' }}>
                <span style={{
                    fontSize: 13,
                    color: item?.escrow > 0 ? 'var(--bd-aq-escrow-text)' : 'var(--bd-text-muted)',
                    fontWeight: 500
                }}>
                    {escrowLabel}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-3)' }}>
                <button
                    className="aq-btn-changes"
                    onClick={onRequestChanges}
                    disabled={isLoading}
                >
                    <RotateCcw size={15} />
                    Request Changes
                    <span className="aq-kbd" style={{ marginLeft: 4 }}>R</span>
                </button>

                <button
                    className="aq-btn-approve"
                    onClick={onApprove}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <CheckCircle2 size={16} />
                    )}
                    Approve & Release Escrow
                    <span className="aq-kbd" style={{
                        marginLeft: 4,
                        borderColor: 'rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.8)'
                    }}>A</span>
                </button>
            </div>
        </div>
    );
};

export default DecisionBar;
