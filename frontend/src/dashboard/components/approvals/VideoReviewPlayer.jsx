import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX,
    Film, AlertCircle, RotateCcw, Zap, ExternalLink
} from 'lucide-react';

/**
 * VideoReviewPlayer — Renders video content from any platform.
 *
 * Platform logic:
 *   YouTube  → <iframe src="https://www.youtube.com/embed/{videoId}">
 *   TikTok   → <iframe src="https://www.tiktok.com/embed/v2/{videoId}">
 *   Instagram→ <iframe src="https://www.instagram.com/p/{shortcode}/embed/">
 *   Other    → native <video> tag (direct file URL)
 *   No src   → empty state
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

/** Extract YouTube video ID from various URL formats */
const extractYouTubeId = (url, videoIdProp) => {
    if (videoIdProp) return videoIdProp;
    try {
        const u = new URL(url);
        // https://www.youtube.com/watch?v=ID
        if (u.searchParams.get('v')) return u.searchParams.get('v');
        // https://youtu.be/ID
        if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
        // https://www.youtube.com/embed/ID
        const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/);
        if (embedMatch) return embedMatch[1];
        // https://www.youtube.com/shorts/ID
        const shortsMatch = u.pathname.match(/\/shorts\/([^/?]+)/);
        if (shortsMatch) return shortsMatch[1];
    } catch { /* ignore */ }
    return null;
};

/** Extract TikTok video ID from URL */
const extractTikTokId = (url) => {
    try {
        // https://www.tiktok.com/@user/video/ID  OR  https://vm.tiktok.com/ID
        const match = url.match(/video\/(\d+)/);
        if (match) return match[1];
        // Short link — can't get ID without resolving redirect; return null
    } catch { /* ignore */ }
    return null;
};

/** Extract Instagram post shortcode from URL */
const extractInstagramShortcode = (url) => {
    try {
        // https://www.instagram.com/p/SHORTCODE/  OR  /reel/SHORTCODE/
        const match = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
        if (match) return match[2];
    } catch { /* ignore */ }
    return null;
};

/** Build embed URL based on platform */
const buildEmbedUrl = (platform, submissionUrl, videoId) => {
    const p = (platform || '').toLowerCase();

    if (p === 'youtube') {
        const id = extractYouTubeId(submissionUrl, videoId);
        return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
    }
    if (p === 'tiktok') {
        const id = extractTikTokId(submissionUrl);
        return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
    }
    if (p === 'instagram') {
        const code = extractInstagramShortcode(submissionUrl);
        // hidecaption=true removes the top "Posted by @user" header bar
        return code ? `https://www.instagram.com/p/${code}/embed/?hidecaption=true` : null;
    }
    return null;
};

