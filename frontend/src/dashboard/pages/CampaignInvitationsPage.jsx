import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    DollarSign,
    Loader2,
    Repeat2,
    Search,
    UserPlus,
    X,
    XCircle,
} from 'lucide-react';
import { useCampaignDetail, useNegotiateCollaborationDeal } from '../../hooks/useCampaigns';
import InviteCreatorsModal from '../../features/campaigns/components/InviteCreatorsModal';

const CARD_STYLE = {
    borderRadius: 'var(--bd-radius-xl)',
    border: '1px solid var(--bd-border-default)',
    background: 'var(--bd-surface-elevated)',
    boxShadow: 'var(--bd-shadow-sm)',
};

const paymentModelLabel = (model) => ({
    flat_fee: 'Flat per video',
    cpm: 'CPM based',
    hybrid: 'Hybrid',
    milestone: 'Milestone based',
}[model] || String(model || 'flat_fee').replace(/_/g, ' '));

const dealState = (deal) => {
    const owner = deal.offerTerms?.currentOffer?.proposedBy || (deal.status === 'Applied' ? 'creator' : 'brand');
    if (deal.status === 'Rejected') return { label: 'Rejected', tone: 'danger', owner };
    if (deal.status === 'Applied') return { label: 'Application', tone: 'info', owner };
    if (owner === 'creator') return { label: 'Creator counter', tone: 'warning', owner };
    return { label: 'Awaiting creator', tone: 'muted', owner };
};

const statusTone = {
    warning: { bg: 'var(--bd-warning-muted)', color: 'var(--bd-warning)', border: 'var(--bd-warning-border)' },
    info: { bg: 'var(--bd-info-muted)', color: 'var(--bd-info)', border: 'var(--bd-info-border)' },
    danger: { bg: 'var(--bd-danger-muted)', color: 'var(--bd-danger)', border: 'var(--bd-danger-border)' },
    muted: { bg: 'var(--bd-muted)', color: 'var(--bd-text-secondary)', border: 'var(--bd-border-default)' },
};

