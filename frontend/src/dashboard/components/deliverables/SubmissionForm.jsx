import React, { useState } from 'react';
import { Send, FileText, Video, Link2, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const TYPE_CONFIG = {
    Script: {
        title: 'Submit Script',
        description: 'Write your script, caption, or talking points for brand review.',
        icon: FileText,
        showTextEditor: true,
        placeholder: 'Write your script here...\n\nInclude:\n• Hook / opening line\n• Talking points\n• CTA / closing',
    },
    MockDraft: {
        title: 'Submit Mock Draft',
        description: 'Share a rough cut or storyboard for review before final production.',
        icon: Video,
        showTextEditor: false,
        placeholder: '',
    },
    FinalDraft: {
        title: 'Submit Final Draft',
        description: 'Submit your finished content for final approval.',
        icon: Video,
        showTextEditor: false,
        placeholder: '',
    },
};

/**
 * SubmissionForm — Unified form for Script, MockDraft, and FinalDraft submissions.
 * Uses URL-based submission (Google Drive, Dropbox, platform URLs).
 */
const SubmissionForm = ({ type, deliverable, onSubmit, submitting, complianceResult }) => {
    const [textContent, setTextContent] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [notes, setNotes] = useState('');

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.Script;
    const Icon = config.icon;

    const canSubmit = type === 'Script'
        ? textContent.trim().length > 0
        : (fileUrl.trim().length > 0 || externalUrl.trim().length > 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;
        onSubmit({ type, textContent: textContent || undefined, fileUrl: fileUrl || undefined, externalUrl: externalUrl || undefined, notes: notes || undefined });
    };

    const hasFailedChecks = complianceResult && !complianceResult.allPassed;

    return (
        <form onSubmit={handleSubmit} className="rounded-xl overflow-hidden" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <Icon className="w-4 h-4" style={{ color: 'var(--bd-accent-primary)' }} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{config.title}</h3>
                    <p className="text-[11px]" style={{ color: 'var(--bd-text-secondary)' }}>{config.description}</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Script Text Editor */}
                {config.showTextEditor && (
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--bd-text-secondary)' }}>
                            Script Content
                        </label>
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder={config.placeholder}
                            rows={8}
                            className="w-full rounded-lg px-4 py-3 text-sm resize-y outline-none transition-colors"
                            style={{
                                background: 'var(--bd-surface-input)',
                                border: '1px solid var(--bd-border-subtle)',
                                color: 'var(--bd-text-primary)',
                                minHeight: 160,
                            }}
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-[10px]" style={{ color: 'var(--bd-text-secondary)' }}>
                                {textContent.length} characters
                            </span>
                        </div>
                    </div>
                )}

                {/* File URL (Google Drive, Dropbox, etc.) */}
                {!config.showTextEditor && (
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--bd-text-secondary)' }}>
                            File Link <span style={{ color: 'var(--bd-text-secondary)', fontWeight: 400 }}>(Google Drive, Dropbox, etc.)</span>
                        </label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} />
                            <input
                                type="url"
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                                placeholder="https://drive.google.com/file/..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: 'var(--bd-surface-input)', border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-primary)' }}
                            />
                        </div>
                    </div>
                )}

                {/* Platform URL (for Final Draft) */}
                {type === 'FinalDraft' && (
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--bd-text-secondary)' }}>
                            Published URL <span style={{ color: 'var(--bd-text-secondary)', fontWeight: 400 }}>(optional — YouTube, TikTok, Instagram link)</span>
                        </label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} />
                            <input
                                type="url"
                                value={externalUrl}
                                onChange={(e) => setExternalUrl(e.target.value)}
                                placeholder="https://www.tiktok.com/@handle/video/..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: 'var(--bd-surface-input)', border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-primary)' }}
                            />
                        </div>
                    </div>
                )}

                {/* Notes */}
                <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--bd-text-secondary)' }}>
                        Notes <span style={{ color: 'var(--bd-text-secondary)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional context for the brand..."
                        rows={3}
                        className="w-full rounded-lg px-4 py-2.5 text-sm resize-none outline-none"
                        style={{ background: 'var(--bd-surface-input)', border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-primary)' }}
                    />
                </div>

                {/* Compliance Results */}
                {complianceResult && (
                    <div className="rounded-lg p-3 space-y-1.5" style={{ background: hasFailedChecks ? 'rgba(249,115,22,0.06)' : 'rgba(52,211,153,0.06)', border: `1px solid ${hasFailedChecks ? 'rgba(249,115,22,0.2)' : 'rgba(52,211,153,0.2)'}` }}>
                        <div className="flex items-center gap-2 mb-2">
                            {hasFailedChecks ? (
                                <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
                            ) : (
                                <CheckCircle className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
                            )}
                            <span className="text-xs font-semibold" style={{ color: hasFailedChecks ? '#fb923c' : '#34d399' }}>
                                {hasFailedChecks ? 'Some checks failed' : 'All checks passed'}
                            </span>
                        </div>
                        {complianceResult.checks?.map((check, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px]">
                                {check.passed ? (
                                    <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: '#34d399' }} />
                                ) : (
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f97316' }} />
                                )}
                                <span style={{ color: check.passed ? 'var(--bd-text-secondary)' : '#fb923c' }}>{check.check}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{
                        background: canSubmit && !submitting ? 'var(--bd-accent-primary)' : 'var(--bd-surface-input)',
                        color: canSubmit && !submitting ? 'white' : 'var(--bd-text-secondary)',
                        opacity: canSubmit && !submitting ? 1 : 0.5,
                        cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                    }}
                >
                    {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                        <><Send className="w-4 h-4" /> Submit {type === 'Script' ? 'Script' : type === 'MockDraft' ? 'Mock Draft' : 'Final Draft'}</>
                    )}
                </button>
            </div>
        </form>
    );
};

export default SubmissionForm;
