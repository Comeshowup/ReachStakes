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
    Volume2,
    VolumeX,
    Maximize2,
    ListFilter,
    CheckSquare,
    Shield,
    Loader2
} from "lucide-react";

import conciergeService from "../../api/conciergeService";
import brandService from "../../api/brandService";

// --- Tech-Luxe Video Player ---
const VideoPlayer = ({ src, isPlaying, onPlayPause, onSeek, currentTime, duration, isMuted, onToggleMute }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            isPlaying ? videoRef.current.play().catch(() => { }) : videoRef.current.pause();
        }
    }, [isPlaying, src]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = isMuted;
    }, [isMuted]);

    return (
        <div className="relative w-full h-[400px] bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
            {src ? (
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                    onClick={onPlayPause}
                    loop
                    onTimeUpdate={(e) => onSeek(e.target.currentTime, e.target.duration)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 bg-white/5">
                    No Video Source
                </div>
            )}

            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

            {/* Play Button Overlay */}
            {!isPlaying && src && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                    >
                        <Play className="w-6 h-6 text-white ml-1" />
                    </motion.div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onPlayPause} className="text-white hover:text-indigo-400 transition-colors">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="text-xs font-mono text-white/70">
                        {Math.floor(currentTime)}s / {Math.floor(duration)}s
                    </div>
                </div>
                <button onClick={onToggleMute} className="text-white hover:text-indigo-400">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 cursor-pointer" onClick={(e) => {
                // Mock seek logic
            }}>
                <div className="h-full bg-indigo-500" style={{ width: `${(currentTime / duration) * 100}%` }} />
            </div>
        </div>
    );
};

const ChecklistItem = ({ label, isChecked, isLoading }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
        <span className="text-sm text-slate-300 font-medium">{label}</span>
        {isLoading ? (
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        ) : isChecked ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-700" />
        )}
    </div>
);

