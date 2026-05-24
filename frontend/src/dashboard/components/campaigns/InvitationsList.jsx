import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    ExternalLink,
    Tag,
    Target,
    Clock,
    FileText,
    Eye,
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

const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', options);
};

const formatMoney = (value) => {
    const amount = Number(value);
    if (!amount || Number.isNaN(amount)) return null;
    return `$${amount.toLocaleString()}`;
};

const formatNumber = (value) => {
    const number = Number(value);
    if (!number || Number.isNaN(number)) return null;
    return number.toLocaleString();
};

const getCampaignData = (invitation) => invitation.campaign || {};

const MetricTile = ({ icon: Icon, label, value, accent = 'var(--bd-text-primary)' }) => (
    <div
        className="min-w-0 rounded-xl p-3"
        style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--bd-text-muted)' }}>
                {label}
            </span>
        </div>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--bd-text-primary)' }}>
            {value || '—'}
        </p>
    </div>
);

const InvitationSkeleton = () => (
    <div
        className="rounded-2xl p-5 animate-pulse"
        style={{
            background: 'var(--bd-surface-panel)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
                    <div className="flex-1 min-w-0">
                        <div className="h-3 w-28 rounded mb-3" style={{ background: 'var(--bd-surface-input)' }} />
                        <div className="h-5 w-2/3 rounded mb-3" style={{ background: 'var(--bd-surface-input)' }} />
                        <div className="h-3 w-40 rounded" style={{ background: 'var(--bd-surface-input)' }} />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
                    {[0, 1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="h-16 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
                    ))}
                </div>
                <div className="h-20 rounded-xl mt-4" style={{ background: 'var(--bd-surface-input)' }} />
            </div>
            <div className="lg:w-48 space-y-2">
                <div className="h-10 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
                <div className="h-10 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
                <div className="h-10 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
            </div>
        </div>
    </div>
);

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

    const campaignData = getCampaignData(invitation);
    const brandProfile = campaignData.brand?.brandProfile || {};
    const campaignTitle = invitation.campaignTitle || campaignData.title || invitation.title || 'Campaign';
    const brandName = invitation.brandName || brandProfile.companyName || campaignData.brand?.name || 'Brand';
    const brandLogo = invitation.brandLogo || brandProfile.logoUrl;
    const currentOffer = invitation.offerTerms?.currentOffer || {};
    const offerOwner = currentOffer.proposedBy || 'brand';
    const awaitingBrand = offerOwner === 'creator';
    const paymentModel = formatPaymentModel(invitation.pricingModel || currentOffer.pricingModel);
    const offerAmount = invitation.proposedPrice || invitation.agreedPrice || currentOffer.amount || currentOffer.proposedPrice;
    const budget = formatMoney(offerAmount);
    const deliverableList = toList(invitation.deliverables).length
        ? toList(invitation.deliverables)
        : toList(currentOffer.deliverables).length
            ? toList(currentOffer.deliverables)
            : toList(invitation.milestones).length
                ? toList(invitation.milestones)
                : toList(currentOffer.milestones);
    const brandNote = currentOffer.message || invitation.feedback || campaignData.description || campaignData.brief;
    const estimatedViews = invitation.estimatedViews || currentOffer.estimatedViews;
    const calculatedCpm = invitation.calculatedCpm || currentOffer.calculatedCpm;
    const deadline = formatDate(invitation.deadline || campaignData.deadline || campaignData.endDate);
    const platform = invitation.platform || campaignData.platformRequired || campaignData.platform || null;
    const campaignType = campaignData.contentType || campaignData.category || campaignData.niche || platform || 'Creator campaign';
    const receivedDate = formatDate(invitation.date || invitation.createdAt, { month: 'short', day: 'numeric' });
    const expiresDate = formatDate(invitation.offerExpiresAt, { month: 'short', day: 'numeric' });
    const visibleDeliverables = deliverableList.slice(0, 5);
    const hiddenDeliverableCount = Math.max(deliverableList.length - visibleDeliverables.length, 0);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: done === 'accepted' ? 60 : -60 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-5 md:p-6"
            style={{
                background: 'var(--bd-surface-panel)',
                border: done ? `1px solid ${done === 'accepted' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.2)'}` : '1px solid var(--bd-border-subtle)',
                boxShadow: '0 18px 50px rgba(0,0,0,0.16)',
            }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_210px] gap-5 lg:gap-6">
                <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="flex-shrink-0">
                                {brandLogo ? (
                                    <img
                                        src={brandLogo}
                                        alt={`${brandName} logo`}
                                        className="w-12 h-12 rounded-xl object-cover"
                                        style={{ border: '1px solid var(--bd-border-subtle)' }}
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                                        style={{ background: 'var(--bd-accent-primary)' }}
                                        aria-hidden="true"
                                    >
                                        {brandName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <p className="text-xs font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                                        {brandName}
                                    </p>
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                                        style={{
                                            background: 'rgba(99, 102, 241, 0.12)',
                                            color: 'var(--bd-accent-primary)',
                                            border: '1px solid rgba(99, 102, 241, 0.24)',
                                        }}
                                    >
                                        Invitation
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold leading-snug break-words" style={{ color: 'var(--bd-text-primary)' }}>
                                    {campaignTitle}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span
                                        className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                                        style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-secondary)' }}
                                    >
                                        <Tag className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{campaignType}</span>
                                    </span>
                                    {receivedDate && (
                                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--bd-text-muted)' }}>
                                            <Clock className="w-3 h-3" />
                                            Received {receivedDate}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {expiresDate && (
                            <div
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium sm:flex-shrink-0"
                                style={{
                                    background: 'rgba(245, 158, 11, 0.08)',
                                    border: '1px solid rgba(245, 158, 11, 0.24)',
                                    color: 'rgb(252, 211, 77)',
                                }}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                Expires {expiresDate}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
                        <MetricTile icon={DollarSign} label="Offer" value={budget} accent="rgb(52, 211, 153)" />
                        <MetricTile icon={FileText} label="Model" value={paymentModel} accent="rgb(167, 139, 250)" />
                        <MetricTile icon={Target} label="Deliverables" value={deliverableList.length ? `${deliverableList.length} item${deliverableList.length === 1 ? '' : 's'}` : null} accent="rgb(96, 165, 250)" />
                        <MetricTile icon={Calendar} label="Timeline" value={deadline ? `Due ${deadline}` : 'Flexible'} accent="rgb(251, 191, 36)" />
                        <MetricTile icon={Eye} label="Views goal" value={formatNumber(estimatedViews)} accent="rgb(45, 212, 191)" />
                        <MetricTile icon={Target} label="CPM" value={calculatedCpm ? `$${Number(calculatedCpm).toFixed(2)}` : null} accent="rgb(248, 113, 113)" />
                    </div>

                    {visibleDeliverables.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4" aria-label="Requested deliverables">
                            {visibleDeliverables.map((deliverable, index) => (
                                <span
                                    key={`${deliverable}-${index}`}
                                    className="max-w-full truncate rounded-lg px-2.5 py-1 text-xs font-medium"
                                    title={deliverable}
                                    style={{
                                        background: 'rgba(255,255,255,0.035)',
                                        border: '1px solid var(--bd-border-subtle)',
                                        color: 'var(--bd-text-secondary)',
                                    }}
                                >
                                    {deliverable}
                                </span>
                            ))}
                            {hiddenDeliverableCount > 0 && (
                                <span
                                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                                    style={{
                                        background: 'rgba(255,255,255,0.035)',
                                        border: '1px solid var(--bd-border-subtle)',
                                        color: 'var(--bd-text-muted)',
                                    }}
                                >
                                    +{hiddenDeliverableCount} more
                                </span>
                            )}
                        </div>
                    )}

                    <div
                        className="mt-4 rounded-xl p-4"
                        style={{
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid var(--bd-border-subtle)',
                        }}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--bd-text-muted)' }}>
                            Invitation message
                        </p>
                        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--bd-text-secondary)' }}>
                            {brandNote || `${brandName} invited you to review this campaign proposal before responding.`}
                        </p>
                    </div>

                    {awaitingBrand && (
                        <span
                            className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium"
                            style={{ color: 'rgb(252, 211, 77)' }}
                        >
                            <Repeat2 className="w-3.5 h-3.5" />
                            Your counter is waiting for brand approval.
                        </span>
                    )}
                </div>

                <aside className="lg:border-l lg:pl-5" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                    <div className="flex flex-col gap-2">
                        <Link
                            to={`/creator/campaigns/${invitation.id}`}
                            aria-label={`View campaign details for ${campaignTitle}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.99]"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--bd-border-subtle)',
                                color: 'var(--bd-text-primary)',
                            }}
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Campaign
                        </Link>

                        {done === 'accepted' ? (
                            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-green-500">
                                <CheckCircle className="w-4 h-4" /> Accepted
                            </span>
                        ) : done === 'declined' ? (
                            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                                <XCircle className="w-4 h-4" /> Declined
                            </span>
                        ) : done === 'countered' ? (
                            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                                <Repeat2 className="w-4 h-4" /> Counter sent
                            </span>
                        ) : awaitingBrand ? (
                            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                                <Repeat2 className="w-4 h-4" /> Awaiting brand
                            </span>
                        ) : (
                            <>
                                <button
                                    onClick={() => respond('accept')}
                                    disabled={accepting || declining}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-sm hover:brightness-110 active:scale-[0.99]"
                                    style={{ background: 'var(--bd-accent-primary)' }}
                                >
                                    {accepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                    Accept
                                    {!accepting && <ArrowRight className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    onClick={() => setCounterOpen((v) => !v)}
                                    disabled={accepting || declining}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                                    style={{
                                        border: '1px solid var(--bd-border-subtle)',
                                        color: 'var(--bd-text-primary)',
                                        background: 'transparent',
                                    }}
                                    aria-expanded={counterOpen}
                                >
                                    <Repeat2 className="w-3.5 h-3.5" />
                                    Counter
                                </button>
                                <button
                                    onClick={() => respond('decline')}
                                    disabled={accepting || declining}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                                    style={{
                                        border: '1px solid rgba(239,68,68,0.18)',
                                        color: 'rgb(248, 113, 113)',
                                        background: 'rgba(239,68,68,0.045)',
                                    }}
                                >
                                    {declining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                    Decline
                                </button>
                            </>
                        )}

                        <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--bd-text-muted)' }}>
                            Review the full campaign page before accepting the proposal.
                        </p>
                    </div>
                </aside>
            </div>

            {counterOpen && !done && !awaitingBrand && (
                <div className="w-full border-t pt-4 mt-5" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)_auto] gap-2">
                        <label className="sr-only" htmlFor={`counter-amount-${invitation.id}`}>
                            Counter amount
                        </label>
                        <input
                            id={`counter-amount-${invitation.id}`}
                            type="number"
                            min="0"
                            placeholder="Counter amount"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            className="px-3 py-2.5 rounded-xl border text-sm outline-none"
                            style={{
                                borderColor: 'var(--bd-border-subtle)',
                                background: 'var(--bd-surface-input)',
                                color: 'var(--bd-text-primary)',
                            }}
                        />
                        <label className="sr-only" htmlFor={`counter-note-${invitation.id}`}>
                            Counter note
                        </label>
                        <input
                            id={`counter-note-${invitation.id}`}
                            placeholder={`Counter note for ${brandName}`}
                            value={counterNote}
                            onChange={(e) => setCounterNote(e.target.value)}
                            className="px-3 py-2.5 rounded-xl border text-sm outline-none"
                            style={{
                                borderColor: 'var(--bd-border-subtle)',
                                background: 'var(--bd-surface-input)',
                                color: 'var(--bd-text-primary)',
                            }}
                        />
                        <button
                            onClick={counter}
                            disabled={countering}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                            style={{ background: 'var(--bd-accent-primary)' }}
                        >
                            {countering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
            <div className="space-y-4" aria-label="Loading invitations">
                <InvitationSkeleton />
                <InvitationSkeleton />
                <InvitationSkeleton />
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
                    New campaign proposals will appear here when brands send offers for you to review.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
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