// ─── Platform badge colors ─────────────────────────────────────────────────────
const PLATFORM_COLORS = {
    youtube:   { bg: '#FF0000', text: '#fff' },
    tiktok:    { bg: '#010101', text: '#fff' },
    instagram: { bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', text: '#fff' },
    other:     { bg: 'var(--bd-border-default)', text: 'var(--bd-text-secondary)' }
};

// ─── Embed Player (YouTube / TikTok / Instagram) ──────────────────────────────
/**
 * HOW INSTAGRAM EMBEDS WORK:
 * We use Instagram's official public embed iframe endpoint:
 *   https://www.instagram.com/p/{shortcode}/embed/
 * This is NOT scraping — it's the same oEmbed mechanism used by all websites
 * that embed Instagram posts. No API key required for this public endpoint.
 *
 * The stats (views/likes) stored in the DB were fetched via the Instagram
 * Graph API at the time the creator submitted the content.
 *
 * To show ONLY the video (no likes bar, no "View more on Instagram", no
 * comment box), we clip the iframe with overflow:hidden — the video always
 * occupies the top portion of the embed, and the social action bar is at
 * the bottom. We hide it by making the wrapper shorter than the iframe.
 */
const INSTAGRAM_CLIP_PX = 90; // px to clip from bottom (action bar height)

const EmbedPlayer = ({ embedUrl, platform, submissionUrl }) => {
    const [embedError, setEmbedError] = useState(false);
    const pKey = (platform || 'other').toLowerCase();
    const colors = PLATFORM_COLORS[pKey] || PLATFORM_COLORS.other;

    if (embedError) {
        return (
            <div style={{
                width: '100%', aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
                background: 'var(--bd-bg-secondary)',
                border: '1px solid var(--bd-border-subtle)',
                borderRadius: 'var(--bd-radius-2xl)',
                color: 'var(--bd-text-muted)'
            }}>
                <AlertCircle size={32} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>Embed unavailable</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {platform} may block embedding from external sites.
                </div>
                <a
                    href={submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 'var(--bd-radius-lg)',
                        background: 'var(--bd-primary)', color: '#fff',
                        fontSize: 13, fontWeight: 600, textDecoration: 'none',
                        marginTop: 4
                    }}
                >
                    <ExternalLink size={14} />
                    Open on {platform}
                </a>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Platform badge */}
            <div style={{
                position: 'absolute', top: 12, left: 12, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 'var(--bd-radius-lg)',
                background: typeof colors.bg === 'string' && colors.bg.startsWith('linear')
                    ? colors.bg : colors.bg,
                color: colors.text,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
                {platform}
            </div>

            {/* Open externally */}
            <a
                href={submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 'var(--bd-radius-lg)',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}
            >
                <ExternalLink size={11} /> Open original
            </a>

            {/* ── iframe with optional bottom-clip for Instagram ── */}
            {pKey === 'instagram' ? (
                /*
                 * Instagram embed bottom-clip:
                 * The embed iframe contains:
                 *   [top]  actual video / image
                 *   [bottom] action bar (likes, comment, "View more on Instagram")
                 *
                 * Strategy: place an overflow:hidden wrapper that is INSTAGRAM_CLIP_PX
                 * shorter than the iframe's natural height. The video sits at the top
                 * so it remains fully visible; the action bar slides below the clip
                 * edge and is hidden.
                 */
                <div style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 'var(--bd-radius-2xl)',
                    // We use a fixed height slightly shorter than a 1:1 Instagram embed.
                    // Instagram reels/posts embed at roughly 1:1.25 ratio.
                    // We clip INSTAGRAM_CLIP_PX from the bottom.
                    height: `calc(100vw * 0.55 - ${INSTAGRAM_CLIP_PX}px)`,
                    minHeight: 340,
                    maxHeight: 560,
                    background: '#000',
                }}>
                    <iframe
                        src={embedUrl}
                        title="Instagram video"
                        style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%',
                            // Make the iframe INSTAGRAM_CLIP_PX taller than container
                            // so the action bar is pushed below the clip boundary
                            height: `calc(100% + ${INSTAGRAM_CLIP_PX}px)`,
                            border: 'none',
                            background: '#000',
                        }}
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowFullScreen
                        scrolling="no"
                        onError={() => setEmbedError(true)}
                    />
                </div>
            ) : (
                <iframe
                    src={embedUrl}
                    title={`${platform} video`}
                    style={{
                        width: '100%',
                        aspectRatio: pKey === 'tiktok' ? '9/16' : '16/9',
                        border: 'none',
                        borderRadius: 'var(--bd-radius-2xl)',
                        background: '#000',
                        display: 'block',
                        maxHeight: pKey === 'tiktok' ? 620 : 'none'
                    }}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    onError={() => setEmbedError(true)}
                />
            )}
        </div>
    );
};

