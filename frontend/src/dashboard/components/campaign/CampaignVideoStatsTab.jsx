import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2,
    Youtube, Instagram, Music2, ExternalLink, Loader2, RefreshCw,
    Play, Users, ChevronDown
} from "lucide-react";
import SubmissionDemographics from "./SubmissionDemographics.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ─── Utilities ────────────────────────────────────────────────────────────────

const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    const n = Number(num);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
};

const PlatformIcon = ({ platform, className = "w-5 h-5" }) => {
    const p = (platform || "").toLowerCase();
    if (p.includes("youtube")) return <Youtube className={`${className} text-red-500`} />;
    if (p.includes("instagram")) return <Instagram className={`${className} text-pink-500`} />;
    if (p.includes("tiktok")) return <Music2 className={`${className} text-cyan-400`} />;
    return <Play className={`${className} text-indigo-500`} />;
};

// ─── Stats Card ───────────────────────────────────────────────────────────────

const StatsCard = ({ icon: Icon, label, value, color, subLabel }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <Icon className={`w-5 h-5 ${color} mb-2`} />
        <p className="text-2xl font-black text-white">
            {typeof value === "string" ? value : formatNumber(value)}
        </p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
        {subLabel && <p className="text-[10px] text-slate-600 mt-0.5">{subLabel}</p>}
    </div>
);

// ─── Video Row ─────────────────────────────────────────────────────────────────

const VideoStatsRow = ({ submission, index, collaborationId, onStatsRefreshed }) => {
    const [refreshing, setRefreshing] = useState(false);
    const stats = submission.stats || {};

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const token = localStorage.getItem("token");
            const collabId = submission.id || collaborationId;
            await axios.get(`${API_BASE_URL}/collaborations/${collabId}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onStatsRefreshed?.();
        } catch (err) {
            console.error("Stats refresh failed:", err);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 transition-all"
        >
            <div className="flex items-center gap-4">
                {/* Platform icon thumbnail */}
                <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <PlatformIcon platform={submission.platform || submission.submissionPlatform} className="w-6 h-6" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">
                        {submission.title || submission.submissionTitle || "Content"}
                    </h4>
                    <span className="text-xs text-slate-500">
                        {new Date(submission.createdAt || submission.date).toLocaleDateString()}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 flex-shrink-0">
                    <StatPill icon={Eye} value={stats.views} color="text-blue-400" />
                    <StatPill icon={Heart} value={stats.likes} color="text-pink-400" />
                    <StatPill icon={MessageCircle} value={stats.comments} color="text-emerald-400" className="hidden md:flex" />
                    <StatPill icon={Share2} value={stats.shares} color="text-purple-400" className="hidden md:flex" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {(submission.link || submission.submissionUrl) && (
                        <a
                            href={submission.link || submission.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                        </a>
                    )}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Refresh stats"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

function StatPill({ icon: Icon, value, color, className = "flex" }) {
    return (
        <div className={`items-center gap-1 ${className}`}>
            <p className="font-bold text-white text-sm">{formatNumber(value)}</p>
            <Icon className={`w-3 h-3 ${color}`} />
        </div>
    );
}

// ─── Demographics Panel ────────────────────────────────────────────────────────

const DemographicsPanel = ({ collaborationId }) => {
    const [demographics, setDemographics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [fetched, setFetched] = useState(false);

    const fetchDemographics = useCallback(async () => {
        if (fetched) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const resp = await axios.get(`${API_BASE_URL}/collaborations/${collaborationId}/demographics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDemographics(resp.data.demographics);
            setFetched(true);
        } catch (err) {
            console.error("Demographics fetch failed:", err);
            setDemographics(null);
        } finally {
            setLoading(false);
        }
    }, [collaborationId, fetched]);

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next && !fetched) fetchDemographics();
    };

    return (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            {/* Toggle Header */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Audience Demographics</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        CREATOR ACCOUNT
                    </span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Panel Content */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <SubmissionDemographics demographics={demographics} />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const CampaignVideoStatsTab = ({ collaborationId, campaign }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchSubmissions(); }, [collaborationId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter to this collaboration's submissions with a URL
            const filtered = (response.data || []).filter(s =>
                (s.collaborationId === parseInt(collaborationId) || s.id === parseInt(collaborationId)) && s.link
            );
            setSubmissions(filtered);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Aggregate totals across all submissions
    const totals = submissions.reduce((acc, s) => {
        const stats = s.stats || {};
        return {
            views:    acc.views    + parseInt(stats.views    || 0),
            likes:    acc.likes    + parseInt(stats.likes    || 0),
            comments: acc.comments + parseInt(stats.comments || 0),
            shares:   acc.shares   + parseInt(stats.shares   || 0),
        };
    }, { views: 0, likes: 0, comments: 0, shares: 0 });

    const engagementRate = totals.views > 0
        ? ((totals.likes + totals.comments) / totals.views * 100).toFixed(2)
        : "0.00";

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        Video Performance
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {submissions.length} video{submissions.length !== 1 ? 's' : ''} submitted
                    </p>
                </div>
                <button
                    onClick={fetchSubmissions}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    title="Refresh all"
                >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* KPI Cards */}
            {submissions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard icon={Eye}           label="Views"         value={totals.views}    color="text-blue-400" />
                    <StatsCard icon={Heart}         label="Likes"         value={totals.likes}    color="text-pink-400" />
                    <StatsCard icon={MessageCircle} label="Comments"      value={totals.comments} color="text-emerald-400" />
                    <StatsCard icon={Share2}        label="Shares"        value={totals.shares}   color="text-purple-400"
                        subLabel={totals.shares === 0 ? "Platform limitation" : undefined}
                    />
                </div>
            )}

            {/* Engagement Rate full-width card */}
            {submissions.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    <div>
                        <p className="text-2xl font-black text-white">{engagementRate}%</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            Avg. Engagement Rate
                        </p>
                    </div>
                </div>
            )}

            {/* Video List */}
            {submissions.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-2xl">
                    <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs uppercase tracking-widest">No video stats yet</p>
                    <p className="text-slate-600 text-xs mt-2">Submit content to start tracking performance</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {submissions.map((s, i) => (
                        <VideoStatsRow
                            key={s.id || i}
                            submission={s}
                            index={i}
                            collaborationId={collaborationId}
                            onStatsRefreshed={fetchSubmissions}
                        />
                    ))}
                </div>
            )}

            {/* Demographics Panel — collapsible */}
            <DemographicsPanel collaborationId={collaborationId} />
        </div>
    );
};

export default CampaignVideoStatsTab;
