import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock, CheckCircle2, AlertCircle, User, ListFilter,
    Layers, Check
} from 'lucide-react';

/**
 * ApprovalQueueSidebar — Left panel with decision cards,
 * batch mode toggle, and queue header.
 */
const STATUS_MAP = {
    needs_review: { label: 'Needs Review', class: 'aq-status--review' },
    creator_updated: { label: 'Creator Updated', class: 'aq-status--updated' },
    waiting: { label: 'Waiting on Creator', class: 'aq-status--waiting' },
    overdue: { label: 'Overdue', class: 'aq-status--overdue' },
};

const ApprovalQueueSidebar = ({
    items = [],
    selectedId,
    onSelect,
    batchMode = false,
    onToggleBatchMode,
    batchSelectedIds = [],
    onBatchToggle,
}) => {
    return (
        <div className="aq-sidebar">
            {/* Header */}
            <div className="aq-sidebar__header">
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 'var(--bd-space-2)'
                }}>
                    <div>
                        <div style={{
                            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.06em', color: 'var(--bd-text-muted)',
                            marginBottom: 2
                        }}>
                            Approvals Queue
                        </div>
                        <div style={{
                            fontSize: 24, fontWeight: 700, color: 'var(--bd-text-primary)',
                            fontVariantNumeric: 'tabular-nums',
                            display: 'flex', alignItems: 'baseline', gap: 6
                        }}>
                            {items.length}
                            <span style={{
                                fontSize: 13, fontWeight: 400,
                                color: 'var(--bd-text-muted)'
                            }}>
                                pending
                            </span>
                        </div>
                    </div>

                    {/* Batch mode toggle */}
                    {items.length > 1 && (
                        <button
                            onClick={onToggleBatchMode}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 'var(--bd-radius-lg)',
                                border: batchMode ? '1px solid var(--bd-primary)' : '1px solid var(--bd-border-default)',
                                background: batchMode ? 'var(--bd-info-muted)' : 'transparent',
                                color: batchMode ? 'var(--bd-primary)' : 'var(--bd-text-secondary)',
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                transition: 'all 150ms ease-out'
                            }}
                        >
                            <Layers size={13} />
                            Batch
                        </button>
                    )}
                </div>

                {/* Keyboard nav hint */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)',
                    fontSize: 11, color: 'var(--bd-text-muted)'
                }}>
                    <span className="aq-kbd">J</span>
                    <span className="aq-kbd">K</span>
                    <span>to navigate</span>
                </div>
            </div>

            {/* Queue List */}
            <div className="aq-sidebar__list">
                {items.length === 0 ? (
                    <div className="aq-empty" style={{ padding: 'var(--bd-space-8)' }}>
                        <div className="aq-empty__icon">
                            <CheckCircle2 size={32} style={{ color: 'var(--bd-success)' }} />
                        </div>
                        <div style={{
                            fontSize: 16, fontWeight: 700,
                            color: 'var(--bd-text-primary)', marginBottom: 4
                        }}>
                            Queue Cleared
                        </div>
                        <div style={{
                            fontSize: 13, color: 'var(--bd-text-muted)'
                        }}>
                            You're all caught up!
                        </div>
                    </div>
                ) : (
                    items.map((item) => {
                        const isSelected = selectedId === item.id;
                        const isBatchSelected = batchSelectedIds.includes(item.id);
                        const status = STATUS_MAP[item.status] || STATUS_MAP.needs_review;
                        const passCount = item.requirements?.filter(r => r.isMet || r.overridden).length || 0;
                        const totalReqs = item.requirements?.length || 0;

                        return (
                            <div
                                key={item.id}
                                className={`aq-card ${isSelected ? 'aq-card--selected' : ''}`}
                                onClick={() => {
                                    if (batchMode) {
                                        onBatchToggle?.(item.id);
                                    } else {
                                        onSelect(item.id);
                                    }
                                }}
                            >
                                {/* Selected accent bar */}
                                {isSelected && !batchMode && (
                                    <motion.div
                                        className="aq-card__accent"
                                        layoutId="aq-accent"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}

                                <div style={{
                                    display: 'flex', alignItems: 'flex-start',
                                    gap: 'var(--bd-space-3)', paddingLeft: isSelected && !batchMode ? 8 : 0
                                }}>
                                    {/* Batch checkbox */}
                                    {batchMode && (
                                        <div
                                            className={`aq-card__batch-check ${isBatchSelected ? 'aq-card__batch-check--checked' : ''}`}
                                            style={{ marginTop: 2 }}
                                        >
                                            {isBatchSelected && <Check size={12} />}
                                        </div>
                                    )}

                                    {/* Avatar */}
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        overflow: 'hidden', flexShrink: 0,
                                        border: '1px solid var(--bd-border-subtle)',
                                        background: 'var(--bd-muted)'
                                    }}>
                                        <img
                                            src={item.avatar}
                                            alt={item.creator}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 13, fontWeight: 600,
                                            color: 'var(--bd-text-primary)',
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap', marginBottom: 2
                                        }}>
                                            {item.campaign}
                                        </div>

                                        <div style={{
                                            fontSize: 12, color: 'var(--bd-text-secondary)',
                                            marginBottom: 'var(--bd-space-2)',
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.creator}
                                        </div>

                                        {/* Meta row */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            gap: 'var(--bd-space-2)', flexWrap: 'wrap'
                                        }}>
                                            {/* Version */}
                                            <span style={{
                                                fontSize: 10, fontWeight: 600,
                                                fontFamily: 'monospace',
                                                padding: '1px 6px',
                                                borderRadius: 'var(--bd-radius-sm)',
                                                background: 'var(--bd-bg-tertiary)',
                                                border: '1px solid var(--bd-border-subtle)',
                                                color: 'var(--bd-text-muted)'
                                            }}>
                                                v{item.version}
                                            </span>

                                            {/* Deliverables */}
                                            <span style={{
                                                fontSize: 10, fontWeight: 500,
                                                color: passCount === totalReqs ? 'var(--bd-success)' : 'var(--bd-text-muted)',
                                                display: 'flex', alignItems: 'center', gap: 2
                                            }}>
                                                <CheckCircle2 size={10} />
                                                {passCount}/{totalReqs}
                                            </span>

                                            {/* Last updated */}
                                            <span style={{
                                                fontSize: 10, color: 'var(--bd-text-muted)',
                                                display: 'flex', alignItems: 'center', gap: 2
                                            }}>
                                                <Clock size={10} />
                                                {item.submittedAt}
                                            </span>
                                        </div>

                                        {/* Bottom row: Status + Escrow */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginTop: 'var(--bd-space-2)'
                                        }}>
                                            <span className={`aq-status ${status.class}`}>
                                                {status.label}
                                            </span>

                                            {item.escrow > 0 && (
                                                <span style={{
                                                    fontSize: 12, fontWeight: 700,
                                                    color: 'var(--bd-aq-escrow-text)',
                                                    fontVariantNumeric: 'tabular-nums'
                                                }}>
                                                    ₹{item.escrow.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ApprovalQueueSidebar;
