import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Youtube,
    Instagram,
    ExternalLink,
    Loader2,
    RefreshCw,
    Calendar,
    Filter,
    ChevronDown,
    Play
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Platform icon component
const PlatformIcon = ({ platform, className = "w-5 h-5" }) => {
    const platformLower = platform?.toLowerCase();
    switch (platformLower) {
        case "youtube":
            return <Youtube className={`${className} text-red-500`} />;
        case "instagram":
            return <Instagram className={`${className} text-pink-500`} />;
        case "tiktok":
            return (
                <span className="text-xs font-black bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded">
                    TT
                </span>
            );
        default:
            return <Play className={`${className} text-gray-400`} />;
    }
};

// Format large numbers
const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    const n = parseInt(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
};

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            {trend !== undefined && trend !== null && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <p className="text-3xl font-black text-white mb-1">{formatNumber(value)}</p>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
);

// Video Stats Row Component
const VideoStatsRow = ({ submission, index }) => {
    const stats = submission.stats || {};
    const views = stats.views || stats.viewCount || 0;
    const likes = stats.likes || stats.likeCount || 0;
    const comments = stats.comments || stats.commentCount || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-slate-900/50 hover:bg-slate-900 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all p-5"
        >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left: Platform & Campaign Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <PlatformIcon platform={submission.platform} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                            {submission.title || submission.campaignTitle}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-slate-500">{submission.brandName}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span className="text-xs text-slate-600">
                                {new Date(submission.date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center: Stats Grid */}
                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="text-center">
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className="font-bold">{formatNumber(views)}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">Views</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="font-bold">{formatNumber(likes)}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">Likes</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <MessageCircle className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold">{formatNumber(comments)}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">Comments</p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {submission.link && (
                        <a
                            href={submission.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-xl text-slate-400 hover:text-indigo-400 transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${submission.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : submission.status === "Under_Review"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}>
                        {submission.status?.replace("_", " ") || "Pending"}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const VideoStatsPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState("all");

    const fetchSubmissions = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter only submissions that have been submitted (have a link)
            const submittedOnly = response.data.filter(s => s.link);
            setSubmissions(submittedOnly);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    // Calculate totals
    const totals = submissions.reduce((acc, sub) => {
        const stats = sub.stats || {};
        return {
            views: acc.views + (parseInt(stats.views || stats.viewCount || 0)),
            likes: acc.likes + (parseInt(stats.likes || stats.likeCount || 0)),
            comments: acc.comments + (parseInt(stats.comments || stats.commentCount || 0))
        };
    }, { views: 0, likes: 0, comments: 0 });

    // Filter submissions
    const filteredSubmissions = submissions.filter(sub => {
        if (filter === "all") return true;
        return sub.platform?.toLowerCase() === filter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-500" />
                        VIDEO STATS
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Track your submitted video performance
                    </p>
                </div>
                <button
                    onClick={() => fetchSubmissions(true)}
                    disabled={refreshing}
                    className="group bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform"}`} />
                    {refreshing ? "Refreshing..." : "Refresh Stats"}
                </button>
            </div>

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={Eye}
                    label="Total Views"
                    value={totals.views}
                    color="bg-blue-500/10 text-blue-400"
                />
                <StatsCard
                    icon={Heart}
                    label="Total Likes"
                    value={totals.likes}
                    color="bg-pink-500/10 text-pink-400"
                />
                <StatsCard
                    icon={MessageCircle}
                    label="Total Comments"
                    value={totals.comments}
                    color="bg-emerald-500/10 text-emerald-400"
                />
                <StatsCard
                    icon={Play}
                    label="Videos Submitted"
                    value={submissions.length}
                    color="bg-indigo-500/10 text-indigo-400"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-500" />
                <div className="flex gap-2">
                    {["all", "youtube", "instagram", "tiktok"].map(platform => (
                        <button
                            key={platform}
                            onClick={() => setFilter(platform)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === platform
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                                }`}
                        >
                            {platform}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black italic tracking-tight text-white uppercase">
                        Submitted Videos
                    </h2>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {filteredSubmissions.length} Videos
                    </span>
                </div>

                {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                        <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            {filter === "all"
                                ? "No videos submitted yet. Apply to campaigns and submit your content!"
                                : `No ${filter} videos found`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSubmissions.map((submission, index) => (
                            <VideoStatsRow key={submission.id} submission={submission} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoStatsPage;
