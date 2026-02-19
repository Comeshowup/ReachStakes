import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX, Maximize2,
    Film, AlertCircle, RotateCcw, Zap
} from 'lucide-react';

/**
 * VideoReviewPlayer — 16:9 full-width video player with timestamp markers,
 * sponsor/CTA jump buttons, and elegant empty/error states.
 */
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoReviewPlayer = ({
    src,
    sponsorTimestamp = null,   // seconds
    ctaTimestamp = null,        // seconds
    onTimestampClick
}) => {
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

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
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
            if (!isPlaying) {
                videoRef.current.play().catch(() => { });
                setIsPlaying(true);
            }
        }
    };

    // No video source — empty state
    if (!src) {
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

    // Video load error
    if (hasError) {
        return (
            <div className="aq-video-error">
                <AlertCircle size={36} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Failed to load video</div>
                <button
                    onClick={() => { setHasError(false); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 'var(--bd-radius-lg)',
                        background: 'var(--bd-danger-muted)', border: '1px solid var(--bd-danger-border)',
                        color: 'var(--bd-danger)', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
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
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => setHasError(true)}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
                loop={false}
                style={{ cursor: 'pointer' }}
            />

            {/* Play overlay when paused */}
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
                            background: 'rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Play size={24} style={{ color: '#fff', marginLeft: 3 }} />
                    </motion.div>
                </div>
            )}

            {/* Controls bar */}
            <div className="aq-video-controls">
                <button onClick={togglePlay} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#fff', padding: 4
                }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <span style={{
                    fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)'
                }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div style={{ flex: 1 }} />

                {/* Jump buttons */}
                {sponsorTimestamp !== null && (
                    <button onClick={() => jumpTo(sponsorTimestamp)} style={{
                        background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 'var(--bd-radius-md)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, color: '#a78bfa',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        <Zap size={12} /> Sponsor
                    </button>
                )}
                {ctaTimestamp !== null && (
                    <button onClick={() => jumpTo(ctaTimestamp)} style={{
                        background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: 'var(--bd-radius-md)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, color: '#60a5fa',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        CTA
                    </button>
                )}

                <button onClick={toggleMute} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#fff', padding: 4
                }}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            {/* Progress bar with markers */}
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

export default VideoReviewPlayer;
