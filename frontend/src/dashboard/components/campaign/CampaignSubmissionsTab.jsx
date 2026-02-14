import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    Plus,
    Clock,
    CheckCircle,
    RotateCcw,
    Youtube,
    Instagram,
    ExternalLink,
    Loader2,
    Eye,
    Heart,
    MessageSquare,
    PlayCircle,
    X,
    Upload,
    Link as LinkIcon
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Status Badge
const StatusBadge = ({ status }) => {
    const config = {
        Pending_Approval: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
        Approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Approved" },
        Revision_Requested: { bg: "bg-red-500/10", text: "text-red-400", label: "Revision" },
        Submitted: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Submitted" }
    };
    const c = config[status] || config.Pending_Approval;
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
};

// Platform Icon
const PlatformIcon = ({ platform }) => {
    if (platform?.toLowerCase().includes("youtube")) return <Youtube className="w-5 h-5 text-red-500" />;
    if (platform?.toLowerCase().includes("instagram")) return <Instagram className="w-5 h-5 text-pink-500" />;
    return <PlayCircle className="w-5 h-5 text-indigo-500" />;
};

// Submission Card
const SubmissionCard = ({ submission }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 transition-all"
        >
            <div className="flex items-start gap-4">
                {/* Thumbnail or Platform Icon */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-white/10 overflow-hidden">
                    {submission.thumbnail ? (
                        <img src={submission.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <PlatformIcon platform={submission.platform} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="font-bold text-white truncate">
                                {submission.title || "Content Submission"}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                <PlatformIcon platform={submission.platform} />
                                {submission.platform || "Video"} • {new Date(submission.createdAt || submission.date).toLocaleDateString()}
                            </p>
                        </div>
                        <StatusBadge status={submission.status} />
                    </div>

                    {/* Video Stats */}
                    {submission.stats && submission.link && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs font-bold text-slate-300">
                                    {submission.stats.views?.toLocaleString() || 0}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Heart className="w-3.5 h-3.5 text-pink-400" />
                                <span className="text-xs font-bold text-slate-300">
                                    {submission.stats.likes?.toLocaleString() || 0}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs font-bold text-slate-300">
                                    {submission.stats.comments?.toLocaleString() || 0}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                        {submission.link && (
                            <a
                                href={submission.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View
                            </a>
                        )}
                        {submission.status === "Revision_Requested" && (
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-xs font-bold text-amber-400 transition-all">
                                <RotateCcw className="w-3.5 h-3.5" />
                                Resubmit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Submission Modal
const SubmissionModal = ({ isOpen, onClose, collaborationId, onSuccess }) => {
    const [link, setLink] = useState("");
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!link.trim()) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE_URL}/collaborations/${collaborationId}/submit`,
                { link, title },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onSuccess?.();
            onClose();
            setLink("");
            setTitle("");
        } catch (error) {
            console.error("Failed to submit:", error);
            alert("Failed to submit content");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-black text-white">Submit Content</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                            Content Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Summer Collection Review"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                            Video/Content Link
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!link.trim() || submitting}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Submit
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Main Submissions Tab
const CampaignSubmissionsTab = ({ collaborationId, campaign }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, [collaborationId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter submissions for this specific campaign/collaboration
            const allSubmissions = response.data || [];
            const filtered = allSubmissions.filter(s =>
                s.collaborationId === parseInt(collaborationId) ||
                s.id === parseInt(collaborationId)
            );
            setSubmissions(filtered);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">Content Submissions</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {submissions.length} submission{submissions.length !== 1 ? "s" : ""} for this campaign
                    </p>
                </div>
                {campaign?.status === "In_Progress" && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Submit Content
                    </button>
                )}
            </div>

            {/* Submissions List */}
            {submissions.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
                    <PlayCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">
                        No submissions yet for this campaign
                    </p>
                    {campaign?.status === "In_Progress" && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Submit Your First Content
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.map((submission, idx) => (
                        <SubmissionCard key={submission.id || idx} submission={submission} />
                    ))}
                </div>
            )}

            {/* Submission Modal */}
            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                collaborationId={collaborationId}
                onSuccess={fetchSubmissions}
            />
        </div>
    );
};

export default CampaignSubmissionsTab;
