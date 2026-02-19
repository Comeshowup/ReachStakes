import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, ChevronDown, ChevronRight,
    ShieldCheck, MessageSquare, ToggleLeft, ToggleRight, Clock, AlertCircle
} from 'lucide-react';

/**
 * ComplianceEngine — Expandable deliverables checklist with proof,
 * override capability, and per-item comments.
 */
const ComplianceEngine = ({ requirements = [], onToggleOverride, onAddComment }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});

    const passCount = requirements.filter(r => r.isMet || r.overridden).length;
    const totalCount = requirements.length;

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCommentSubmit = (reqId) => {
        const text = commentTexts[reqId];
        if (!text?.trim()) return;
        onAddComment?.(reqId, text.trim());
        setCommentTexts(prev => ({ ...prev, [reqId]: '' }));
    };

    return (
        <div className="aq-compliance">
            <div className="aq-compliance__header">
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)'
                }}>
                    <ShieldCheck size={16} style={{ color: 'var(--bd-aq-compliance-pass)' }} />
                    <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: 'var(--bd-text-primary)'
                    }}>
                        Compliance Check
                    </span>
                </div>
                <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: passCount === totalCount ? 'var(--bd-aq-compliance-pass)' : 'var(--bd-aq-status-review)',
                    display: 'flex', alignItems: 'center', gap: 4
                }}>
                    <CheckCircle2 size={13} />
                    {passCount}/{totalCount} verified
                </span>
            </div>

            {requirements.map((req) => {
                const isPassing = req.isMet || req.overridden;
                const isExpanded = expandedId === req.id;

                return (
                    <React.Fragment key={req.id}>
                        <div
                            className={`aq-compliance__item ${!isPassing ? 'aq-compliance__item--fail' : ''}`}
                            onClick={() => toggleExpand(req.id)}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    gap: 'var(--bd-space-3)'
                                }}>
                                    {isPassing ? (
                                        <CheckCircle2 size={18} style={{ color: 'var(--bd-aq-compliance-pass)', flexShrink: 0 }} />
                                    ) : (
                                        <XCircle size={18} style={{ color: 'var(--bd-aq-compliance-fail)', flexShrink: 0 }} />
                                    )}
                                    <span style={{
                                        fontSize: 13, fontWeight: 500,
                                        color: 'var(--bd-text-primary)'
                                    }}>
                                        {req.label}
                                    </span>
                                    {req.overridden && (
                                        <span style={{
                                            fontSize: 10, fontWeight: 600,
                                            textTransform: 'uppercase',
                                            color: 'var(--bd-warning)',
                                            letterSpacing: '0.03em'
                                        }}>
                                            overridden
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    color: 'var(--bd-text-muted)', flexShrink: 0
                                }}>
                                    {isExpanded
                                        ? <ChevronDown size={16} />
                                        : <ChevronRight size={16} />
                                    }
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    className="aq-compliance__proof"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    {/* Proof section */}
                                    {req.proof ? (
                                        <div style={{ marginBottom: 'var(--bd-space-3)' }}>
                                            {req.proof.type === 'timestamp' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Clock size={13} style={{ color: 'var(--bd-info)' }} />
                                                    <span>Detected at {req.proof.value}</span>
                                                </div>
                                            )}
                                            {req.proof.type === 'transcript' && (
                                                <div>
                                                    <div style={{ fontSize: 11, color: 'var(--bd-text-muted)', marginBottom: 4 }}>
                                                        Transcript match:
                                                    </div>
                                                    <div style={{
                                                        fontFamily: 'monospace', fontSize: 12,
                                                        background: 'var(--bd-bg-tertiary)',
                                                        padding: 'var(--bd-space-2) var(--bd-space-3)',
                                                        borderRadius: 'var(--bd-radius-md)',
                                                        borderLeft: '3px solid var(--bd-success)'
                                                    }}>
                                                        "{req.proof.value}"
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : !isPassing ? (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            color: 'var(--bd-aq-compliance-fail)',
                                            marginBottom: 'var(--bd-space-3)',
                                            fontSize: 12, fontWeight: 500
                                        }}>
                                            <AlertCircle size={13} />
                                            Not detected in transcript.
                                        </div>
                                    ) : null}

                                    {/* Override toggle */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 'var(--bd-space-3)'
                                    }}>
                                        <span style={{ fontSize: 12, color: 'var(--bd-text-muted)' }}>
                                            Manual override
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleOverride?.(req.id);
                                            }}
                                            style={{
                                                background: 'none', border: 'none',
                                                cursor: 'pointer', padding: 0,
                                                color: req.overridden ? 'var(--bd-warning)' : 'var(--bd-text-muted)'
                                            }}
                                        >
                                            {req.overridden
                                                ? <ToggleRight size={22} />
                                                : <ToggleLeft size={22} />
                                            }
                                        </button>
                                    </div>

                                    {/* Per-item comment */}
                                    <div style={{ display: 'flex', gap: 'var(--bd-space-2)' }}>
                                        <input
                                            type="text"
                                            value={commentTexts[req.id] || ''}
                                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [req.id]: e.target.value }))}
                                            placeholder="Add a note..."
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(req.id)}
                                            style={{
                                                flex: 1, height: 32,
                                                padding: '0 var(--bd-space-3)',
                                                borderRadius: 'var(--bd-radius-md)',
                                                border: '1px solid var(--bd-border-subtle)',
                                                background: 'var(--bd-surface-input)',
                                                color: 'var(--bd-text-primary)',
                                                fontSize: 12, outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCommentSubmit(req.id); }}
                                            style={{
                                                width: 32, height: 32,
                                                borderRadius: 'var(--bd-radius-md)',
                                                background: 'var(--bd-muted)',
                                                border: 'none', cursor: 'pointer',
                                                color: 'var(--bd-text-muted)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <MessageSquare size={13} />
                                        </button>
                                    </div>

                                    {/* Existing comments */}
                                    {req.comments && req.comments.length > 0 && (
                                        <div style={{ marginTop: 'var(--bd-space-3)' }}>
                                            {req.comments.map((c, ci) => (
                                                <div key={ci} style={{
                                                    fontSize: 12, color: 'var(--bd-text-secondary)',
                                                    padding: 'var(--bd-space-1) 0',
                                                    borderTop: ci > 0 ? '1px solid var(--bd-border-subtle)' : 'none'
                                                }}>
                                                    <strong>{c.author}:</strong> {c.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ComplianceEngine;
