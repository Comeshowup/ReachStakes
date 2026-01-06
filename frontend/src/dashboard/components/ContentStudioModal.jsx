import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Play,
    Pause,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Clock,
    Send
} from "lucide-react";

// Mock Video URL (placeholder)
const MOCK_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4";

const ContentStudioModal = ({ isOpen, onClose, campaignName, creatorName }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [comments, setComments] = useState([
        { id: 1, time: 5, text: "The logo is a bit blurry here.", author: "Brand Manager", type: "feedback" },
        { id: 2, time: 12, text: "Great energy in this shot!", author: "Brand Manager", type: "praise" }
    ]);
    const [newComment, setNewComment] = useState("");
    const videoRef = useRef(null);

    if (!isOpen) return null;

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
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

    const addComment = () => {
        if (!newComment.trim()) return;
        setComments([
            ...comments,
            {
                id: Date.now(),
                time: Math.floor(currentTime),
                text: newComment,
                author: "You",
                type: "feedback"
            }
        ]);
        setNewComment("");
        // Optionally pause video when commenting
        if (isPlaying) togglePlay();
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const jumpToTime = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 rounded-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden shadow-2xl border border-slate-800"
                >
                    {/* Left: Video Player */}
                    <div className="flex-1 flex flex-col bg-black relative group">
                        <div className="flex-1 flex items-center justify-center relative">
                            <video
                                ref={videoRef}
                                src={MOCK_VIDEO_URL}
                                className="max-h-full max-w-full"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onClick={togglePlay}
                            ></video>

                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center pl-1">
                                        <Play className="w-8 h-8 text-white fill-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="h-16 bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 left-0 right-0 p-4 flex items-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                            <div className="flex-1 mb-1.5">
                                <div className="h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer relative" onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pos = (e.clientX - rect.left) / rect.width;
                                    jumpToTime(pos * duration);
                                }}>
                                    <div className="h-full bg-indigo-500" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                                    {/* Markers for comments */}
                                    {comments.map(c => (
                                        <div
                                            key={c.id}
                                            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
                                            style={{ left: `${(c.time / duration) * 100}%` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                            <span className="text-white font-mono text-xs mb-1.5">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white text-lg">Review Content</h3>
                                <p className="text-xs text-slate-400">Campaign: {campaignName || "Summer Launch"}</p>
                                <p className="text-xs text-slate-400">Creator: {creatorName || "@SarahJ"}</p>
                            </div>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-300">
                                <p>🎥 <strong>Pro Tip:</strong> Click on the timeline to add a timestamped comment.</p>
                            </div>

                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="group flex gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                                    onClick={() => jumpToTime(comment.time)}
                                >
                                    <div className="text-xs font-mono font-bold text-indigo-400 pt-0.5 shrink-0">
                                        {formatTime(comment.time)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-200">{comment.author}</span>
                                            {comment.type === 'feedback' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Fix</span>}
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-800/50 border-t border-slate-800">
                            <div className="flex gap-2 mb-4">
                                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                                    @{formatTime(currentTime)}
                                </span>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Type feedback here..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            addComment();
                                        }
                                    }}
                                ></textarea>
                                <button
                                    onClick={addComment}
                                    className="absolute bottom-3 right-3 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                            <button className="py-3 rounded-xl font-bold text-sm bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Request Edits
                            </button>
                            <button className="py-3 rounded-xl font-bold text-sm bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-900/20">
                                <CheckCircle className="w-4 h-4" />
                                Approve Video
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ContentStudioModal;
