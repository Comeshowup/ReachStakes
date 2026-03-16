import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    CheckCircle,
    XCircle,
    DollarSign,
    Calendar,
    Loader2,
    Briefcase,
    ArrowRight,
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * A single invitation card with Accept / Decline actions.
 */
const InvitationCard = ({ invitation, onResponded }) => {
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);
    const [done, setDone] = useState(null); // 'accepted' | 'declined'

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

    const campaignTitle = invitation.campaignTitle || invitation.title || 'Campaign';
    const brandName = invitation.brandName || 'Brand';
    const brandLogo = invitation.brandLogo;
    const budget = invitation.agreedPrice
        ? `$${parseFloat(invitation.agreedPrice).toLocaleString()}`
        : null;
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
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {done === 'accepted' ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
                        <CheckCircle className="w-4 h-4" /> Accepted!
                    </span>
                ) : done === 'declined' ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>
                        <XCircle className="w-4 h-4" /> Declined
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