const VideoApprovalPanel = () => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [feedback, setFeedback] = useState("");
    const [showRevisionInput, setShowRevisionInput] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get Brand Profile to get ID
                const profile = await brandService.getBrandProfile();
                if (profile?.data?.id) {
                    // 2. Get Submissions
                    // Note: Ideally backend provides a filtered endpoint. We fetch all for now.
                    const allCollabs = await conciergeService.getBrandQueue(profile.data.id);
                    // Filter for 'Under_Review' or just show all active
                    const pending = allCollabs.filter(c => c.status === 'Under_Review' || c.submissionUrl).map(mapCollabToModel);
                    setSubmissions(pending);
                    if (pending.length > 0) setSelectedId(pending[0].id);
                }
            } catch (error) {
                console.error("Failed to load approval queue", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Helpers
    const mapCollabToModel = (collab) => {
        // Parse milestones or default requirements
        let requirements = [
            { id: 101, label: "Platform Verification", fulfilled: !!collab.videoStats?.views }, // Dynamic check
            { id: 102, label: "Content Guidelines", fulfilled: true }, // Manual
        ];

        if (collab.milestones && Array.isArray(collab.milestones)) {
            requirements = collab.milestones.map((m, i) => ({
                id: i, label: m.title || m, fulfilled: m.completed
            }));
        }

        return {
            id: collab.id,
            mission: collab.campaign?.title || "Campaign",
            creator: collab.creator?.name || "Creator",
            handle: collab.creator?.creatorProfile?.instagramHandle || "Creator", // Fallback
            avatar: collab.creator?.avatar || "https://i.pravatar.cc/150",
            videoUrl: collab.submissionUrl,
            status: collab.status,
            submittedAt: new Date(collab.updatedAt).toLocaleDateString(),
            requirements,
            agreedPrice: collab.agreedPrice || 0,
            videoStats: collab.videoStats
        };
    };

    const selectedSubmission = submissions.find(s => s.id === selectedId);

    // Actions
    const handleVerify = async () => {
        if (!selectedId) return;
        setVerifyLoading(true);
        try {
            const result = await conciergeService.verifySocialMetrics(selectedId);
            // Result.data should have verified stats
            // Optimize: Update local state without full reload
            setSubmissions(prev => prev.map(s => s.id === selectedId ? {
                ...s,
                requirements: s.requirements.map(r => r.label.includes("Verification") ? { ...r, fulfilled: true } : r),
                videoStats: result.data.stats
            } : s));
            alert(`Verified! Views: ${result.data.stats.views}`);
        } catch (error) {
            console.error("Link Verification Failed", error);
            alert("Verification Failed: " + (error.response?.data?.message || error.message));
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedId) return;
        if (!confirm(`Using Mock Escrow: Release $${selectedSubmission.agreedPrice}?`)) return;

        setActionLoading(true);
        try {
            // 1. Mark as Approved
            await conciergeService.submitDecision(selectedId, "Approved");
            // 2. Release Escrow
            const result = await conciergeService.releaseEscrow(selectedId);

            alert(`Success! Transaction ID: ${result.transactionId}`);
            // Remove from queue or update status
            setSubmissions(prev => prev.filter(s => s.id !== selectedId));
            if (submissions.length > 1) setSelectedId(submissions[0].id); // Select different
            else setSelectedId(null);

        } catch (error) {
            console.error("Approval Failed", error);
            alert("Approval Failed: " + (error.response?.data?.message || "Server Error"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevision = async () => {
        if (!selectedId || !feedback) return;
        setActionLoading(true);
        try {
            await conciergeService.submitDecision(selectedId, "Changes_Requested", feedback);
            alert("Revision Requested Sent");
            setSubmissions(prev => prev.filter(s => s.id !== selectedId)); // Remove from pending view
            setFeedback("");
            setShowRevisionInput(false);
        } catch (error) {
            alert("Failed to request revision");
        } finally {
            setActionLoading(false);
        }
    };


    if (loading) return <div className="h-screen bg-[#09090B] flex items-center justify-center text-white">Loading Queue...</div>;

    return (
        <div className="h-full min-h-screen bg-[#09090B] text-slate-200 font-sans p-8 lg:p-12 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-500/80">Quality Assurance</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">One-Click Approval Queue</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {submissions.length} Pending Review
                    </span>
                </div>
            </div>

            {/* Split View Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full flex-1">

                {/* LEFT PANE: Submission Queue */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
                    {submissions.length === 0 && (
                        <div className="text-slate-500 text-sm text-center py-10">No pending submissions. Great job!</div>
                    )}
                    {submissions.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => { setSelectedId(item.id); setIsPlaying(false); }}
                            className={`group p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${selectedId === item.id ? 'bg-white/5 border-indigo-500/30 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                                        {/* Fallback avatar logic needed if src is null */}
                                        <img src={item.avatar} alt="Creator" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold ${selectedId === item.id ? 'text-white' : 'text-slate-300'}`}>{item.creator}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.handle}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">{item.submittedAt}</span>
                            </div>

                            <p className="text-xs font-medium text-slate-400 mb-3">{item.mission}</p>

                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border text-amber-400 border-amber-500/20 bg-amber-500/5`}>
                                    {item.status.replace("_", " ")}
                                </span>
                            </div>

                            {selectedId === item.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                            )}
                        </div>
                    ))}
                </div>

                {/* RIGHT PANE: Workspace (Player + Inspector) */}
                <div className="lg:col-span-8 flex flex-col h-full gap-6">
                    {selectedSubmission ? (
                        <>
                            {/* Top: Media Player */}
                            <div className="flex-1 min-h-[400px]">
                                <VideoPlayer
                                    src={selectedSubmission.videoUrl}
                                    isPlaying={isPlaying}
                                    onPlayPause={() => setIsPlaying(!isPlaying)}
                                    onSeek={(curr, dur) => { setCurrentTime(curr); setDuration(dur); }}
                                    currentTime={currentTime}
                                    duration={duration}
                                    isMuted={isMuted}
                                    onToggleMute={() => setIsMuted(!isMuted)}
                                />
                            </div>

                            {/* Bottom: Split Inspector (Checklist | Action) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">

                                {/* Requirement Checklist */}
                                <div className="bg-[#0e0e11] rounded-3xl border border-white/5 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <CheckSquare className="w-5 h-5 text-indigo-400" />
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Flight Check</h3>
                                        </div>
                                        <button
                                            onClick={handleVerify}
                                            disabled={verifyLoading}
                                            className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white transition-colors"
                                        >
                                            {verifyLoading ? "Verifying..." : "Run Auto-Verify"}
                                        </button>
                                    </div>
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        {selectedSubmission.requirements.map(req => (
                                            <ChecklistItem key={req.id} label={req.label} isChecked={req.fulfilled} isLoading={req.label.includes("Verification") && verifyLoading} />
                                        ))}
                                    </div>
                                </div>

                                {/* Action Console */}
                                <div className="bg-[#0e0e11] rounded-3xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                                    {!showRevisionInput ? (
                                        <>
                                            <div>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <Shield className="w-5 h-5 text-emerald-400" />
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Escrow Release</h3>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                                    Approving this submission will automatically release <strong className="text-emerald-400">${selectedSubmission.agreedPrice}</strong> from the campaign escrow vault to the creator.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <button
                                                    onClick={() => setShowRevisionInput(true)}
                                                    disabled={actionLoading}
                                                    className="py-4 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ListFilter className="w-4 h-4" />
                                                    Revision
                                                </button>
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={actionLoading}
                                                    className="py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    Approve & Pay
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col h-full">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-bold text-white">Request Changes</h3>
                                                <button onClick={() => setShowRevisionInput(false)}><X className="w-4 h-4 text-slate-400" /></button>
                                            </div>
                                            <textarea
                                                className="w-full flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:border-indigo-500/50"
                                                placeholder="Describe strictly what needs to be changed..."
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                            />
                                            <button
                                                onClick={handleRevision}
                                                disabled={actionLoading}
                                                className="mt-4 w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
                                            >
                                                {actionLoading ? "Sending..." : "Submit Revision Request"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-600">
                            Select a submission to review
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VideoApprovalPanel;
