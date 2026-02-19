import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, MessageSquare } from 'lucide-react';

import VideoReviewPlayer from './VideoReviewPlayer';
import ScriptReviewPanel from './ScriptReviewPanel';
import ComplianceEngine from './ComplianceEngine';
import ActivityTimeline from './ActivityTimeline';
import FinancialSnapshot from './FinancialSnapshot';
import SmartInsightCard from './SmartInsightCard';
import DecisionBar from './DecisionBar';

/**
 * ReviewWorkspace — Right panel orchestrator.
 * Renders: content area (video or script), compliance + timeline,
 * financial snapshot, smart insights, and sticky decision bar.
 */
const ReviewWorkspace = ({
    item,
    onApprove,
    onRequestChanges,
    isLoading,
    batchMode,
    batchCount,
    onToggleOverride,
    onAddComplianceComment,
    onAddAnnotation,
    revisionMode,
    onToggleRevisionMode,
    feedbackText,
    onFeedbackChange,
    onSubmitFeedback
}) => {
    if (!item) {
        return (
            <div className="aq-workspace">
                <div className="aq-empty" style={{ flex: 1 }}>
                    <div className="aq-empty__icon">
                        <FileText size={32} style={{ color: 'var(--bd-text-muted)' }} />
                    </div>
                    <div style={{
                        fontSize: 16, fontWeight: 600,
                        color: 'var(--bd-text-primary)', marginBottom: 4
                    }}>
                        Select an approval to review
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--bd-text-muted)' }}>
                        Choose an item from the queue to begin review
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="aq-workspace">
            <div className="aq-workspace__scroll">
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 'var(--bd-space-5)'
                }}>
                    <div>
                        <div style={{
                            fontSize: 20, fontWeight: 700,
                            color: 'var(--bd-text-primary)', marginBottom: 2
                        }}>
                            {item.campaign}
                        </div>
                        <div style={{
                            fontSize: 13, color: 'var(--bd-text-secondary)',
                            display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)'
                        }}>
                            <span>{item.creator}</span>
                            <span style={{ color: 'var(--bd-text-muted)' }}>·</span>
                            <span style={{
                                fontFamily: 'monospace', fontSize: 11,
                                padding: '1px 6px', borderRadius: 'var(--bd-radius-sm)',
                                background: 'var(--bd-bg-tertiary)',
                                border: '1px solid var(--bd-border-subtle)'
                            }}>
                                v{item.version}
                            </span>
                            <span style={{ color: 'var(--bd-text-muted)' }}>·</span>
                            <span style={{ color: 'var(--bd-text-muted)' }}>
                                {item.type === 'video' ? 'Video Review' : 'Script Review'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Primary Content */}
                <motion.div
                    key={item.id + '-content'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginBottom: 'var(--bd-space-6)' }}
                >
                    {item.type === 'video' ? (
                        <VideoReviewPlayer
                            src={item.videoSrc}
                            sponsorTimestamp={item.sponsorTimestamp}
                            ctaTimestamp={item.ctaTimestamp}
                        />
                    ) : (
                        <ScriptReviewPanel
                            content={item.scriptContent}
                            annotations={item.annotations || []}
                            onAddAnnotation={onAddAnnotation}
                        />
                    )}
                </motion.div>

                {/* Compliance + Activity — 2 column */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--bd-space-5)',
                    marginBottom: 'var(--bd-space-5)'
                }}>
                    <div>
                        <div style={{
                            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.05em', color: 'var(--bd-text-muted)',
                            marginBottom: 'var(--bd-space-3)'
                        }}>
                            Deliverables
                        </div>
                        <ComplianceEngine
                            requirements={item.requirements || []}
                            onToggleOverride={onToggleOverride}
                            onAddComment={onAddComplianceComment}
                        />
                    </div>

                    <div>
                        <div style={{
                            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.05em', color: 'var(--bd-text-muted)',
                            marginBottom: 'var(--bd-space-3)'
                        }}>
                            Activity
                        </div>
                        <div style={{
                            borderRadius: 'var(--bd-radius-2xl)',
                            border: '1px solid var(--bd-border-subtle)',
                            background: 'var(--bd-aq-surface-elevated)',
                            padding: 'var(--bd-space-3) var(--bd-space-4)',
                            maxHeight: 360, overflowY: 'auto'
                        }}>
                            <ActivityTimeline events={item.timeline || []} />
                        </div>
                    </div>
                </div>

                {/* Financial Snapshot */}
                <div style={{ marginBottom: 'var(--bd-space-5)' }}>
                    <FinancialSnapshot
                        escrow={item.escrow}
                        creatorFee={item.creatorFee || 0}
                        budgetRemaining={item.budgetRemaining || 0}
                        roas={item.roas || null}
                    />
                </div>

                {/* Smart Insights */}
                {item.insights && item.insights.length > 0 && (
                    <div style={{ marginBottom: 'var(--bd-space-5)' }}>
                        <SmartInsightCard insights={item.insights} />
                    </div>
                )}

                {/* Revision feedback area */}
                {revisionMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            marginBottom: 'var(--bd-space-5)',
                            borderRadius: 'var(--bd-radius-2xl)',
                            border: '1px solid var(--bd-aq-btn-changes-border)',
                            background: 'var(--bd-aq-btn-changes-bg)',
                            padding: 'var(--bd-space-5)', overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)',
                            marginBottom: 'var(--bd-space-3)'
                        }}>
                            <MessageSquare size={15} style={{ color: 'var(--bd-aq-btn-changes-text)' }} />
                            <span style={{
                                fontSize: 13, fontWeight: 600,
                                color: 'var(--bd-aq-btn-changes-text)'
                            }}>
                                Request Changes
                            </span>
                        </div>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => onFeedbackChange(e.target.value)}
                            placeholder="Describe the changes needed..."
                            autoFocus
                            style={{
                                width: '100%', minHeight: 100,
                                padding: 'var(--bd-space-3)',
                                borderRadius: 'var(--bd-radius-lg)',
                                border: '1px solid var(--bd-border-default)',
                                background: 'var(--bd-surface-input)',
                                color: 'var(--bd-text-primary)',
                                fontSize: 13, resize: 'vertical',
                                outline: 'none', fontFamily: 'inherit',
                                lineHeight: 1.6, marginBottom: 'var(--bd-space-3)'
                            }}
                        />
                        <div style={{ display: 'flex', gap: 'var(--bd-space-2)', justifyContent: 'flex-end' }}>
                            <button
                                onClick={onToggleRevisionMode}
                                style={{
                                    padding: '8px 16px', borderRadius: 'var(--bd-radius-lg)',
                                    border: '1px solid var(--bd-border-default)',
                                    background: 'transparent', color: 'var(--bd-text-secondary)',
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSubmitFeedback}
                                disabled={!feedbackText.trim()}
                                className="aq-btn-changes"
                                style={{ padding: '8px 16px' }}
                            >
                                Send Feedback
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Sticky Decision Bar */}
            {!revisionMode && (
                <DecisionBar
                    item={item}
                    onApprove={onApprove}
                    onRequestChanges={onToggleRevisionMode}
                    isLoading={isLoading}
                    batchMode={batchMode}
                    batchCount={batchCount}
                />
            )}
        </div>
    );
};

export default ReviewWorkspace;
