import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, ChevronDown, ChevronUp, Send, Check, X
} from 'lucide-react';

/**
 * ScriptReviewPanel — Line-numbered, click-to-comment script review.
 * Auto-highlights sponsor sections and CTA mentions.
 * Includes collapsible annotations panel with threaded comments.
 */

const SPONSOR_PATTERNS = /\b(sponsor|sponsored|partnership|ad\sspot|sponsor\sspot)\b/i;
const CTA_PATTERNS = /\b(call.to.action|cta|link\sin\sbio|use\scode|promo\scode|sign\sup|download)\b/i;

const ScriptReviewPanel = ({ content = '', annotations = [], onAddAnnotation }) => {
    const [activeLineIdx, setActiveLineIdx] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [showAnnotations, setShowAnnotations] = useState(true);

    const lines = useMemo(() => {
        return content.split('\n').map((text, i) => {
            const isSponsor = SPONSOR_PATTERNS.test(text);
            const isCTA = CTA_PATTERNS.test(text);
            const lineAnnotations = annotations.filter(a => a.line === i + 1);
            return { text, index: i, isSponsor, isCTA, annotations: lineAnnotations };
        });
    }, [content, annotations]);

    const handleLineClick = (idx) => {
        setActiveLineIdx(activeLineIdx === idx ? null : idx);
        setCommentText('');
    };

    const handleSubmitComment = (lineNum) => {
        if (!commentText.trim()) return;
        onAddAnnotation?.({
            line: lineNum,
            text: commentText.trim(),
            author: 'Brand Manager',
            role: 'brand',
            resolved: false,
            date: 'Just now'
        });
        setCommentText('');
        setActiveLineIdx(null);
    };

    return (
        <div className="aq-script">
            {/* Script Lines */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {lines.map((line) => {
                    const lineNum = line.index + 1;
                    let lineClass = 'aq-script__line';
                    if (line.isSponsor) lineClass += ' aq-script__line--sponsor';
                    else if (line.isCTA) lineClass += ' aq-script__line--cta';
                    if (activeLineIdx === line.index) lineClass += ' aq-script__line--active';

                    return (
                        <React.Fragment key={line.index}>
                            <div
                                className={lineClass}
                                onClick={() => handleLineClick(line.index)}
                            >
                                <span className="aq-script__gutter">{lineNum}</span>
                                <span className="aq-script__content">
                                    {line.text || '\u00A0'}
                                </span>
                                {line.annotations.length > 0 && (
                                    <span className="aq-script__annotation-indicator">
                                        {line.annotations.length}
                                    </span>
                                )}
                            </div>

                            {/* Inline comment input */}
                            <AnimatePresence>
                                {activeLineIdx === line.index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            overflow: 'hidden',
                                            borderBottom: '1px solid var(--bd-border-subtle)'
                                        }}
                                    >
                                        <div style={{
                                            padding: 'var(--bd-space-3) var(--bd-space-4)',
                                            paddingLeft: 52,
                                            background: 'var(--bd-bg-tertiary)',
                                            display: 'flex', gap: 'var(--bd-space-2)'
                                        }}>
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder={`Comment on line ${lineNum}...`}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(lineNum)}
                                                autoFocus
                                                style={{
                                                    flex: 1, height: 36,
                                                    padding: '0 var(--bd-space-3)',
                                                    borderRadius: 'var(--bd-radius-lg)',
                                                    border: '1px solid var(--bd-border-default)',
                                                    background: 'var(--bd-surface-input)',
                                                    color: 'var(--bd-text-primary)',
                                                    fontSize: 13, outline: 'none',
                                                    fontFamily: 'inherit'
                                                }}
                                            />
                                            <button
                                                onClick={() => handleSubmitComment(lineNum)}
                                                disabled={!commentText.trim()}
                                                style={{
                                                    width: 36, height: 36,
                                                    borderRadius: 'var(--bd-radius-lg)',
                                                    background: commentText.trim() ? 'var(--bd-primary)' : 'var(--bd-muted)',
                                                    border: 'none', cursor: 'pointer',
                                                    color: commentText.trim() ? 'var(--bd-primary-fg)' : 'var(--bd-text-muted)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 150ms ease-out'
                                                }}
                                            >
                                                <Send size={14} />
                                            </button>
                                        </div>

                                        {/* Show existing annotations for this line */}
                                        {line.annotations.map((ann, ai) => (
                                            <div
                                                key={ai}
                                                className={`aq-annotation aq-annotation--${ann.role} ${ann.resolved ? 'aq-annotation--resolved' : ''}`}
                                                style={{ paddingLeft: 52 }}
                                            >
                                                <div style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'center', marginBottom: 4
                                                }}>
                                                    <span style={{
                                                        fontSize: 12, fontWeight: 600,
                                                        color: 'var(--bd-text-primary)'
                                                    }}>
                                                        {ann.author}
                                                    </span>
                                                    <span style={{
                                                        fontSize: 11, color: 'var(--bd-text-muted)'
                                                    }}>
                                                        {ann.date} {ann.resolved && '· Resolved'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: 13, color: 'var(--bd-text-secondary)',
                                                    lineHeight: 1.5
                                                }}>
                                                    {ann.text}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                padding: 'var(--bd-space-3) var(--bd-space-4)',
                borderTop: '1px solid var(--bd-border-subtle)',
                display: 'flex', alignItems: 'center', gap: 'var(--bd-space-5)',
                fontSize: 11, color: 'var(--bd-text-muted)'
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: 'var(--bd-aq-highlight-sponsor)'
                    }} />
                    Sponsor
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: 'var(--bd-aq-highlight-cta)'
                    }} />
                    CTA
                </span>
                <span>Click any line to comment</span>
            </div>
        </div>
    );
};

export default ScriptReviewPanel;
