import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Play, ExternalLink, ArrowUpDown, Eye, Heart, MessageCircle, Target, Calendar } from 'lucide-react';

const fmtNum = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

const fmtDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

// ─── Platform badge ──────────────────────────────────────────────────────────
const PlatformBadge = ({ platform }) => {
    const p = platform?.toLowerCase();
    if (p === 'youtube') return <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><Youtube className="w-3.5 h-3.5" />YouTube</span>;
    if (p === 'instagram') return <span className="flex items-center gap-1 text-pink-500 text-xs font-medium"><Instagram className="w-3.5 h-3.5" />Instagram</span>;
    if (p === 'tiktok') return <span className="flex items-center gap-1 text-[10px] font-black"><span className="bg-black text-white dark:bg-white dark:text-black px-1 rounded">TT</span><span style={{ color: 'var(--bd-text-secondary)' }}>TikTok</span></span>;
    return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--bd-text-secondary)' }}><Play className="w-3 h-3" />{platform}</span>;
};

// ─── Sort tabs ───────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
    { key: 'views',      label: 'Top Views'      },
    { key: 'engagement', label: 'Top Engagement' },
    { key: 'newest',     label: 'Newest'         },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────
const TableSkeleton = () => (
    <div
        className="rounded-2xl p-6 animate-pulse space-y-3"
        style={{
            background: 'var(--bd-surface-overlay)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl" style={{ background: 'var(--bd-border-muted)' }} />
        ))}
    </div>
);

// ─── ContentPerformanceTable ─────────────────────────────────────────────────
/**
 * @param {{
 *   videos: Array,
 *   loading: boolean,
 *   sortBy: string,
 *   setSortBy: Function,
 * }} props
 */
const ContentPerformanceTable = ({ videos, loading, sortBy, setSortBy }) => {
    if (loading) return <TableSkeleton />;

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'var(--bd-surface-overlay)',
                border: '1px solid var(--bd-border-subtle)',
            }}
        >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}>
                <h2 className="text-base font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
                    Top Performing Content
                </h2>
                {/* Sort tabs */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bd-bg-primary)' }}>
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => setSortBy(opt.key)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={
                                sortBy === opt.key
                                    ? {
                                          background: 'var(--bd-surface-overlay)',
                                          color: 'var(--bd-text-primary)',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                      }
                                    : { color: 'var(--bd-text-secondary)' }
                            }
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Column headers — hidden on mobile */}
            <div
                className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest"
                style={{
                    color: 'var(--bd-text-muted)',
                    borderBottom: '1px solid var(--bd-border-subtle)',
                }}
            >
                <div className="col-span-4">Video / Campaign</div>
                <div className="col-span-1 text-center">Platform</div>
                <div className="col-span-1 text-right flex items-center justify-end gap-1"><Eye className="w-3 h-3" />Views</div>
                <div className="col-span-1 text-right flex items-center justify-end gap-1"><Heart className="w-3 h-3" />Likes</div>
                <div className="col-span-1 text-right flex items-center justify-end gap-1"><MessageCircle className="w-3 h-3" />Cmts</div>
                <div className="col-span-2 text-right flex items-center justify-end gap-1"><Target className="w-3 h-3" />Eng. Rate</div>
                <div className="col-span-2 text-right flex items-center justify-end gap-1"><Calendar className="w-3 h-3" />Date</div>
            </div>

            {/* Rows */}
            {videos.length === 0 ? (
                <div className="py-16 text-center">
                    <Play className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--bd-text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                        No content data yet
                    </p>
                </div>
            ) : (
                <div>
                    {videos.map((video, i) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className="group px-6 py-4 md:grid md:grid-cols-12 gap-4 items-center transition-colors"
                            style={{
                                borderBottom: i < videos.length - 1 ? '1px solid var(--bd-border-subtle)' : 'none',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bd-surface-overlay)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                        >
                            {/* Video + Campaign */}
                            <div className="col-span-4 flex flex-col gap-0.5 min-w-0 mb-3 md:mb-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-sm font-semibold truncate group-hover:text-indigo-500 transition-colors"
                                        style={{ color: 'var(--bd-text-primary)' }}
                                        title={video.title}
                                    >
                                        {video.title}
                                    </span>
                                    {video.link && (
                                        <a
                                            href={video.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ color: 'var(--bd-text-secondary)' }}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                                <span className="text-xs truncate" style={{ color: 'var(--bd-text-secondary)' }}>
                                    {video.campaignTitle}
                                </span>
                            </div>

                            {/* Platform */}
                            <div className="col-span-1 flex justify-start md:justify-center mb-2 md:mb-0">
                                <PlatformBadge platform={video.platform} />
                            </div>

                            {/* Stats — mobile shows inline, desktop grid */}
                            <div className="md:contents flex gap-6 flex-wrap">
                                <div className="col-span-1 text-right">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{fmtNum(video.views)}</span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{fmtNum(video.likes)}</span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{fmtNum(video.comments)}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span
                                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: 'rgba(99,102,241,0.1)',
                                            color: '#6366f1',
                                        }}
                                    >
                                        {Number(video.engagementRate).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>{fmtDate(video.publishDate)}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContentPerformanceTable;
