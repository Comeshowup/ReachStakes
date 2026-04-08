import React, { useState, useEffect } from 'react';
import {
    Upload, Link as LinkIcon, CheckCircle, Loader2, X,
    ExternalLink, RotateCcw, Eye, Heart, MessageSquare as MsgIcon,
    Share2, AlertTriangle, Wifi, Settings, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SUBMISSION_STATUS = {
    Pending_Approval: { label: 'Pending', color: 'rgb(251, 191, 36)', bg: 'rgba(245, 158, 11, 0.1)' },
    Approved:         { label: 'Approved', color: 'rgb(52, 211, 153)', bg: 'rgba(16, 185, 129, 0.1)' },
    Revision_Requested: { label: 'Revision', color: 'rgb(192, 132, 252)', bg: 'rgba(168, 85, 247, 0.1)' },
    Under_Review:     { label: 'Under Review', color: 'rgb(96, 165, 250)', bg: 'rgba(96, 165, 250, 0.1)' },
    Submitted:        { label: 'Submitted', color: 'rgb(96, 165, 250)', bg: 'rgba(96, 165, 250, 0.1)' },
};

const PLATFORM_ICONS = { YouTube: '▶️', TikTok: '🎵', Instagram: '📸' };

/**
 * Submission uploader — submit content via URL, verify social account, view submission history.
 */
const SubmissionUploader = ({ collaborationId, submissions = [], campaign, onSubmitSuccess, userId }) => {
    const [showForm, setShowForm] = useState(false);
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [platform, setPlatform] = useState('YouTube');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Social account connection state
    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(false);

    // Fetch connected social accounts when form opens
    useEffect(() => {
        if (showForm && userId) {
            fetchConnectedAccounts();
        }
    }, [showForm, userId]);

    const fetchConnectedAccounts = async () => {
        setAccountsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/social/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConnectedAccounts(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch social accounts:', err);
            setConnectedAccounts([]);
        } finally {
            setAccountsLoading(false);
        }
    };

    const isAccountConnected = (p) =>
        connectedAccounts.some(a => a.platform === p);

    const handleSubmit = async () => {
        if (!link.trim()) {
            setError('Please enter a content URL.');
            return;
        }
        setError(null);

        // Front-end pre-check: warn if account is not connected
        if (!isAccountConnected(platform)) {
            setError(`Your ${platform} account is not connected. Go to Settings > Social Accounts to connect it first.`);
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');

            // Extract YouTube video ID if needed
            let videoId = null;
            if (platform === 'YouTube' && link) {
                const match = link.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (match) videoId = match[1];
            }

            await axios.post(
                `${API_BASE_URL}/collaborations/${collaborationId}/submit`,
                { submissionUrl: link, platform, videoId, title, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setLink('');
            setTitle('');
            setNotes('');
            setShowForm(false);
            onSubmitSuccess?.();
        } catch (err) {
            const errData = err.response?.data;
            // Surface the specific backend error (ownership mismatch, not connected, etc.)
            setError(errData?.details || errData?.error || 'Failed to submit content. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = campaign?.status === 'In_Progress';
    const selectedAccountConnected = isAccountConnected(platform);

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
                        <button onClick={() => { setShowForm(false); setError(null); }}>
                            <X className="w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} />
                        </button>
                    </div>

                    {/* Platform Select */}
                    <div className="flex gap-2">
                        {['YouTube', 'TikTok', 'Instagram'].map((p) => {
                            const connected = isAccountConnected(p);
                            return (
                                <button
                                    key={p}
                                    onClick={() => { setPlatform(p); setError(null); }}
                                    className="relative px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                    style={{
                                        background: platform === p ? 'var(--bd-accent-primary)' : 'var(--bd-surface-input)',
                                        color: platform === p ? '#fff' : 'var(--bd-text-secondary)',
                                        border: `1px solid ${platform === p ? 'transparent' : 'var(--bd-border-subtle)'}`,
                                    }}
                                >
                                    {PLATFORM_ICONS[p]} {p}
                                    {!accountsLoading && !connected && (
                                        <span
                                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border border-slate-900"
                                            title={`${p} not connected`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                        {accountsLoading && (
                            <Loader2 className="w-4 h-4 animate-spin self-center ml-1" style={{ color: 'var(--bd-text-secondary)' }} />
                        )}
                    </div>

                    {/* Social account connection warning */}
                    {!accountsLoading && !selectedAccountConnected && (
                        <div
                            className="flex items-start gap-2.5 p-3 rounded-lg text-xs"
                            style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'rgb(251, 191, 36)' }}
                        >
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">{platform} account not connected</p>
                                <p className="opacity-80 mt-0.5">
                                    You need to connect your {platform} account before submitting.{' '}
                                    <a
                                        href="/creator/settings"
                                        className="underline font-bold"
                                        style={{ color: 'rgb(251, 191, 36)' }}
                                    >
                                        Go to Settings
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Connected account badge */}
                    {!accountsLoading && selectedAccountConnected && (
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'rgb(52, 211, 153)' }}
                        >
                            <Wifi className="w-3.5 h-3.5" />
                            {platform} connected as @{connectedAccounts.find(a => a.platform === platform)?.username}
                        </div>
                    )}

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
                            Content URL *
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--bd-text-secondary)' }} />
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => { setLink(e.target.value); setError(null); }}
                                placeholder="https://..."
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                                style={{
                                    background: 'var(--bd-surface-input)',
                                    border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'var(--bd-border-subtle)'}`,
                                    color: 'var(--bd-text-primary)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--bd-text-secondary)' }}>
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Anything you'd like the brand to know..."
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
                            style={{
                                background: 'var(--bd-surface-input)',
                                border: '1px solid var(--bd-border-subtle)',
                                color: 'var(--bd-text-primary)',
                            }}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="flex items-start gap-2.5 p-3 rounded-lg text-xs"
                            style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'rgb(252, 165, 165)' }}
                        >
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => { setShowForm(false); setError(null); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{ color: 'var(--bd-text-secondary)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!link.trim() || submitting || !selectedAccountConnected}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40"
                            style={{ background: 'var(--bd-accent-primary)' }}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            {submitting ? 'Verifying…' : 'Submit for Review'}
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
                        const stats = sub.stats || {};
                        const hasStats = sub.link && (stats.views || stats.likes || stats.comments || stats.shares);
                        return (
                            <div
                                key={sub.id || idx}
                                className="p-4 rounded-xl"
                                style={{
                                    background: 'var(--bd-surface-panel)',
                                    border: '1px solid var(--bd-border-subtle)',
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--bd-text-primary)' }}>
                                            {sub.title || sub.submissionTitle || 'Content Submission'}
                                        </h4>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                                            {sub.platform || sub.submissionPlatform || 'Video'} • {new Date(sub.createdAt || sub.date).toLocaleDateString()}
                                        </p>

                                        {/* Stats Row */}
                                        {hasStats && (
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <StatChip icon={Eye} value={stats.views} color="rgb(96, 165, 250)" />
                                                <StatChip icon={Heart} value={stats.likes} color="rgb(244, 114, 182)" />
                                                <StatChip icon={MsgIcon} value={stats.comments} color="rgb(52, 211, 153)" />
                                                <StatChip icon={Share2} value={stats.shares} color="rgb(167, 139, 250)" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {(sub.link || sub.submissionUrl) && (
                                            <a
                                                href={sub.link || sub.submissionUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg transition-colors"
                                                style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-secondary)' }}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                        {(sub.status === 'Revision_Requested' || sub.status === 'Revision') && (
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Small stat chip component
function StatChip({ icon: Icon, value, color }) {
    if (value === undefined || value === null) return null;
    return (
        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bd-text-secondary)' }}>
            <Icon className="w-3 h-3" style={{ color }} />
            {Number(value).toLocaleString()}
        </span>
    );
}

export default SubmissionUploader;
