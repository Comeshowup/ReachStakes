import React from 'react';
import { CreditCard, Lock, CheckCircle, Clock, DollarSign } from 'lucide-react';

/**
 * Payment status tab — campaign fee, escrow, milestones.
 */
const PaymentStatus = ({ payment }) => {
    if (!payment) {
        return (
            <div
                className="rounded-xl text-center py-12"
                style={{
                    background: 'var(--bd-surface-panel)',
                    border: '1px solid var(--bd-border-subtle)',
                }}
            >
                <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                    Payment details not available
                </p>
            </div>
        );
    }

    const escrowStatusConfig = {
        'Locked': { color: 'rgb(52, 211, 153)', icon: Lock, label: 'Escrow Locked' },
        'Not Funded': { color: 'rgb(251, 191, 36)', icon: Clock, label: 'Not Yet Funded' },
        'Released': { color: 'rgb(96, 165, 250)', icon: CheckCircle, label: 'Released' },
    };

    const escrow = escrowStatusConfig[payment.escrowStatus] || escrowStatusConfig['Not Funded'];
    const EscrowIcon = escrow.icon;

    return (
        <div className="space-y-4">
            {/* Payment Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Campaign Fee */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <DollarSign className="w-5 h-5 mb-3" style={{ color: 'rgb(52, 211, 153)' }} />
                    <p className="text-2xl font-bold" style={{ color: 'var(--bd-text-primary)' }}>
                        {payment.campaignFee ? `$${parseFloat(payment.campaignFee).toLocaleString()}` : '—'}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                        Campaign Fee
                    </p>
                </div>

                {/* Escrow Status */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <EscrowIcon className="w-5 h-5 mb-3" style={{ color: escrow.color }} />
                    <p className="text-lg font-bold" style={{ color: 'var(--bd-text-primary)' }}>
                        {escrow.label}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                        Escrow Status
                    </p>
                </div>

                {/* Payment Release */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <Clock className="w-5 h-5 mb-3" style={{ color: 'var(--bd-text-secondary)' }} />
                    <p className="text-lg font-bold" style={{ color: 'var(--bd-text-primary)' }}>
                        {payment.paymentStatus || 'Awaiting Approval'}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                        Payment Release
                    </p>
                </div>
            </div>

            {/* Milestones */}
            {payment.milestones && payment.milestones.length > 0 && (
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--bd-text-primary)' }}>
                        <CreditCard className="w-4 h-4" style={{ color: 'var(--bd-accent-primary)' }} />
                        Payment Milestones
                    </h3>
                    <div className="space-y-3">
                        {payment.milestones.map((milestone, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-lg"
                                style={{
                                    background: milestone.completed ? 'rgba(52, 211, 153, 0.05)' : 'var(--bd-surface-input)',
                                    border: `1px solid ${milestone.completed ? 'rgba(52, 211, 153, 0.2)' : 'var(--bd-border-subtle)'}`,
                                }}
                            >
                                {milestone.completed ? (
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(52, 211, 153)' }} />
                                ) : (
                                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--bd-text-secondary)' }} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: milestone.completed ? 'rgb(52, 211, 153)' : 'var(--bd-text-primary)' }}
                                    >
                                        {milestone.title || milestone.name}
                                    </span>
                                    {milestone.dueDate && (
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                {milestone.amount && (
                                    <span className="text-sm font-bold flex-shrink-0" style={{ color: 'rgb(52, 211, 153)' }}>
                                        ${milestone.amount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentStatus;
