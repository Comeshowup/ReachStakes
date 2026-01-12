import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Search, Filter, SlidersHorizontal, MapPin, DollarSign, Calendar, ArrowUpRight, Loader2, Zap, ShieldCheck } from "lucide-react";
import axios from "axios";
import GuaranteedPayBadge from "../../components/GuaranteedPayBadge";

const CampaignCard = ({ campaign, index, onClick }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    // Derived Brand Color Glow
    const brandColor = campaign.brandColor || "#6366f1"; // Default to indigo
    const isHighPriority = index % 3 === 0; // Simulation for "High Priority"

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
            className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full perspective-1000 cursor-pointer
                ${isHighPriority
                    ? "border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)] dark:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                    : "border-gray-100 dark:border-slate-800 hover:border-white/20"}
                hover:shadow-2xl hover:shadow-[var(--brand-glow)]
            `}
        >
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
                {isHighPriority && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                        <Zap size={10} className="fill-indigo-400" /> High Priority
                    </span>
                )}
                {/* Guaranteed Pay Badge */}
                {campaign.escrowBalance > 0 && (
                    <GuaranteedPayBadge
                        variant={campaign.escrowBalance >= campaign.budgetMax ? "guaranteed" : "locked"}
                        size="sm"
                    />
                )}
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
                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-xs">
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
    const [activeFilter, setActiveFilter] = useState("All");
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/campaigns/all`, {
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
                    budget: c.targetBudget ? `$${parseFloat(c.targetBudget).toLocaleString()}` : (c.budgetMin && c.budgetMax ? `$${c.budgetMin} - $${c.budgetMax}` : "Negotiable"),
                    deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "Open",
                    brandColor: ["#6366f1", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#06b6d4"][index % 6],
                    // Phase 1: Financial Security - Escrow data
                    escrowBalance: parseFloat(c.escrowBalance) || 0,
                    budgetMax: parseFloat(c.targetBudget || c.budgetMax) || 0
                }));

                setCampaigns(formattedCampaigns);
            } catch (error) {
                console.error("Failed to fetch campaigns", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) || campaign.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || campaign.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Explore Campaigns</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Find your next sponsorship opportunity.</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
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
                <div className="h-px md:h-auto w-full md:w-px bg-gray-200 dark:bg-slate-800"></div>
                <div className="flex items-center gap-2 px-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['All', 'Tech', 'Beauty', 'Fitness', 'Gaming', 'Food'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === filter
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12">No campaigns found matching your criteria.</div>
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
        </div>
    );
};

export default ExploreCampaigns;
