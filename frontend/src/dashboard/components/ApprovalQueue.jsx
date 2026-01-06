import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    History,
    Play,
    Pause,
    Maximize2,
    ChevronRight,
    ChevronDown,
    FileText,
    Clock,
    Send,
    Download,
    ExternalLink,
    MessageSquare,
    CheckSquare,
    ShieldCheck
} from 'lucide-react';

// --- Rich Mock Data ---
const PENDING_ITEMS = [
    {
        id: 101,
        campaign: "Summer Launch 2026",
        creator: "Sarah Jenkins",
        handle: "@sarah.buys",
        avatar: "https://i.pravatar.cc/150?u=1",
        platform: "TikTok",
        submittedAt: "2 hours ago",
        version: 2,
        type: "Video Draft",
        mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
        notes: "Fixed the lighting in the intro as requested. Also added the overlay text earlier.",
        requirements: [
            { id: 1, label: "Mention 'Summer20' code", isMet: true },
            { id: 2, label: "Show product in use within first 3s", isMet: true },
            { id: 3, label: "Tag @ReachStakes in caption", isMet: false } // Brand manager needs to check
        ],
        history: [
            { id: 1, author: "Brand Manager", text: "Lighting is too dark in the intro. Please reshoot.", date: "Yesterday", type: "revision" },
            { id: 2, author: "Sarah Jenkins", text: "Sure thing! Uploading v2 shortly.", date: "Yesterday", type: "reply" }
        ]
    },
    {
        id: 102,
        campaign: "Tech Review Series",
        creator: "Tech Trekker",
        handle: "@tech.trek",
        avatar: "https://i.pravatar.cc/150?u=2",
        platform: "YouTube",
        submittedAt: "5 hours ago",
        version: 1,
        type: "Integration Script",
        mediaUrl: null, // Text based
        textContent: "SCRIPT SEGMENT:\n\n[00:00 - 00:30] Intro: Hey guys, before we dive into the GPU benchmarks, I want to deduce...\n\n[02:15] Sponsor Spot: That's where ReachStakes comes in. It's the only platform that gives you...",
        notes: "Here is the draft for the mid-roll segment. Let me know if the CTA is clear enough.",
        requirements: [
            { id: 1, label: "60-second minimum duration", isMet: true },
            { id: 2, label: "Personal anecdote included", isMet: true },
            { id: 3, label: "Clear Call-to-Action", isMet: true }
        ],
        history: []
    },
    {
        id: 103,
        campaign: "Summer Launch 2026",
        creator: "Bella Styles",
        handle: "@bellastyles",
        avatar: "https://i.pravatar.cc/150?u=3",
        platform: "Instagram",
        submittedAt: "1 day ago",
        version: 1,
        type: "Reel Final",
        mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-328-large.mp4",
        thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
        notes: "Hope you love this one! The color grading took forever 😅",
        requirements: [
            { id: 1, label: "Use trending audio", isMet: true },
            { id: 2, label: "No competitor logos visible", isMet: true }
        ],
        history: []
    }
];

