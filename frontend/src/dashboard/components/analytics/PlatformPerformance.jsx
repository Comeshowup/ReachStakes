import React from 'react';
import { Youtube, Instagram, Play } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Platform icon + color ───────────────────────────────────────────────────
const PLATFORM_CONFIG = {
    YouTube: {
        icon: Youtube,
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.1)',
        label: 'YouTube',
    },
    Instagram: {
        icon: Instagram,
        color: '#ec4899',
        bg: 'rgba(236,72,153,0.1)',
        label: 'Instagram',
    },
    TikTok: {
        // TikTok doesn't have a Lucide icon — use a styled text badge
        icon: null,
        color: '#000000',
        bg: 'rgba(0,0,0,0.08)',
        label: 'TikTok',
        dark: true,
    },
};

const fmtNum = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const PlatformCardSkeleton = () => (
    <div
        className="rounded-2xl p-5 animate-pulse"
        style={{
            background: 'var(--bd-surface-overlay)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--bd-border-muted)' }} />
            <div className="h-4 w-20 rounded-full" style={{ background: 'var(--bd-border-muted)' }} />
        </div>
        <div className="space-y-2">
            <div className="h-7 w-24 rounded-lg" style={{ background: 'var(--bd-border-muted)' }} />
            <div className="h-5 w-16 rounded-full" style={{ background: 'var(--bd-border-muted)' }} />
        </div>
    </div>
);

// ─── Single Platform Card ────────────────────────────────────────────────────
const PlatformCard = ({ platform, views, engagementRate, index }) => {
    const cfg = PLATFORM_CONFIG[platform] ?? {
        icon: Play,
        color: '#94a3b8',
        bg: 'rgba(148,163,184,0.1)',
        label: platform,
    };
    const Icon = cfg.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md group"
            style={{
                background: 'var(--bd-surface-overlay)',
                border: '1px solid var(--bd-border-subtle)',
            }}
        >
            {/* Platform header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: cfg.bg }}
                >
                    {platform === 'TikTok' ? (
                        <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded"
                            style={{ background: '#000', color: '#fff' }}
                        >
                            TT
                        </span>
                    ) : Icon ? (
                        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    ) : (
                        <Play className="w-5 h-5" style={{ color: cfg.color }} />
                    )}
                </div>
                <span
                    className="font-semibold text-sm"
                    style={{ color: 'var(--bd-text-primary)' }}
                >
                    {cfg.label}
                </span>
            </div>

            {/* Stats */}
            <div className="space-y-1">
                <p
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: 'var(--bd-text-primary)' }}
                >
                    {fmtNum(views)}
                </p>
                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                    Total Views
                </p>
            </div>

            {/* Engagement rate badge */}
            <div className="mt-3">
                <span
                    className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                        background: cfg.bg,
                        color: cfg.color,
                    }}
                >
                    {Number(engagementRate).toFixed(1)}% Engagement
                </span>
            </div>
        </motion.div>
    );
};

// ─── PlatformPerformance ─────────────────────────────────────────────────────
/**
 * @param {{ platformStats: Array, loading: boolean }} props
 */
const PlatformPerformance = ({ platformStats, loading }) => {
    const platforms = ['YouTube', 'Instagram', 'TikTok'];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2
                    className="text-base font-semibold"
                    style={{ color: 'var(--bd-text-primary)' }}
                >
                    Platform Performance
                </h2>
                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                    Comparing by total views &amp; engagement
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {loading
                    ? [0, 1, 2].map((i) => <PlatformCardSkeleton key={i} />)
                    : platforms.map((platform, i) => {
                          const stat = (platformStats ?? []).find(
                              (s) => s.platform === platform
                          ) ?? { views: 0, engagementRate: 0 };
                          return (
                              <PlatformCard
                                  key={platform}
                                  platform={platform}
                                  views={stat.views}
                                  engagementRate={stat.engagementRate}
                                  index={i}
                              />
                          );
                      })}
            </div>
        </div>
    );
};

export default PlatformPerformance;
