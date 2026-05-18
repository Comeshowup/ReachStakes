import React from 'react';
import { CreditCard, Lock, CheckCircle, Clock, DollarSign, AlertCircle, Banknote } from 'lucide-react';

/**
 * PaymentStatus — creator workspace payment tab.
 * Shows negotiated fee, escrow status, and payout release state.
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

    const hasAgreedPrice = payment.agreedPrice != null && payment.agreedPrice > 0;

    const escrowStatusConfig = {
        'Locked':     { color: 'rgb(52, 211, 153)',  icon: Lock,         label: 'Escrow Locked' },
        'Not Funded': { color: 'rgb(251, 191, 36)',  icon: Clock,        label: 'Not Yet Funded' },
        'Released':   { color: 'rgb(96, 165, 250)',  icon: CheckCircle,  label: 'Released' },
    };

    const paymentStatusConfig = {
        'Released':         { color: 'rgb(52, 211, 153)',  icon: CheckCircle,  label: 'Payment Released' },
        'Pending Release':  { color: 'rgb(251, 191, 36)',  icon: Clock,        label: 'Pending Release' },
        'Awaiting Approval':{ color: 'var(--bd-text-secondary)', icon: Clock,  label: 'Awaiting Approval' },
    };

    const escrow = escrowStatusConfig[payment.escrowStatus] || escrowStatusConfig['Not Funded'];
    const EscrowIcon = escrow.icon;

    const payout = paymentStatusConfig[payment.paymentStatus] || paymentStatusConfig['Awaiting Approval'];
    const PayoutIcon = payout.icon;

    return (
        <div className="space-y-4">

            {/* ── Negotiated Fee Hero ─────────────────────────────────── */}
            <div
                className="rounded-xl p-6"
                style={{
                    background: hasAgreedPrice
                        ? 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(96,165,250,0.06) 100%)'
                        : 'var(--bd-surface-panel)',
                    border: `1px solid ${hasAgreedPrice ? 'rgba(52,211,153,0.25)' : 'var(--bd-border-subtle)'}`,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <Banknote
                        className="w-5 h-5"
                        style={{ color: hasAgreedPrice ? 'rgb(52,211,153)' : 'var(--bd-text-secondary)' }}
                    />
                    <p
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--bd-text-secondary)' }}
                    >
                        Agreed Payment Per Video
                    </p>
                </div>

                {hasAgreedPrice ? (
                    <p
                        className="text-4xl font-bold"
                        style={{ color: 'rgb(52,211,153)', letterSpacing: '-0.02em' }}
                    >
                        ${parseFloat(payment.agreedPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <AlertCircle className="w-4 h-4" style={{ color: 'rgb(251,191,36)' }} />
                        <p className="text-sm font-medium" style={{ color: 'rgb(251,191,36)' }}>
                            No payment set — awaiting brand negotiation
                        </p>
                    </div>
                )}

                {payment.payoutReleased && payment.payoutDate && (
                    <p className="text-xs mt-2" style={{ color: 'var(--bd-text-secondary)' }}>
                        Released on {new Date(payment.payoutDate).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                )}
            </div>

            {/* ── Status Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <PayoutIcon className="w-5 h-5 mb-3" style={{ color: payout.color }} />
                    <p className="text-lg font-bold" style={{ color: 'var(--bd-text-primary)' }}>
                        {payout.label}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                        Payment Release
                    </p>
                </div>
            </div>

            {/* ── How payment works banner ─────────────────────────────── */}
            {!payment.payoutReleased && (
                <div
                    className="rounded-xl p-4"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--bd-text-secondary)' }}>
                        How payment works
                    </p>
                    <ol className="space-y-1.5">
                        {[
                            { step: 1, text: 'Brand sets your agreed fee when accepting your application', done: hasAgreedPrice },
                            { step: 2, text: 'You submit your video for review', done: false },
                            { step: 3, text: 'Brand approves the content', done: false },
                            { step: 4, text: 'Payment is automatically released to your account', done: payment.payoutReleased },
                        ].map(({ step, text, done }) => (
                            <li key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <span
                                    style={{
                                        minWidth: 20, height: 20, borderRadius: '50%',
                                        background: done ? 'rgba(52,211,153,0.15)' : 'var(--bd-muted)',
                                        border: `1px solid ${done ? 'rgba(52,211,153,0.4)' : 'var(--bd-border-subtle)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.625rem', fontWeight: 700,
                                        color: done ? 'rgb(52,211,153)' : 'var(--bd-text-muted)',
                                    }}
                                >
                                    {done ? '✓' : step}
                                </span>
                                <span className="text-xs leading-5" style={{ color: done ? 'rgb(52,211,153)' : 'var(--bd-text-secondary)' }}>
                                    {text}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* ── Milestones ──────────────────────────────────────────── */}
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
                                    background: milestone.completed ? 'rgba(52,211,153,0.05)' : 'var(--bd-surface-input)',
                                    border: `1px solid ${milestone.completed ? 'rgba(52,211,153,0.2)' : 'var(--bd-border-subtle)'}`,
                                }}
                            >
                                {milestone.completed ? (
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(52,211,153)' }} />
                                ) : (
                                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--bd-text-secondary)' }} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium" style={{ color: milestone.completed ? 'rgb(52,211,153)' : 'var(--bd-text-primary)' }}>
                                        {milestone.title || milestone.name}
                                    </span>
                                    {milestone.dueDate && (
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                {milestone.amount && (
                                    <span className="text-sm font-bold flex-shrink-0" style={{ color: 'rgb(52,211,153)' }}>
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