const StatusPill = ({ state }) => {
    const tone = statusTone[state.tone] || statusTone.muted;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 999,
            fontSize: '0.75rem', fontWeight: 600,
            color: tone.color, background: tone.bg, border: `1px solid ${tone.border}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />
            {state.label}
        </span>
    );
};

const DealCard = ({ deal, onAccept, onReject, onCounter, isBusy }) => {
    const state = dealState(deal);
    const currentOffer = deal.offerTerms?.currentOffer || {};
    const price = Number(deal.proposedPrice || currentOffer.amount || 0);
    const canBrandAccept = state.owner === 'creator' && deal.status !== 'Rejected';

    return (
        <div style={{ ...CARD_STYLE, padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(280px, 1.4fr) auto', gap: 16, alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'var(--bd-muted)', color: 'var(--bd-text-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800,
                        }}>
                            {(deal.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--bd-text-primary)' }}>{deal.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)' }}>@{deal.handle || 'creator'}</div>
                        </div>
                    </div>
                    <StatusPill state={state} />
                </div>

                <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.8125rem', color: 'var(--bd-text-secondary)', marginBottom: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <DollarSign size={13} /> <strong style={{ color: 'var(--bd-text-primary)' }}>${price.toLocaleString()}</strong>
                        </span>
                        <span>{paymentModelLabel(deal.pricingModel || currentOffer.pricingModel)}</span>
                        {deal.estimatedViews && <span>{Number(deal.estimatedViews).toLocaleString()} views</span>}
                        {deal.calculatedCpm && <span>${Number(deal.calculatedCpm).toFixed(2)} CPM</span>}
                    </div>
                    {currentOffer.message && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--bd-text-muted)', lineHeight: 1.5 }}>
                            {currentOffer.message}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                    {deal.status !== 'Rejected' && (
                        <>
                            <button
                                className="bd-cm-btn-secondary"
                                style={{ padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                disabled={isBusy}
                                onClick={() => onReject(deal)}
                            >
                                <XCircle size={14} /> Reject
                            </button>
                            <button
                                className="bd-cm-btn-secondary"
                                style={{ padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                disabled={isBusy}
                                onClick={() => onCounter(deal)}
                            >
                                <Repeat2 size={14} /> Counter
                            </button>
                            {canBrandAccept && (
                                <button
                                    className="bd-cm-btn-primary"
                                    style={{ padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                    disabled={isBusy}
                                    onClick={() => onAccept(deal)}
                                >
                                    <CheckCircle size={14} /> Accept
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const CampaignInvitationsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data, isLoading, error } = useCampaignDetail(id);
    const { mutate: negotiateDeal, isPending: isNegotiating } = useNegotiateCollaborationDeal(id);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [filter, setFilter] = useState('open');
    const [query, setQuery] = useState('');
    const [counterModal, setCounterModal] = useState(null);
    const [counterAmount, setCounterAmount] = useState('');
    const [counterNote, setCounterNote] = useState('');

    useEffect(() => {
        if (searchParams.get('invite') !== '1') return;
        setInviteOpen(true);
        setSearchParams({}, { replace: true });
    }, [searchParams, setSearchParams]);

    const deals = useMemo(() => {
        const all = data?.creators || [];
        return all
            .filter((creator) => ['Invited', 'Applied', 'Rejected'].includes(creator.status))
            .filter((creator) => {
                if (filter === 'open') return creator.status !== 'Rejected';
                if (filter === 'countered') return creator.offerTerms?.currentOffer?.proposedBy === 'creator';
                if (filter === 'sent') return creator.offerTerms?.currentOffer?.proposedBy === 'brand';
                if (filter === 'rejected') return creator.status === 'Rejected';
                return true;
            })
            .filter((creator) => {
                if (!query.trim()) return true;
                const haystack = `${creator.name} ${creator.handle}`.toLowerCase();
                return haystack.includes(query.trim().toLowerCase());
            });
    }, [data?.creators, filter, query]);

    const summary = useMemo(() => {
        const all = (data?.creators || []).filter((creator) => ['Invited', 'Applied', 'Rejected'].includes(creator.status));
        return {
            open: all.filter((creator) => creator.status !== 'Rejected').length,
            countered: all.filter((creator) => creator.offerTerms?.currentOffer?.proposedBy === 'creator').length,
            sent: all.filter((creator) => creator.offerTerms?.currentOffer?.proposedBy === 'brand').length,
            rejected: all.filter((creator) => creator.status === 'Rejected').length,
        };
    }, [data?.creators]);

    const openCounter = useCallback((deal) => {
        setCounterModal(deal);
        setCounterAmount(deal.proposedPrice ? String(deal.proposedPrice) : '');
        setCounterNote('');
    }, []);

    const closeCounter = useCallback(() => {
        setCounterModal(null);
        setCounterAmount('');
        setCounterNote('');
    }, []);

    const sendCounter = useCallback(() => {
        if (!counterModal) return;
        const amount = Number(counterAmount);
        if (!amount || amount <= 0) return;
        negotiateDeal({
            collabId: counterModal.id,
            data: {
                action: 'counter',
                proposedPrice: amount,
                pricingModel: counterModal.pricingModel || 'flat_fee',
                estimatedViews: counterModal.estimatedViews || undefined,
                message: counterNote || undefined,
            },
        });
        closeCounter();
    }, [counterAmount, counterModal, counterNote, closeCounter, negotiateDeal]);

    if (isLoading) {
        return (
            <div style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--bd-text-muted)' }} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ maxWidth: 960, margin: '0 auto', padding: 48, color: 'var(--bd-text-primary)' }}>
                Unable to load campaign invitations.
            </div>
        );
    }

    const campaign = data.campaign;

    return (
        <div style={{ maxWidth: 1180, margin: '0 auto', paddingBottom: 64 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
                <div>
                    <button
                        onClick={() => navigate(`/brand/campaigns/${id}`)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'none', border: 'none', color: 'var(--bd-text-secondary)',
                            cursor: 'pointer', marginBottom: 14, padding: 0,
                        }}
                    >
                        <ArrowLeft size={16} /> Campaign overview
                    </button>
                    <h1 style={{ margin: 0, color: 'var(--bd-text-primary)', fontSize: '1.75rem', fontWeight: 800 }}>
                        Invitations & Negotiation
                    </h1>
                    <p style={{ margin: '6px 0 0', color: 'var(--bd-text-secondary)', fontSize: '0.875rem' }}>
                        {campaign.title}
                    </p>
                </div>
                <button
                    onClick={() => setInviteOpen(true)}
                    className="bd-cm-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px' }}
                >
                    <UserPlus size={16} /> Invite Creators
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
                {[
                    ['open', 'Open', summary.open, Clock],
                    ['countered', 'Needs response', summary.countered, Repeat2],
                    ['sent', 'Sent offers', summary.sent, UserPlus],
                    ['rejected', 'Rejected', summary.rejected, X],
                ].map(([key, label, value, Icon]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        style={{
                            ...CARD_STYLE,
                            padding: 14,
                            textAlign: 'left',
                            cursor: 'pointer',
                            outline: filter === key ? '1px solid var(--bd-primary)' : 'none',
                        }}
                    >
                        <Icon size={16} style={{ color: 'var(--bd-text-muted)', marginBottom: 10 }} />
                        <div style={{ color: 'var(--bd-text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{label}</div>
                        <div style={{ color: 'var(--bd-text-primary)', fontSize: '1.35rem', fontWeight: 800 }}>{value}</div>
                    </button>
                ))}
            </div>

            <div style={{ ...CARD_STYLE, padding: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Search size={16} style={{ color: 'var(--bd-text-muted)' }} />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search creators in this campaign..."
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--bd-text-primary)',
                        fontSize: '0.875rem',
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {deals.length > 0 ? deals.map((deal) => (
                    <DealCard
                        key={deal.id}
                        deal={deal}
                        isBusy={isNegotiating}
                        onCounter={openCounter}
                        onAccept={(item) => negotiateDeal({ collabId: item.id, data: { action: 'accept' } })}
                        onReject={(item) => negotiateDeal({ collabId: item.id, data: { action: 'decline' } })}
                    />
                )) : (
                    <div style={{ ...CARD_STYLE, padding: 42, textAlign: 'center' }}>
                        <UserPlus size={28} style={{ color: 'var(--bd-text-muted)', marginBottom: 10 }} />
                        <div style={{ color: 'var(--bd-text-primary)', fontWeight: 700 }}>No invitations in this view</div>
                        <div style={{ color: 'var(--bd-text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
                            Invite creators or switch filters to review older decisions.
                        </div>
                    </div>
                )}
            </div>

            <InviteCreatorsModal
                campaignId={id}
                isOpen={inviteOpen}
                onClose={() => setInviteOpen(false)}
            />

            {counterModal && (
                <div
                    onClick={closeCounter}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                    }}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{ ...CARD_STYLE, width: '100%', maxWidth: 460, padding: 28 }}
                    >
                        <h3 style={{ margin: 0, color: 'var(--bd-text-primary)', fontSize: '1.125rem', fontWeight: 800 }}>
                            Counter {counterModal.name}
                        </h3>
                        <p style={{ margin: '6px 0 18px', color: 'var(--bd-text-secondary)', fontSize: '0.8125rem' }}>
                            Send revised terms back to the creator.
                        </p>
                        <input
                            type="number"
                            min="1"
                            value={counterAmount}
                            onChange={(event) => setCounterAmount(event.target.value)}
                            placeholder="Counter amount"
                            style={{
                                width: '100%', boxSizing: 'border-box', padding: 12,
                                borderRadius: 'var(--bd-radius-lg)',
                                border: '1px solid var(--bd-border-default)',
                                background: 'var(--bd-surface-input)',
                                color: 'var(--bd-text-primary)',
                                fontSize: '1.2rem', fontWeight: 800,
                                outline: 'none', marginBottom: 12,
                            }}
                        />
                        <textarea
                            rows={3}
                            value={counterNote}
                            onChange={(event) => setCounterNote(event.target.value)}
                            placeholder="Optional note"
                            style={{
                                width: '100%', boxSizing: 'border-box', padding: 12,
                                borderRadius: 'var(--bd-radius-lg)',
                                border: '1px solid var(--bd-border-default)',
                                background: 'var(--bd-surface-input)',
                                color: 'var(--bd-text-primary)',
                                outline: 'none', resize: 'none', marginBottom: 18,
                            }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={closeCounter} className="bd-cm-btn-secondary" style={{ flex: 1, padding: '10px 0' }}>
                                Cancel
                            </button>
                            <button
                                onClick={sendCounter}
                                disabled={!counterAmount || Number(counterAmount) <= 0 || isNegotiating}
                                className="bd-cm-btn-primary"
                                style={{ flex: 2, padding: '10px 0', opacity: (!counterAmount || Number(counterAmount) <= 0) ? 0.5 : 1 }}
                            >
                                Send Counter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignInvitationsPage;
