import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    CheckCircle,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    X,
    Clock,
    Calendar,
    MessageSquare,
    ExternalLink,
    MoreVertical,
    Volume2,
    VolumeX,
    Maximize2
} from "lucide-react";

// --- Mock Data ---
const VIDEO_SUBMISSIONS = [
    {
        id: 1,
        campaignName: "Summer Launch 2025",
        requirementType: "30s Vertical Video (TikTok/Reels)",
        submissionDate: "Nov 28, 2025",
        caption: "Here is the draft for the Summer Launch! I focused on the high-energy morning run vibe we discussed. Let me know if the transition at 0:15 works for you! 🏃‍♂️☀️",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-running-on-the-road-sunny-day-41484-large.mp4",
        creator: {
            name: "Alex Rivera",
            avatar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80",
            platform: "Instagram",
            handle: "@alex_runs",
            engagement: "4.8%"
        },
        revisionHistory: [
            {
                date: "Nov 25, 2025",
                version: "v1",
                feedback: "Great energy! Can we make the product shot at the end a bit longer? It feels rushed."
            }
        ]
    },
    {
        id: 2,
        campaignName: "Tech Review Series",
        requirementType: "60s Horizontal Review (YouTube)",
        submissionDate: "Nov 29, 2025",
        caption: "Full review of the new desk setup. I included the unboxing segment as requested. 📦🖥️",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4",
        creator: {
            name: "Marques Brownlee",
            avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&q=80",
            platform: "YouTube",
            handle: "@MKBHD",
            engagement: "8.2%"
        },
        revisionHistory: []
    },
    {
        id: 3,
        campaignName: "Beauty Essentials",
        requirementType: "15s Story (IG/Snap)",
        submissionDate: "Nov 30, 2025",
        caption: "Quick GRWM using the organic serum. Kept it super natural and authentic. ✨",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-makeup-in-front-of-the-mirror-3975-large.mp4",
        creator: {
            name: "Sarah Chen",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            platform: "TikTok",
            handle: "@sarah.glows",
            engagement: "5.5%"
        },
        revisionHistory: [
            {
                date: "Nov 28, 2025",
                version: "v1",
                feedback: "Please ensure the logo is visible in the first 3 seconds."
            },
            {
                date: "Nov 29, 2025",
                version: "v2",
                feedback: "Better, but the lighting is a bit dark in the intro."
            }
        ]
    }
];

// --- Components ---