const ApprovalQueue = () => {
    const [queue, setQueue] = useState(PENDING_ITEMS);
    const [selectedId, setSelectedId] = useState(PENDING_ITEMS[0]?.id);
    const [revisionMode, setRevisionMode] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    // Derived state for the active item
    const activeItem = queue.find(item => item.id === selectedId) || null;

    const handleSelect = (id) => {
        if (id === selectedId) return;
        setSelectedId(id);
        setRevisionMode(false);
        setFeedbackText("");
        setIsPlaying(false);
    };

    const handleApprove = () => {
        // Simulate "Approve & Next"
        setQueue(prev => prev.filter(i => i.id !== selectedId));
        // Auto-select next
        const remaining = queue.filter(i => i.id !== selectedId);
        if (remaining.length > 0) {
            setSelectedId(remaining[0].id);
        } else {
            setSelectedId(null);
        }
    };

    const handleRequestRevision = () => {
        // Simulate submitting feedback
        console.log(`Revision requested for ${selectedId}: ${feedbackText}`);
        setQueue(prev => prev.filter(i => i.id !== selectedId)); // Remove for demo purposes
        setRevisionMode(false);
        setFeedbackText("");

        // Auto-select next
        const remaining = queue.filter(i => i.id !== selectedId);
        if (remaining.length > 0) {
            setSelectedId(remaining[0].id);
        } else {
            setSelectedId(null);
        }
    };

    if (!activeItem && queue.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#09090B] text-center">
                <div className="space-y-4">
                    <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Queue Cleared</h2>
                    <p className="text-slate-400">You're all caught up! Great work.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#09090B] overflow-hidden font-sans">

            {/* --- LIST PANE (LEFT - 30%) --- */}
            <div className="w-[350px] flex-shrink-0 border-r border-white/10 flex flex-col bg-[#18181B]/50">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Approvals</h2>
                    <p className="text-2xl font-bold text-white">{queue.length} <span className="text-base font-normal text-slate-500">items</span></p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {queue.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className={`group relative p-4 rounded-xl cursor-pointer border transition-all duration-200 ${selectedId === item.id
                                ? "bg-indigo-500/10 border-indigo-500/50"
                                : "bg-transparent border-transparent hover:bg-white/5"
                                }`}
                        >
                            {/* Active Indicator Line */}
                            {selectedId === item.id && (
                                <motion.div
                                    layoutId="active-border"
                                    className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full"
                                />
                            )}

                            <div className="flex items-start gap-3 pl-2">
                                <div className="relative">
                                    <img src={item.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                                    {item.platform === 'TikTok' ? (
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-white/10 text-[8px]">🎵</span>
                                    ) : (
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center border border-white/10 text-[8px] text-white">▶</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-sm truncate ${selectedId === item.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {item.campaign}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate mb-1">{item.creator}</p>

                                    <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-slate-400 font-mono">
                                            v{item.version}
                                        </span>
                                        <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.submittedAt}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- REVIEW PANE (RIGHT - 70%) --- */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#09090B] relative">
                {activeItem && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeItem.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col h-full"
                        >
                            {/* Header / Action Bar */}
                            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#09090B]/80 backdrop-blur-md z-20">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        {activeItem.type}
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-normal">
                                            V{activeItem.version}
                                        </span>
                                    </h2>
                                    <div className="h-4 w-px bg-white/10" />
                                    <span className="text-sm text-slate-400">{activeItem.creator}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    {!revisionMode ? (
                                        <>
                                            <button
                                                onClick={() => setRevisionMode(true)}
                                                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-sm font-bold rounded-lg border border-amber-500/20 transition-all flex items-center gap-2"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                Request Revision
                                            </button>
                                            <button
                                                onClick={handleApprove}
                                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Approve & Next
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setRevisionMode(false)}
                                            className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Main Content Area: Scrollable */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                <div className="w-full space-y-6">

                                    {/* 1. Media Stage */}
                                    <div className="bg-[#18181B] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative group">
                                        {activeItem.mediaUrl ? (
                                            <div className="relative aspect-video bg-black flex items-center justify-center">
                                                <video
                                                    src={activeItem.mediaUrl}
                                                    className="w-full h-full object-contain"
                                                    controls={true}
                                                    loop
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-8 font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap bg-[#111113]">
                                                {activeItem.textContent}
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Workspace Split: Info Left, Feedback Right */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

                                        {/* Left Col: Requirements & Context */}
                                        <div className="lg:col-span-2 space-y-6">

                                            {/* Creator Notes */}
                                            <div className="bg-[#18181B] rounded-xl p-6 border border-white/5">
                                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                                                    Creator Notes
                                                </h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    "{activeItem.notes}"
                                                </p>
                                            </div>

                                            {/* Requirements Checklist */}
                                            <div className="bg-[#18181B] rounded-xl p-6 border border-white/5">
                                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                                    Deliverables Checklist
                                                </h3>
                                                <div className="space-y-3">
                                                    {activeItem.requirements.map(req => (
                                                        <div key={req.id} className="flex items-start gap-3 group">
                                                            <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${req.isMet ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' : 'bg-transparent border-slate-700 text-transparent group-hover:border-slate-600'}`}>
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className={`text-sm ${req.isMet ? 'text-slate-300' : 'text-slate-500'}`}>
                                                                {req.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>

                                        {/* Right Col: Revision Interface (or History) */}
                                        <div className="space-y-6">

                                            {/* Inline Feedback Form */}
                                            <AnimatePresence>
                                                {revisionMode && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                        className="bg-[#18181B] rounded-xl border border-amber-500/30 overflow-hidden shadow-lg shadow-amber-900/10"
                                                    >
                                                        <div className="p-4 bg-amber-500/10 border-b border-amber-500/10 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4 text-amber-500" />
                                                            <h3 className="text-sm font-bold text-amber-500">Request Revision</h3>
                                                        </div>
                                                        <div className="p-4">
                                                            <textarea
                                                                placeholder="Describe what needs to be changed..."
                                                                value={feedbackText}
                                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                                className="w-full h-32 bg-black/40 rounded-lg p-3 text-sm text-white border border-white/10 focus:border-amber-500/50 focus:outline-none resize-none mb-3"
                                                            />
                                                            <button
                                                                onClick={handleRequestRevision}
                                                                disabled={!feedbackText.trim()}
                                                                className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Send className="w-3 h-3" />
                                                                Submit Feedback
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* History Stream */}
                                            <div className="bg-[#18181B] rounded-xl p-6 border border-white/5">
                                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                    <History className="w-4 h-4 text-slate-400" />
                                                    Activity History
                                                </h3>

                                                {activeItem.history.length > 0 ? (
                                                    <div className="space-y-6 relative border-l border-white/10 ml-2 pl-6">
                                                        {activeItem.history.map(event => (
                                                            <div key={event.id} className="relative">
                                                                <div className={`absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#18181B] ${event.type === 'revision' ? 'bg-amber-500' : 'bg-indigo-500'}`} />

                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="text-xs font-bold text-slate-300">{event.author}</span>
                                                                    <span className="text-[10px] text-slate-500">{event.date}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-2 rounded-lg rounded-tl-none">
                                                                    {event.text}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-slate-500 text-xs">
                                                        No previous revisions.
                                                        <br />This is Version 1.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default ApprovalQueue;
