import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackStrategyCallOpened } from './supportAnalytics';

const CALL_TYPES = [
    {
        id: 'growth',
        label: '30 min Growth Review',
        description: 'Review campaign performance and identify scaling opportunities.',
        icon: '📈',
    },
    {
        id: 'audit',
        label: 'Performance Audit',
        description: 'Deep-dive into ROAS, creator ROI, and capital efficiency.',
        icon: '🔍',
    },
    {
        id: 'capital',
        label: 'Capital Deployment Strategy',
        description: 'Plan escrow allocation and optimize payment flows.',
        icon: '💰',
    },
];

/**
 * StrategyCallModal — Portal-rendered modal with focus trap.
 * Renders into the closest [data-theme] container so CSS variables resolve.
 */
const StrategyCallModal = ({ isOpen, onClose, tierLabel }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const modalRef = useRef(null);
    const closeRef = useRef(null);
    const [portalTarget, setPortalTarget] = useState(null);

    // Find the themed container for portal rendering
    useEffect(() => {
        const themed = document.querySelector('[data-theme]') || document.body;
        setPortalTarget(themed);
    }, []);

    // Track open
    useEffect(() => {
        if (isOpen) {
            trackStrategyCallOpened(tierLabel);
            setSubmitted(false);
            setSelectedType(null);
            setSelectedDate('');
            setSelectedTime('');
        }
    }, [isOpen, tierLabel]);

    // Focus trap + ESC handler
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab' && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        setTimeout(() => closeRef.current?.focus(), 50);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSubmit = useCallback(() => {
        setSubmitted(true);
    }, []);

    if (!isOpen || !portalTarget) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="sc-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                }}
            >
                <motion.div
                    ref={modalRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sc-modal-title"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        background: 'var(--bd-sc-surface, #16161d)',
                        border: '1px solid var(--bd-border-default, rgba(255,255,255,0.1))',
                        borderRadius: 'var(--bd-radius-2xl, 16px)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        width: '100%',
                        maxWidth: '520px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--bd-border-subtle, rgba(255,255,255,0.06))',
                    }}>
                        <h2
                            id="sc-modal-title"
                            style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'var(--bd-text-primary, #f0f0f5)',
                                margin: 0,
                                fontFamily: 'var(--bd-font-display, Inter, sans-serif)',
                            }}
                        >
                            <Video style={{ width: 20, height: 20, display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                            Book Strategy Call
                        </h2>
                        <button
                            ref={closeRef}
                            onClick={onClose}
                            aria-label="Close modal"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--bd-text-secondary, #9898a8)',
                                cursor: 'pointer',
                            }}
                        >
                            <X style={{ width: 18, height: 18 }} />
                        </button>
                    </div>

                    {submitted ? (
                        /* Success State */
                        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%',
                                background: 'var(--bd-success-muted, rgba(16,185,129,0.12))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <Calendar style={{ width: 24, height: 24, color: 'var(--bd-success, #4ade80)' }} />
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--bd-text-primary, #f0f0f5)', margin: '0 0 8px' }}>
                                Call Scheduled
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--bd-text-secondary, #9898a8)', margin: '0 0 20px', lineHeight: 1.5 }}>
                                We'll send a calendar invite with the meeting details shortly.
                            </p>
                            <button
                                onClick={onClose}
                                className="sc-btn-secondary"
                                style={{
                                    height: 40, padding: '0 20px', borderRadius: 10,
                                    border: '1px solid var(--bd-border-default, rgba(255,255,255,0.1))',
                                    background: 'var(--bd-surface-elevated, rgba(255,255,255,0.05))',
                                    color: 'var(--bd-text-primary, #f0f0f5)',
                                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                }}
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Body */}
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Call Type */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: 'var(--bd-text-secondary, #9898a8)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        marginBottom: 12,
                                    }}>
                                        Select Call Type
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {CALL_TYPES.map((ct) => {
                                            const isSelected = selectedType === ct.id;
                                            return (
                                                <button
                                                    key={ct.id}
                                                    onClick={() => setSelectedType(ct.id)}
                                                    type="button"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 14,
                                                        padding: '14px 16px',
                                                        borderRadius: 12,
                                                        border: isSelected
                                                            ? '1.5px solid var(--bd-accent, #7b7fff)'
                                                            : '1px solid var(--bd-border-default, rgba(255,255,255,0.1))',
                                                        background: isSelected
                                                            ? 'var(--bd-sc-tier-pro-bg, rgba(99,102,241,0.12))'
                                                            : 'transparent',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        fontFamily: 'var(--bd-font-body, Inter, sans-serif)',
                                                        transition: 'all 150ms ease-out',
                                                    }}
                                                >
                                                    {/* Radio Circle */}
                                                    <div style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        border: isSelected
                                                            ? '2px solid var(--bd-accent, #7b7fff)'
                                                            : '2px solid var(--bd-border-strong, rgba(255,255,255,0.12))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        marginTop: 2,
                                                    }}>
                                                        {isSelected && (
                                                            <div style={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                background: 'var(--bd-accent, #7b7fff)',
                                                            }} />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div>
                                                        <div style={{
                                                            fontSize: 14,
                                                            fontWeight: 500,
                                                            color: 'var(--bd-text-primary, #f0f0f5)',
                                                            lineHeight: 1.3,
                                                            marginBottom: 4,
                                                        }}>
                                                            {ct.icon} {ct.label}
                                                        </div>
                                                        <div style={{
                                                            fontSize: 12,
                                                            color: 'var(--bd-text-secondary, #9898a8)',
                                                            lineHeight: 1.5,
                                                        }}>
                                                            {ct.description}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Date/Time */}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: 'var(--bd-text-secondary, #9898a8)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            marginBottom: 8,
                                        }}>
                                            <Calendar style={{ width: 12, height: 12 }} />
                                            Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: 42,
                                                padding: '0 12px',
                                                borderRadius: 10,
                                                border: '1px solid var(--bd-border-default, rgba(255,255,255,0.1))',
                                                background: 'var(--bd-surface-input, rgba(255,255,255,0.06))',
                                                color: 'var(--bd-text-primary, #f0f0f5)',
                                                fontSize: 14,
                                                fontFamily: 'var(--bd-font-body, Inter, sans-serif)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: 'var(--bd-text-secondary, #9898a8)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            marginBottom: 8,
                                        }}>
                                            <Clock style={{ width: 12, height: 12 }} />
                                            Preferred Time
                                        </label>
                                        <input
                                            type="time"
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: 42,
                                                padding: '0 12px',
                                                borderRadius: 10,
                                                border: '1px solid var(--bd-border-default, rgba(255,255,255,0.1))',
                                                background: 'var(--bd-surface-input, rgba(255,255,255,0.06))',
                                                color: 'var(--bd-text-primary, #f0f0f5)',
                                                fontSize: 14,
                                                fontFamily: 'var(--bd-font-body, Inter, sans-serif)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid var(--bd-border-subtle, rgba(255,255,255,0.06))',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 12,
                            }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        height: 44, padding: '0 20px', borderRadius: 12,
                                        border: '1px solid transparent',
                                        background: 'transparent',
                                        color: 'var(--bd-text-secondary, #9898a8)',
                                        fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                        fontFamily: 'var(--bd-font-body, Inter, sans-serif)',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedType}
                                    style={{
                                        height: 44, padding: '0 24px', borderRadius: 12,
                                        border: 'none',
                                        background: selectedType
                                            ? 'var(--bd-primary, #6366f1)'
                                            : 'var(--bd-muted, #1c1c26)',
                                        color: selectedType
                                            ? 'var(--bd-primary-fg, #fff)'
                                            : 'var(--bd-text-muted, rgba(152,152,168,0.5))',
                                        fontSize: 14, fontWeight: 600, cursor: selectedType ? 'pointer' : 'not-allowed',
                                        fontFamily: 'var(--bd-font-body, Inter, sans-serif)',
                                        boxShadow: selectedType ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                                        transition: 'all 180ms ease-out',
                                    }}
                                >
                                    Schedule Call
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        portalTarget
    );
};

export default StrategyCallModal;
