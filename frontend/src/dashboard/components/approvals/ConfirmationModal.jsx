import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * ConfirmationModal — Approval confirmation with escrow summary.
 * Focus-trapped, closes on Escape.
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading, item }) => {
    const confirmRef = useRef(null);

    useEffect(() => {
        if (isOpen && confirmRef.current) {
            confirmRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen && !isLoading) onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, isLoading, onClose]);

    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="aq-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
                >
                    <motion.div
                        className="aq-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            style={{
                                position: 'absolute', top: 16, right: 16,
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--bd-text-muted)', padding: 4
                            }}
                        >
                            <X size={18} />
                        </button>

                        {/* Icon */}
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'var(--bd-success-muted)', border: '1px solid var(--bd-success-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 'var(--bd-space-5)'
                        }}>
                            <Shield size={24} style={{ color: 'var(--bd-success)' }} />
                        </div>

                        <h3 id="confirm-title" style={{
                            fontSize: 18, fontWeight: 700, color: 'var(--bd-text-primary)',
                            marginBottom: 'var(--bd-space-2)'
                        }}>
                            Approve & Release Escrow
                        </h3>

                        <p style={{
                            fontSize: 14, color: 'var(--bd-text-secondary)',
                            lineHeight: 1.6, marginBottom: 'var(--bd-space-5)'
                        }}>
                            You're about to approve <strong style={{ color: 'var(--bd-text-primary)' }}>{item.creator}</strong>'s
                            submission for <strong style={{ color: 'var(--bd-text-primary)' }}>{item.campaign}</strong>.
                        </p>

                        {/* Escrow Summary */}
                        <div style={{
                            background: 'var(--bd-aq-escrow-bg)',
                            border: '1px solid var(--bd-aq-escrow-border)',
                            borderRadius: 'var(--bd-radius-xl)',
                            padding: 'var(--bd-space-4)',
                            marginBottom: 'var(--bd-space-6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--bd-text-secondary)' }}>
                                Escrow to release
                            </span>
                            <span style={{
                                fontSize: 20, fontWeight: 700,
                                color: 'var(--bd-aq-escrow-text)',
                                fontVariantNumeric: 'tabular-nums'
                            }}>
                                {item.escrow > 0 ? `₹${item.escrow.toLocaleString('en-IN')}` : 'No escrow'}
                            </span>
                        </div>

                        {item.escrow === 0 && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: 13, color: 'var(--bd-warning)',
                                marginBottom: 'var(--bd-space-4)'
                            }}>
                                <AlertTriangle size={14} />
                                No escrow attached to this approval.
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--bd-space-3)' }}>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                style={{
                                    flex: 1, padding: '12px 16px',
                                    borderRadius: 'var(--bd-radius-xl)',
                                    border: '1px solid var(--bd-border-default)',
                                    background: 'transparent',
                                    color: 'var(--bd-text-secondary)',
                                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 150ms ease-out'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                ref={confirmRef}
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="aq-btn-approve"
                                style={{ flex: 1 }}
                            >
                                {isLoading ? (
                                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                                ) : (
                                    <>Confirm & Release</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
