import React, { useState } from 'react';
import { Upload, Link as LinkIcon, CheckCircle, Loader2, X, ExternalLink, RotateCcw, Clock, Eye, Heart, MessageSquare as MsgIcon } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SUBMISSION_STATUS = {
    Pending_Approval: { label: 'Pending', color: 'rgb(251, 191, 36)', bg: 'rgba(245, 158, 11, 0.1)' },
    Approved: { label: 'Approved', color: 'rgb(52, 211, 153)', bg: 'rgba(16, 185, 129, 0.1)' },
    Revision_Requested: { label: 'Revision', color: 'rgb(192, 132, 252)', bg: 'rgba(168, 85, 247, 0.1)' },
    Submitted: { label: 'Submitted', color: 'rgb(96, 165, 250)', bg: 'rgba(96, 165, 250, 0.1)' },
};

/**
 * Submission uploader — upload content via URL + view submission history.
 */
const SubmissionUploader = ({ collaborationId, submissions = [], campaign, onSubmitSuccess }) => {
    const [showForm, setShowForm] = useState(false);
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState('YouTube');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!link.trim()) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            let videoId = null;
            if (platform === 'YouTube' && link) {
                const match = link.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (match) videoId = match[1];
            }
            await axios.post(
                `${API_BASE_URL}/collaborations/${collaborationId}/submit`,
                { submissionUrl: link, platform, videoId, title },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setLink('');
            setTitle('');
            setShowForm(false);
            onSubmitSuccess?.();
        } catch (err) {
            console.error('Submission failed:', err);
            alert(err.response?.data?.details || 'Failed to submit content');
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = campaign?.status === 'In_Progress';

    return (
        <div className="space-y-4">
            {/* Submit Button */}
            {canSubmit && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: 'var(--bd-accent-primary)' }}
                >
                    <Upload className="w-4 h-4" />
                    Upload Content
                </button>
            )}

            {/* Submit Form */}
            {showForm && (
                <div
                    className="rounded-xl p-5 space-y-4"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
                            Submit Content
                        </h3>
                        <button onClick={() => setShowForm(false)}>
                            <X className="w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} />
                        </button>
                    </div>

                    {/* Platform Select */}
                    <div className="flex gap-2">
                        {['YouTube', 'TikTok', 'Instagram'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPlatform(p)}
                                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                    background: platform === p ? 'var(--bd-accent-primary)' : 'var(--bd-surface-input)',
                                    color: platform === p ? '#fff' : 'var(--bd-text-secondary)',
                                    border: `1px solid ${platform === p ? 'transparent' : 'var(--bd-border-subtle)'}`,
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Content Title */}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--bd-text-secondary)' }}>
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Summer Collection Review"
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                            style={{
                                background: 'var(--bd-surface-input)',
                                border: '1px solid var(--bd-border-subtle)',
                                color: 'var(--bd-text-primary)',
                            }}
                        />
                    </div>

                    {/* URL Input */}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--bd-text-secondary)' }}>
                            Content URL
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} />
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                                style={{
                                    background: 'var(--bd-surface-input)',
                                    border: '1px solid var(--bd-border-subtle)',
                                    color: 'var(--bd-text-primary)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{ color: 'var(--bd-text-secondary)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!link.trim() || submitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40"
                            style={{ background: 'var(--bd-accent-primary)' }}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Submit for Review
                        </button>
                    </div>
                </div>
            )}

            {/* Submission History */}
            {submissions.length === 0 ? (
                <div
                    className="rounded-xl text-center py-12"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <Upload className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: 'var(--bd-text-secondary)' }} />
                    <p className="text-sm mb-1" style={{ color: 'var(--bd-text-secondary)' }}>
                        No submissions yet
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bd-text-secondary)', opacity: 0.6 }}>
                        Upload your content to submit for brand review
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {submissions.map((sub, idx) => {
                        const statusConfig = SUBMISSION_STATUS[sub.status] || SUBMISSION_STATUS.Submitted;
                        return (
                            <div
                                key={sub.id || idx}
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{
                                    background: 'var(--bd-surface-panel)',
                                    border: '1px solid var(--bd-border-subtle)',
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--bd-text-primary)' }}>
                                        {sub.title || 'Content Submission'}
                                    </h4>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                                        {sub.platform || 'Video'} • {new Date(sub.createdAt || sub.date).toLocaleDateString()}
                                    </p>

                                    {/* Stats */}
                                    {sub.stats && sub.link && (
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bd-text-secondary)' }}>
                                                <Eye className="w-3 h-3" /> {sub.stats.views?.toLocaleString() || 0}
                                            </span>
                                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bd-text-secondary)' }}>
                                                <Heart className="w-3 h-3" /> {sub.stats.likes?.toLocaleString() || 0}
                                            </span>
                                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bd-text-secondary)' }}>
                                                <MsgIcon className="w-3 h-3" /> {sub.stats.comments?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {sub.link && (
                                        <a
                                            href={sub.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg transition-colors"
                                            style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-secondary)' }}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                    {sub.status === 'Revision_Requested' && (
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="p-2 rounded-lg transition-colors"
                                            style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'rgb(192, 132, 252)' }}
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <span
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: statusConfig.bg, color: statusConfig.color }}
                                    >
                                        {statusConfig.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SubmissionUploader;
