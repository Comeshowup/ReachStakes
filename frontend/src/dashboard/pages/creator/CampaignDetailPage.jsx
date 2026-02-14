import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    ArrowLeft,
    Briefcase,
    FileText,
    Link as LinkIcon,
    BarChart3,
    FolderOpen,
    Loader2,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    PlayCircle,
    ExternalLink,
    Users
} from "lucide-react";

// Tab Components
import {
    CampaignOverviewTab,
    CampaignSubmissionsTab,
    CampaignAttributionTab,
    CampaignVideoStatsTab,
    CampaignDocumentsTab
} from "../../components/campaign";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Tab configuration
const TABS = [
    { id: "overview", label: "Overview", icon: Briefcase },
    { id: "submissions", label: "Submissions", icon: FolderOpen },
    { id: "attribution", label: "Attribution", icon: LinkIcon },
    { id: "video-stats", label: "Video Stats", icon: BarChart3 },
    { id: "documents", label: "Documents", icon: FileText }
];

// Status configuration
const STATUS_CONFIG = {
    In_Progress: { label: "In Progress", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    Applied: { label: "Applied", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    Invited: { label: "Invited", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    Completed: { label: "Completed", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" }
};

const CampaignDetailPage = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (campaignId) {
            fetchCampaignDetails();
        }
    }, [campaignId]);

    const fetchCampaignDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");

            // Fetch collaboration details
            const response = await axios.get(`${API_BASE_URL}/collaborations/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                setCampaign(response.data.data || response.data);
            }
        } catch (err) {
            console.error("Failed to fetch campaign details:", err);
            setError("Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        if (!campaign) return null;

        switch (activeTab) {
            case "overview":
                return <CampaignOverviewTab campaign={campaign} />;
            case "submissions":
                return <CampaignSubmissionsTab collaborationId={campaignId} campaign={campaign} />;
            case "attribution":
                return <CampaignAttributionTab collaborationId={campaignId} campaign={campaign} />;
            case "video-stats":
                return <CampaignVideoStatsTab collaborationId={campaignId} campaign={campaign} />;
            case "documents":
                return <CampaignDocumentsTab collaborationId={campaignId} campaign={campaign} />;
            default:
                return <CampaignOverviewTab campaign={campaign} />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
                <div className="text-center">
                    <Briefcase className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6">
                        {error || "Campaign not found"}
                    </p>
                    <button
                        onClick={() => navigate('/creator/campaigns')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Campaigns
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.Applied;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="border-b border-white/5 bg-slate-900/50 sticky top-0 z-20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        {/* Left: Back + Campaign Info */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/creator/campaigns')}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                {/* Brand Logo */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                    {campaign.brandLogo ? (
                                        <img src={campaign.brandLogo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                        <Briefcase className="w-5 h-5 text-indigo-400" />
                                    )}
                                </div>

                                <div>
                                    <h1 className="text-xl font-black text-white">
                                        {campaign.campaignTitle || campaign.campaign?.title || "Campaign"}
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        {campaign.brandName || campaign.campaign?.brand?.brandProfile?.companyName || "Brand"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Status + Actions */}
                        <div className="flex items-center gap-4">
                            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 mt-6 -mb-px overflow-x-auto">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${isActive
                                            ? "text-indigo-400 border-indigo-500 bg-indigo-500/5"
                                            : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CampaignDetailPage;