const VideoPlayer = ({ src, isPlaying, onPlayPause, onTimeUpdate, currentTime, duration, onSeek, isMuted, onToggleMute }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(e => console.log("Play prevented", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, src]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="relative group w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl shadow-2xl">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                onTimeUpdate={(e) => onTimeUpdate(e.target.currentTime, e.target.duration)}
                onClick={onPlayPause}
                loop
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer relative group/progress" onClick={onSeek}>
                    <div
                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={onPlayPause} className="hover:text-indigo-400 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        <span className="text-sm font-medium font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onToggleMute} className="hover:text-indigo-400 transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <button className="hover:text-indigo-400 transition-colors">
                            <Maximize2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Play Button (Initial State) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoApprovalPanel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [feedbackMode, setFeedbackMode] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

    const currentVideo = VIDEO_SUBMISSIONS[currentIndex];

    const handleNext = () => {
        if (currentIndex < VIDEO_SUBMISSIONS.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
            resetPlayer();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
            resetPlayer();
        }
    };

    const resetPlayer = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setFeedbackMode(false);
        setFeedbackText("");
    };

    const handlePlayPause = () => setIsPlaying(!isPlaying);

    const handleTimeUpdate = (curr, dur) => {
        setCurrentTime(curr);
        setDuration(dur);
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        // In a real app, we'd need to expose a seek method on the player ref
        // For this mock, we'll just update the state, but the video element won't actually seek without the ref
    };

    const handleApprove = () => {
        // Mock approval logic
        alert(`Approved video for ${currentVideo.campaignName}!`);
        handleNext();
    };

    const handleSubmitRevision = () => {
        if (!feedbackText.trim()) return;
        // Mock revision logic
        alert(`Revision requested: ${feedbackText}`);
        handleNext();
    };

    return (
        <div className="h-[calc(100vh-4rem)] -m-8 flex flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-slate-950">
            {/* Left Column: Review Area */}
            <div className="w-full md:w-[70%] bg-gray-900 relative flex flex-col">
                {/* Navigation Header */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                    <div className="text-white/80 text-sm font-medium">
                        Submission {currentIndex + 1} of {VIDEO_SUBMISSIONS.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === VIDEO_SUBMISSIONS.length - 1}
                            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 flex flex-col justify-center items-center relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentVideo.id}
                            custom={direction}
                            initial={{ opacity: 0, x: direction * 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction * -50 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full max-w-4xl h-[60vh] flex flex-col gap-6"
                        >
                            {/* Video Player */}
                            <VideoPlayer
                                src={currentVideo.videoUrl}
                                isPlaying={isPlaying}
                                onPlayPause={handlePlayPause}
                                onTimeUpdate={handleTimeUpdate}
                                currentTime={currentTime}
                                duration={duration}
                                isMuted={isMuted}
                                onToggleMute={() => setIsMuted(!isMuted)}
                            />

                            {/* Caption & Decision Bar */}
                            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                                <p className="text-gray-300 text-sm mb-6 line-clamp-2">
                                    <span className="text-gray-500 font-bold mr-2">Caption:</span>
                                    {currentVideo.caption}
                                </p>

                                <div className="flex items-start gap-4">
                                    {!feedbackMode ? (
                                        <>
                                            <button
                                                onClick={handleApprove}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 hover:scale-[1.02]"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Approve & Schedule
                                            </button>
                                            <button
                                                onClick={() => setFeedbackMode(true)}
                                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                            >
                                                <RotateCcw className="w-5 h-5" />
                                                Request Revision
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full space-y-3">
                                            <div className="flex items-center justify-between text-white mb-1">
                                                <span className="font-bold text-sm">Revision Feedback</span>
                                                <button onClick={() => setFeedbackMode(false)} className="text-gray-400 hover:text-white">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                placeholder="Provide specific time-stamps and required changes here..."
                                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setFeedbackMode(false)}
                                                    className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSubmitRevision}
                                                    disabled={!feedbackText.trim()}
                                                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Submit Revision
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Column: Metadata Sidebar */}
            <div className="w-full md:w-[30%] bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 overflow-y-auto">
                <div className="p-6 space-y-8">
                    {/* Creator Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Creator</h3>
                        <div className="flex items-center gap-4">
                            <img
                                src={currentVideo.creator.avatar}
                                alt={currentVideo.creator.name}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 dark:ring-slate-800"
                            />
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{currentVideo.creator.name}</h2>
                                <a href="#" className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                    {currentVideo.creator.handle} <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Platform</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{currentVideo.creator.platform}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Avg. Engagement</p>
                                <p className="font-semibold text-green-600 dark:text-green-400">{currentVideo.creator.engagement}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800"></div>

                    {/* Campaign Context */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Campaign Context</h3>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{currentVideo.campaignName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                                <Calendar className="w-3 h-3" />
                                <span>Due: Dec 15, 2025</span>
                            </div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium mb-1">Requirement</p>
                            <p className="text-sm text-indigo-900 dark:text-indigo-100">{currentVideo.requirementType}</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800"></div>

                    {/* Revision History */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">History</h3>
                        <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-slate-800">
                            {/* Current Submission */}
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900"></div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Current Submission</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{currentVideo.submissionDate}</p>
                                <span className="inline-block px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold rounded uppercase">Pending Review</span>
                            </div>

                            {/* Past Revisions */}
                            {currentVideo.revisionHistory.map((revision, idx) => (
                                <div key={idx} className="relative pl-8 opacity-70">
                                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gray-300 dark:bg-slate-700 border-4 border-white dark:border-slate-900"></div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{revision.version}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{revision.date}</p>
                                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg text-xs text-gray-600 dark:text-slate-300 italic">
                                        "{revision.feedback}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoApprovalPanel;
