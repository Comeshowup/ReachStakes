import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    Briefcase,
    ChevronRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Filter,
    Calendar,
    DollarSign,
    FileText,
    PlayCircle,
    Target,
    TrendingUp,
    Users
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Status configuration
const STATUS_CONFIG = {
    In_Progress: { label: "In Progress", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", icon: PlayCircle },
    Applied: { label: "Applied", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: Clock },
    Invited: { label: "Invited", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", icon: Users },
    Completed: { label: "Completed", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30", icon: CheckCircle },
    Rejected: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", icon: AlertCircle }
};

// Status Badge Component
const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
        </span>
    );
};

// Campaign Card Component
const CampaignCard = ({ campaign, onClick }) => {
    const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.Applied;
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className="group bg-slate-900/50 hover:bg-slate-900 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden"
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Brand & Campaign Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Brand Logo */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-white/10">
                            {campaign.brandLogo ? (
                                <img src={campaign.brandLogo} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                                <Briefcase className="w-6 h-6 text-indigo-400" />
                            )}
                        </div>

                        {/* Campaign Details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-lg truncate group-hover:text-indigo-400 transition-colors">
                                {campaign.campaignTitle || campaign.title || "Campaign"}
                            </h3>
                            <p className="text-sm text-slate-500 truncate">
                                {campaign.brandName || "Brand"}
                            </p>
                            {campaign.deadline && (
                                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Status */}
                    <div className="flex items-center gap-4">
                        <StatusBadge status={campaign.status} />
                        <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                {campaign.status === "In_Progress" && (
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-400">
                                {campaign.submissionCount || 0} Submissions
                            </span>
                        </div>
                        {campaign.earnings > 0 && (
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-400">
                                    ${campaign.earnings?.toLocaleString() || 0}
                                </span>
                            </div>
                        )}
                        {campaign.hasTrackingLinks && (
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-bold text-amber-400">
                                    Tracking Active
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Main MyCampaigns Page
const MyCampaigns = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-campaigns`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === "success") {
                setCampaigns(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(c => {
        if (filter === "all") return true;
        if (filter === "active") return c.status === "In_Progress";
        if (filter === "pending") return c.status === "Applied" || c.status === "Invited";
        if (filter === "completed") return c.status === "Completed";
        return true;
    });

    // Group campaigns by status for display
    const activeCampaigns = filteredCampaigns.filter(c => c.status === "In_Progress");
    const pendingCampaigns = filteredCampaigns.filter(c => c.status === "Applied" || c.status === "Invited");
    const completedCampaigns = filteredCampaigns.filter(c => c.status === "Completed");

    // Stats
    const stats = {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === "In_Progress").length,
        pending: campaigns.filter(c => c.status === "Applied" || c.status === "Invited").length,
        completed: campaigns.filter(c => c.status === "Completed").length
    };

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
                        <Briefcase className="w-8 h-8 text-indigo-500" />
                        MY CAMPAIGNS
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        All your active work in one place
                    </p>
                </div>
                <button
                    onClick={() => navigate('/creator/explore')}
                    className="group bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                >
                    <Target className="w-4 h-4" />
                    Find New Campaigns
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <Briefcase className="w-5 h-5 text-indigo-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.total}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Campaigns</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                    <PlayCircle className="w-5 h-5 text-emerald-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.active}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">In Progress</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                    <Clock className="w-5 h-5 text-blue-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.pending}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending</p>
                </div>
                <div className="bg-slate-500/5 border border-slate-500/20 rounded-2xl p-5">
                    <CheckCircle className="w-5 h-5 text-slate-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.completed}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Completed</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <Filter className="w-4 h-4 text-slate-500" />
                {[
                    { key: "all", label: "All" },
                    { key: "active", label: "In Progress" },
                    { key: "pending", label: "Pending" },
                    { key: "completed", label: "Completed" }
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === f.key
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Campaign Lists */}
            <div className="space-y-8">
                {/* Active Campaigns */}
                {activeCampaigns.length > 0 && (filter === "all" || filter === "active") && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black italic tracking-tight text-white uppercase flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-emerald-400" />
                            In Progress
                        </h2>
                        <div className="space-y-3">
                            {activeCampaigns.map((campaign, idx) => (
                                <CampaignCard
                                    key={campaign.id || idx}
                                    campaign={campaign}
                                    onClick={() => navigate(`/creator/campaign/${campaign.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Campaigns */}
                {pendingCampaigns.length > 0 && (filter === "all" || filter === "pending") && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black italic tracking-tight text-white uppercase flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            Pending
                        </h2>
                        <div className="space-y-3">
                            {pendingCampaigns.map((campaign, idx) => (
                                <CampaignCard
                                    key={campaign.id || idx}
                                    campaign={campaign}
                                    onClick={() => navigate(`/creator/campaign/${campaign.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Campaigns */}
                {completedCampaigns.length > 0 && (filter === "all" || filter === "completed") && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black italic tracking-tight text-white uppercase flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-slate-400" />
                            Completed
                        </h2>
                        <div className="space-y-3">
                            {completedCampaigns.map((campaign, idx) => (
                                <CampaignCard
                                    key={campaign.id || idx}
                                    campaign={campaign}
                                    onClick={() => navigate(`/creator/campaign/${campaign.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredCampaigns.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                        <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6">
                            {filter === "all"
                                ? "No campaigns yet. Start by exploring opportunities!"
                                : `No ${filter} campaigns found`}
                        </p>
                        <button
                            onClick={() => navigate('/creator/explore')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                        >
                            <Target className="w-4 h-4" />
                            Explore Campaigns
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCampaigns;
