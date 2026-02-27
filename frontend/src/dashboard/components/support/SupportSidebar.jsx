import React, { useState, useCallback } from 'react';
import {
    CreditCard,
    CheckCircle,
    BarChart3,
    AlertTriangle,
    FileText,
    ChevronRight,
    ChevronDown,
    ArrowUpRight,
    Phone,
    Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { escalateSupport } from './supportApi';
import { trackEscalationTriggered, trackHelpArticleViewed } from './supportAnalytics';

/* ── Help Categories ────────────────────────── */
const HELP_CATEGORIES = [
    {
        id: 'payments',
        label: 'Payments & Escrow',
        icon: CreditCard,
        preview: 'Manage escrow deposits, payment releases, and transaction disputes. Track all capital movement in your Vault.',
    },
    {
        id: 'approvals',
        label: 'Campaign Approvals',
        icon: CheckCircle,
        preview: 'Review creator submissions, approve deliverables, and manage revision requests through the Approval Queue.',
    },
    {
        id: 'roas',
        label: 'ROAS Reporting',
        icon: BarChart3,
        preview: 'Understand your campaign return on ad spend, creator-level ROI breakdowns, and performance benchmarks.',
    },
    {
        id: 'disputes',
        label: 'Creator Disputes',
        icon: AlertTriangle,
        preview: 'Resolve disagreements on deliverables, payment terms, or content usage rights with our mediation support.',
    },
    {
        id: 'billing',
        label: 'Billing & Invoices',
        icon: FileText,
        preview: 'Access invoices, update payment methods, manage subscription billing, and download financial statements.',
    },
];

/* ── Quick Help Section ─────────────────────── */
const QuickHelpSection = () => {
    const [expandedId, setExpandedId] = useState(null);

    const handleToggle = useCallback((id) => {
        setExpandedId((prev) => {
            if (prev !== id) trackHelpArticleViewed(id);
            return prev === id ? null : id;
        });
    }, []);

    return (
        <div className="sc-sidebar__card">
            <h3 className="sc-sidebar__card-title">Quick Help</h3>
            <ul className="sc-help-list" role="list">
                {HELP_CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                        <button
                            className="sc-help-list__item"
                            onClick={() => handleToggle(cat.id)}
                            aria-expanded={expandedId === cat.id}
                        >
                            <cat.icon className="sc-help-list__item-icon" />
                            <span>{cat.label}</span>
                            {expandedId === cat.id ? (
                                <ChevronDown className="sc-help-list__item-arrow" style={{ opacity: 1 }} />
                            ) : (
                                <ChevronRight className="sc-help-list__item-arrow" />
                            )}
                        </button>

                        <AnimatePresence>
                            {expandedId === cat.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="sc-article-preview">
                                        <p className="sc-article-preview__title">{cat.label}</p>
                                        <p className="sc-article-preview__body">{cat.preview}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* ── Escalation Card ────────────────────────── */
const EscalationCard = ({ tierConfig, onEscalationComplete }) => {
    const [state, setState] = useState('idle'); // idle | confirming | submitting | submitted
    const [ticketId, setTicketId] = useState(null);

    const handleEscalate = useCallback(async () => {
        if (state === 'idle') {
            setState('confirming');
            return;
        }

        if (state === 'confirming') {
            setState('submitting');
            trackEscalationTriggered(tierConfig.label, 'senior_strategist');

            try {
                const result = await escalateSupport('Requested escalation to senior strategist');
                setTicketId(result.ticketId);
                setState('submitted');
                onEscalationComplete?.(result);
            } catch {
                setState('idle');
            }
        }
    }, [state, tierConfig, onEscalationComplete]);

    const handleCancel = useCallback(() => setState('idle'), []);

    const handleFinanceCallback = useCallback(async () => {
        trackEscalationTriggered(tierConfig.label, 'finance_callback');
        setState('submitting');
        try {
            const result = await escalateSupport('Requested finance callback');
            setTicketId(result.ticketId);
            setState('submitted');
            onEscalationComplete?.(result);
        } catch {
            setState('idle');
        }
    }, [tierConfig, onEscalationComplete]);

    if (state === 'submitted') {
        return (
            <div className="sc-escalation-card">
                <div className="sc-escalation-submitted">
                    <CheckCircle className="sc-escalation-submitted__icon" />
                    <p className="sc-escalation-submitted__title">Escalation Submitted</p>
                    <p className="sc-escalation-submitted__desc">
                        Ticket {ticketId} — A senior strategist will contact you within 30 minutes.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="sc-escalation-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--bd-space-2)' }}>
                <Shield style={{ width: 16, height: 16, color: 'var(--bd-sc-tier-enterprise)' }} />
                <h3 className="sc-escalation-card__title" style={{ margin: 0 }}>
                    Escalate to Senior Strategist
                </h3>
            </div>
            <p className="sc-escalation-card__desc">
                Need immediate attention on a critical campaign or payment issue? Escalate directly to our senior team.
            </p>
            <div className="sc-escalation-card__actions">
                {state === 'confirming' ? (
                    <>
                        <p style={{
                            fontSize: 'var(--bd-font-size-xs)',
                            color: 'var(--bd-warning)',
                            margin: '0 0 var(--bd-space-2)',
                            fontWeight: 'var(--bd-font-weight-medium)',
                        }}>
                            Are you sure? This will flag your account for priority handling.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--bd-space-2)' }}>
                            <button
                                className="sc-escalation-btn sc-escalation-btn--primary"
                                onClick={handleEscalate}
                            >
                                <ArrowUpRight style={{ width: 14, height: 14 }} />
                                Confirm Escalation
                            </button>
                            <button
                                className="sc-escalation-btn sc-escalation-btn--secondary"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            className="sc-escalation-btn sc-escalation-btn--primary"
                            onClick={handleEscalate}
                            disabled={state === 'submitting'}
                        >
                            <ArrowUpRight style={{ width: 14, height: 14 }} />
                            {state === 'submitting' ? 'Submitting...' : 'Request Escalation'}
                        </button>

                        {tierConfig.hasPhonePriority && (
                            <button
                                className="sc-escalation-btn sc-escalation-btn--secondary"
                                onClick={handleFinanceCallback}
                                disabled={state === 'submitting'}
                            >
                                <Phone style={{ width: 14, height: 14 }} />
                                Request Finance Callback
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ── Main Sidebar ───────────────────────────── */
const SupportSidebar = ({ tierConfig, onEscalationComplete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="sc-sidebar">
            {/* Mobile accordion trigger */}
            <button
                className="sc-sidebar-accordion-trigger"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <span>Help & Resources</span>
                <ChevronDown
                    style={{
                        width: 16,
                        height: 16,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease-out',
                    }}
                />
            </button>

            {/* Content — always visible on desktop, accordion on mobile */}
            <div
                style={{
                    display: 'contents',
                }}
                className="sc-sidebar__content"
            >
                <style>{`
                    @media (max-width: 1023px) {
                        .sc-sidebar__content {
                            display: ${isExpanded ? 'contents' : 'none'} !important;
                        }
                    }
                `}</style>

                <QuickHelpSection />

                {tierConfig.hasEscalation && (
                    <EscalationCard
                        tierConfig={tierConfig}
                        onEscalationComplete={onEscalationComplete}
                    />
                )}
            </div>
        </div>
    );
};

export default React.memo(SupportSidebar);