// ─── Native Video Player ──────────────────────────────────────────────────────
const NativeVideoPlayer = ({ src, sponsorTimestamp, ctaTimestamp }) => {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setHasError(false);
    }, [src]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(() => setHasError(true));
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleProgressClick = (e) => {
        if (!progressRef.current || !videoRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        videoRef.current.currentTime = pct * duration;
    };

    const jumpTo = (time) => {
        if (videoRef.current && time !== null) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
            if (!isPlaying) { videoRef.current.play().catch(() => {}); setIsPlaying(true); }
        }
    };

    if (hasError) {
        return (
            <div className="aq-video-error">
                <AlertCircle size={36} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Failed to load video</div>
                <button onClick={() => setHasError(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    borderRadius: 'var(--bd-radius-lg)', background: 'var(--bd-danger-muted)',
                    border: '1px solid var(--bd-danger-border)', color: 'var(--bd-danger)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                    <RotateCcw size={14} /> Retry
                </button>
            </div>
        );
    }

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="aq-video-container">
            <video
                ref={videoRef}
                src={src}
                onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
                onError={() => setHasError(true)}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
                loop={false}
                style={{ cursor: 'pointer' }}
            />

            {!isPlaying && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Play size={24} style={{ color: '#fff', marginLeft: 3 }} />
                    </motion.div>
                </div>
            )}

            <div className="aq-video-controls">
                <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <div style={{ flex: 1 }} />
                {sponsorTimestamp !== null && (
                    <button onClick={() => jumpTo(sponsorTimestamp)} style={{
                        background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 'var(--bd-radius-md)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, color: '#a78bfa', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        <Zap size={12} /> Sponsor
                    </button>
                )}
                {ctaTimestamp !== null && (
                    <button onClick={() => jumpTo(ctaTimestamp)} style={{
                        background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: 'var(--bd-radius-md)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, color: '#60a5fa', cursor: 'pointer'
                    }}>
                        CTA
                    </button>
                )}
                <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            <div className="aq-video-progress" ref={progressRef} onClick={handleProgressClick}>
                <div className="aq-video-progress__fill" style={{ width: `${progressPct}%` }} />
                {sponsorTimestamp !== null && duration > 0 && (
                    <div
                        className="aq-video-progress__marker aq-video-progress__marker--sponsor"
                        style={{ left: `${(sponsorTimestamp / duration) * 100}%` }}
                        title={`Sponsor spot at ${formatTime(sponsorTimestamp)}`}
                    />
                )}
                {ctaTimestamp !== null && duration > 0 && (
                    <div
                        className="aq-video-progress__marker aq-video-progress__marker--cta"
                        style={{ left: `${(ctaTimestamp / duration) * 100}%` }}
                        title={`CTA at ${formatTime(ctaTimestamp)}`}
                    />
                )}
            </div>
        </div>
    );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
/**
 * @param {string}  src              - Direct video URL (for platform = 'Other')
 * @param {string}  platform         - 'YouTube' | 'TikTok' | 'Instagram' | 'Other'
 * @param {string}  videoId          - YouTube video ID (optional, can be parsed from src)
 * @param {string}  submissionUrl    - Original URL the creator submitted
 * @param {number}  sponsorTimestamp - seconds (native only)
 * @param {number}  ctaTimestamp     - seconds (native only)
 */
const VideoReviewPlayer = ({
    src,
    platform,
    videoId,
    submissionUrl,
    sponsorTimestamp = null,
    ctaTimestamp = null
}) => {
    const effectiveUrl = submissionUrl || src;
    const pNorm = (platform || '').toLowerCase();

    // No submission at all
    if (!effectiveUrl) {
        return (
            <div className="aq-video-empty">
                <Film size={40} style={{ opacity: 0.4 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>No video submitted</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                    This submission is script-based or awaiting upload
                </div>
            </div>
        );
    }

    // Social platform embed
    if (pNorm === 'youtube' || pNorm === 'tiktok' || pNorm === 'instagram') {
        const embedUrl = buildEmbedUrl(platform, effectiveUrl, videoId);

        if (!embedUrl) {
            // Could not parse ID — show link fallback
            return (
                <div style={{
                    width: '100%', aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 12,
                    background: 'var(--bd-bg-secondary)', border: '1px solid var(--bd-border-subtle)',
                    borderRadius: 'var(--bd-radius-2xl)', color: 'var(--bd-text-muted)'
                }}>
                    <Film size={36} style={{ opacity: 0.5 }} />
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                        Could not embed {platform} video
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>URL format not recognised</div>
                    <a
                        href={effectiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 'var(--bd-radius-lg)',
                            background: 'var(--bd-primary)', color: '#fff',
                            fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 4
                        }}
                    >
                        <ExternalLink size={14} /> Open on {platform}
                    </a>
                </div>
            );
        }

        return (
            <EmbedPlayer
                embedUrl={embedUrl}
                platform={platform}
                submissionUrl={effectiveUrl}
            />
        );
    }

    // Native video (direct file URL or unknown platform)
    return (
        <NativeVideoPlayer
            src={effectiveUrl}
            sponsorTimestamp={sponsorTimestamp}
            ctaTimestamp={ctaTimestamp}
        />
    );
};

export default VideoReviewPlayer;
