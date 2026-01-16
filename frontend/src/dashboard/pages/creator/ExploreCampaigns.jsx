import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Search, Filter, SlidersHorizontal, MapPin, DollarSign, Calendar, ArrowUpRight, Loader2, Zap, ShieldCheck, AlertTriangle } from "lucide-react";
import axios from "axios";
import GuaranteedPayBadge from "../../components/GuaranteedPayBadge";
import CampaignFeedTabs from "../../components/CampaignFeedTabs";

const CampaignCard = ({ campaign, index, onClick }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    // Derived Brand Color Glow
    const brandColor = campaign.brandColor || "#6366f1"; // Default to indigo
    const isHighPriority = campaign._matchScore > 10; // Phase 2: High match score

    // Phase 2: Check if expiring soon (within 3 days)
    const isExpiringSoon = campaign.deadline && (() => {
        const deadline = new Date(campaign.deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft >= 0;
    })();

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                "--brand-glow": `${brandColor}33`, // 20% opacity
                "--brand-neon": brandColor
            }}
            className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full perspective-1000 cursor-pointer relative
                ${isExpiringSoon
                    ? "border-red-500/50 ring-2 ring-red-500/20 animate-pulse-subtle"
                    : isHighPriority
                        ? "border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)] dark:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                        : "border-gray-100 dark:border-slate-800 hover:border-white/20"}
                hover:shadow-2xl hover:shadow-[var(--brand-glow)]
            `}
        >
            {/* Expiring Soon Badge */}
            {isExpiringSoon && (
                <div className="absolute -top-2 -right-2 z-10">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        <AlertTriangle size={10} />
                        Expiring
                    </span>
                </div>
            )}

            {/* Brand Gradient Background Glow */}
            <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity bg-[var(--brand-neon)]"
            />
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6" style={{ transform: "translateZ(30px)" }}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={campaign.logo} alt={campaign.brand} className="w-10 h-10 rounded-xl object-cover shadow-sm relative z-10" />
                        <div className="absolute inset-0 bg-[var(--brand-neon)] blur-md opacity-20 scale-110"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{campaign.brand}</h3>
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{campaign.platform}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {isHighPriority && !isExpiringSoon && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                            <Zap size={10} className="fill-indigo-400" /> For You
                        </span>
                    )}
                    {/* Guaranteed Pay Badge */}
                    {campaign.isGuaranteedPay && (
                        <GuaranteedPayBadge
                            variant="guaranteed"
                            size="sm"
                        />
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="flex-1 mb-6" style={{ transform: "translateZ(20px)" }}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {campaign.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {campaign.description}
                </p>
            </div>

            {/* Card Footer */}
            <div className="space-y-4" style={{ transform: "translateZ(10px)" }}>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 font-medium">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {campaign.budget}
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isExpiringSoon ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-slate-400'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        Due {campaign.deadline}
                    </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold text-sm group-hover:bg-[var(--brand-neon)] group-hover:text-white transition-all flex items-center justify-center gap-2">
                    View Details & Apply
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

const ExploreCampaigns = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("new"); // Phase 2: Tab state
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    // Phase 2: Fetch campaigns based on active tab
    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                // Use discover endpoint for smart filtering
                const response = await axios.get(`${API_BASE_URL}/campaigns/discover`, {
                    params: { tab: activeTab },
                    headers: { Authorization: `Bearer ${token}` }
                });

                const formattedCampaigns = response.data.data.map((c, index) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description || "",
                    brand: c.brand?.brandProfile?.companyName || "Unknown Brand",
                    logo: c.brand?.brandProfile?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.brand?.brandProfile?.companyName || 'Brand')}&background=random`,
                    platform: c.platformRequired || "Any",
                    type: c.campaignType || "General",
                    budget: c.targetBudget ? `$${parseFloat(c.targetBudget).toLocaleString()}` : "Negotiable",
                    deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "Open",
                    deadlineRaw: c.deadline,
                    brandColor: ["#6366f1", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#06b6d4"][index % 6],
                    escrowBalance: parseFloat(c.escrowBalance) || 0,
                    budgetMax: parseFloat(c.targetBudget || c.budgetMax) || 0,
                    isGuaranteedPay: c.isGuaranteedPay || parseFloat(c.escrowBalance) > 0,
                    tags: c.tags || [],
                    _matchScore: c._matchScore || 0 // Phase 2: Match score from API
                }));

                setCampaigns(formattedCampaigns);
            } catch (error) {
                console.error("Failed to fetch campaigns", error);
                // Fallback to regular endpoint if discover fails
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_BASE_URL}/campaigns/all`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCampaigns(response.data.data.map((c, index) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description || "",
                        brand: c.brand?.brandProfile?.companyName || "Unknown Brand",
                        logo: c.brand?.brandProfile?.logoUrl || `https://ui-avatars.com/api/?name=Brand&background=random`,
                        platform: c.platformRequired || "Any",
                        budget: c.targetBudget ? `$${parseFloat(c.targetBudget).toLocaleString()}` : "Negotiable",
                        deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "Open",
                        brandColor: ["#6366f1", "#ec4899"][index % 2],
                        isGuaranteedPay: c.isGuaranteedPay,
                        _matchScore: 0
                    })));
                } catch (fallbackError) {
                    console.error("Fallback also failed", fallbackError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [activeTab]); // Re-fetch when tab changes

    // Filter by search query
    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.brand.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Explore Campaigns</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Find your next sponsorship opportunity.</p>
                </div>
            </div>

            {/* Phase 2: Smart Feed Tabs */}
            <CampaignFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by brand or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                    />
                </div>
            </div>

            {/* Campaign Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                    <p className="text-slate-500 text-sm">Loading campaigns...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            No campaigns found {activeTab === 'foryou' ? 'matching your niche' : 'in this category'}.
                        </div>
                    ) : (
                        filteredCampaigns.map((campaign, index) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                index={index}
                                onClick={() => navigate(`/campaign/${campaign.id}`)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ExploreCampaigns;
