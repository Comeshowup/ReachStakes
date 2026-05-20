import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    CheckCircle,
    XCircle,
    DollarSign,
    Calendar,
    Loader2,
    ArrowRight,
    Repeat2,
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const formatPaymentModel = (model) => {
    const labels = {
        flat_fee: 'Flat per video',
        cpm: 'CPM based',
        hybrid: 'Hybrid',
        milestone: 'Milestone based',
    };
    return labels[model] || String(model || 'flat_fee').replace(/_/g, ' ');
};

const toList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map((item) => typeof item === 'string' ? item : item?.title || item?.label)
            .filter(Boolean);
    }
    if (typeof value === 'object') {
        return Object.entries(value).map(([key, status]) => `${key}${typeof status === 'string' ? `: ${status}` : ''}`);
    }
    return [];
};

/**
 * A single invitation card with Accept / Decline actions.
 */
const InvitationCard = ({ invitation, onResponded }) => {
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);
    const [countering, setCountering] = useState(false);
    const [counterOpen, setCounterOpen] = useState(false);
    const [counterAmount, setCounterAmount] = useState('');
    const [counterNote, setCounterNote] = useState('');
    const [done, setDone] = useState(null); // 'accepted' | 'declined' | 'countered'

    const respond = async (action) => {
        const setter = action === 'accept' ? setAccepting : setDeclining;
        setter(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/campaigns/respond/${invitation.id}`,
                { action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDone(action === 'accept' ? 'accepted' : 'declined');
            // Delay removal so user sees the confirmation state
            setTimeout(() => onResponded(invitation.id, action), 1200);
        } catch (err) {
            console.error('Failed to respond to invite:', err);
            alert(err.response?.data?.message || 'Failed to respond. Please try again.');
        } finally {
            setter(false);
        }
    };

    const counter = async () => {
        const amount = Number(counterAmount);
        if (!amount || amount <= 0) {
            alert('Enter a valid counter amount.');
            return;
        }

        setCountering(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/collaborations/${invitation.id}/negotiate`,
                {
                    action: 'counter',
                    proposedPrice: amount,
                    pricingModel: invitation.pricingModel || 'flat_fee',
                    estimatedViews: invitation.estimatedViews || undefined,
                    message: counterNote || undefined,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDone('countered');
        } catch (err) {
            console.error('Failed to counter offer:', err);
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to send counter offer.');
        } finally {
            setCountering(false);
        }
    };

    const campaignTitle = invitation.campaignTitle || invitation.title || 'Campaign';
    const brandName = invitation.brandName || 'Brand';
    const brandLogo = invitation.brandLogo;
    const budget = invitation.proposedPrice || invitation.agreedPrice
        ? `$${parseFloat(invitation.proposedPrice || invitation.agreedPrice).toLocaleString()}`
        : null;
    const currentOffer = invitation.offerTerms?.currentOffer || {};
    const offerOwner = currentOffer.proposedBy || 'brand';
    const awaitingBrand = offerOwner === 'creator';
    const paymentModel = formatPaymentModel(invitation.pricingModel || currentOffer.pricingModel);
    const deliverableList = toList(invitation.deliverables).length
        ? toList(invitation.deliverables)
        : toList(currentOffer.deliverables).length
            ? toList(currentOffer.deliverables)
            : toList(invitation.milestones).length
                ? toList(invitation.milestones)
                : toList(currentOffer.milestones);
    const brandNote = currentOffer.message || invitation.feedback;
    const estimatedViews = invitation.estimatedViews || currentOffer.estimatedViews;
    const calculatedCpm = invitation.calculatedCpm || currentOffer.calculatedCpm;
    const deadline = invitation.deadline
        ? new Date(invitation.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;
    const platform = invitation.platform || null;
    const receivedDate = new Date(invitation.date || invitation.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: done === 'accepted' ? 60 : -60 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{
                background: 'var(--bd-surface-panel)',
                border: done ? `1px solid ${done === 'accepted' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.2)'}` : '1px solid var(--bd-border-subtle)',
            }}
        >
            {/* Brand avatar */}
            <div className="flex-shrink-0">
                {brandLogo ? (
                    <img
                        src={brandLogo}
                        alt={brandName}
                        className="w-12 h-12 rounded-xl object-cover"
                    />
                ) : (
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'var(--bd-accent-primary)' }}
                    >
                        {brandName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Campaign info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                    {brandName}
                </p>
                <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--bd-text-primary)' }}>
                    {campaignTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {budget && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                            <DollarSign className="w-3 h-3" />{budget}
                        </span>
                    )}
                    {deadline && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                            <Calendar className="w-3 h-3" />Due {deadline}
                        </span>
                    )}
                    {platform && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-secondary)' }}
                        >
                            {platform}
                        </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--bd-text-muted)' }}>
                        Received {receivedDate}
                    </span>
                </div>
                <div className="mt-3 rounded-lg p-3 text-xs" style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-secondary)' }}>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong style={{ color: 'var(--bd-text-primary)' }}>Model:</strong> {paymentModel}</span>
                        {budget && <span><strong style={{ color: 'var(--bd-text-primary)' }}>Offer:</strong> {budget}</span>}
                        {estimatedViews && (
                            <span><strong style={{ color: 'var(--bd-text-primary)' }}>Views:</strong> {Number(estimatedViews).toLocaleString()}</span>
                        )}
                        {calculatedCpm && (
                            <span><strong style={{ color: 'var(--bd-text-primary)' }}>CPM:</strong> ${Number(calculatedCpm).toFixed(2)}</span>
                        )}
                    </div>
                    {deliverableList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {deliverableList.slice(0, 5).map((deliverable, index) => (
                                <span
                                    key={`${deliverable}-${index}`}
                                    className="px-2 py-1 rounded-md"
                                    style={{ background: 'var(--bd-surface-panel)', color: 'var(--bd-text-secondary)' }}
                                >
                                    {deliverable}
                                </span>
                            ))}
                        </div>
                    )}
                    {brandNote && (
                        <p className="mt-2 line-clamp-2" style={{ color: 'var(--bd-text-muted)' }}>
                            {brandNote}
                        </p>
                    )}
                </div>
                {awaitingBrand && (
                    <div className="mt-2 text-xs font-medium" style={{ color: 'var(--bd-warning)' }}>
                        Your counter is waiting for brand approval.
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
                {done === 'accepted' ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
                        <CheckCircle className="w-4 h-4" /> Accepted!
                    </span>
                ) : done === 'declined' ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                        <XCircle className="w-4 h-4" /> Declined
                    </span>
                ) : done === 'countered' ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                        <Repeat2 className="w-4 h-4" /> Counter sent
                    </span>
                ) : awaitingBrand ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                        <Repeat2 className="w-4 h-4" /> Awaiting brand
                    </span>
                ) : (
                    <>
                        <button
                            onClick={() => respond('decline')}
                            disabled={accepting || declining}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                            style={{
                                border: '1px solid var(--bd-border-subtle)',
                                color: 'var(--bd-text-secondary)',
                                background: 'transparent',
                            }}
                        >
                            {declining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            Decline
                        </button>
                        <button
                            onClick={() => setCounterOpen((v) => !v)}
                            disabled={accepting || declining}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                            style={{
                                border: '1px solid var(--bd-border-subtle)',
                                color: 'var(--bd-text-secondary)',
                                background: 'transparent',
                            }}
                        >
                            <Repeat2 className="w-3.5 h-3.5" />
                            Counter
                        </button>
                        <button
                            onClick={() => respond('accept')}
                            disabled={accepting || declining}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-sm hover:brightness-110 active:scale-95"
                            style={{ background: 'var(--bd-accent-primary)' }}
                        >
                            {accepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Accept
                            {!accepting && <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                    </>
                )}
            </div>
            {counterOpen && !done && (
                <div className="sm:ml-16 sm:col-span-2 w-full border-t pt-4 mt-1" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-2">
                        <input
                            type="number"
                            min="0"
                            placeholder="Counter amount"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            className="px-3 py-2 rounded-lg border text-sm dark:bg-zinc-900 dark:text-white"
                            style={{ borderColor: 'var(--bd-border-subtle)' }}
                        />
                        <input
                            placeholder={`Counter note for ${brandName}`}
                            value={counterNote}
                            onChange={(e) => setCounterNote(e.target.value)}
                            className="px-3 py-2 rounded-lg border text-sm dark:bg-zinc-900 dark:text-white"
                            style={{ borderColor: 'var(--bd-border-subtle)' }}
                        />
                        <button
                            onClick={counter}
                            disabled={countering}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                            style={{ background: 'var(--bd-accent-primary)' }}
                        >
                            {countering ? 'Sending...' : 'Send Counter'}
                        </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--bd-text-muted)' }}>
                        Current offer: {budget || 'No amount'} · {paymentModel}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

/**
 * InvitationsList — renders all pending brand invitations for the creator.
 */
const InvitationsList = ({ invitations = [], loading = false, onResponded }) => {
    const [localInvitations, setLocalInvitations] = useState(invitations);

    // Sync when parent invitations prop changes
    React.useEffect(() => {
        setLocalInvitations(invitations);
    }, [invitations]);

    const handleResponded = (id, action) => {
        setLocalInvitations(prev => prev.filter(inv => inv.id !== id));
        if (onResponded) onResponded(id, action);
    };

    if (loading) {
        return (
            <div
                className="rounded-xl flex items-center justify-center py-16"
                style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}
            >
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--bd-accent-primary)' }} />
            </div>
        );
    }

    if (localInvitations.length === 0) {
        return (
            <div
                className="rounded-xl text-center py-16 px-6"
                style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}
            >
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-25" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--bd-text-secondary)' }}>
                    No pending invitations
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--bd-text-muted)' }}>
                    Brands will invite you directly when they want to work with you.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {localInvitations.map(inv => (
                    <InvitationCard
                        key={inv.id}
                        invitation={inv}
                        onResponded={handleResponded}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default InvitationsList;
