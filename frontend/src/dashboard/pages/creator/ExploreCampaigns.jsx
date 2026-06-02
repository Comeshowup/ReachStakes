import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Calendar, ArrowUpRight, Loader2, AlertTriangle } from "lucide-react";
import axios from "axios";
import GuaranteedPayBadge from "../../components/GuaranteedPayBadge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const CampaignCard = ({ campaign, onClick }) => {
    const isExpiringSoon = campaign.deadlineRaw && (() => {
        const deadline = new Date(campaign.deadlineRaw);
        const now = new Date();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft >= 0;
    })();

    const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(campaign.brand || 'Brand')}&background=EEF2FF&color=4F46E5`;

    return (
        <article
            onClick={onClick}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 flex flex-col h-full cursor-pointer transition-colors hover:border-indigo-200 dark:hover:border-slate-700 focus-within:border-indigo-300"
        >
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <img
                        src={campaign.logo || fallbackLogo}
                        alt={`${campaign.brand} logo`}
                        onError={(event) => {
                            event.currentTarget.src = fallbackLogo;
                        }}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.brand}</h3>
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{campaign.platform}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    {isExpiringSoon && (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 text-[11px] font-semibold border border-red-100 dark:border-red-500/20">
                            <AlertTriangle size={12} />
                            Expiring
                        </span>
                    )}
                    {campaign.isGuaranteedPay && (
                        <GuaranteedPayBadge
                            variant="guaranteed"
                            size="sm"
                        />
                    )}
                </div>
            </div>

            <div className="flex-1 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {campaign.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {campaign.description}
                </p>
            </div>

            <div className="space-y-4">
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

                <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                    View Details & Apply
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        </article>
    );
};

const ExploreCampaigns = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/campaigns/discover`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const formattedCampaigns = response.data.data.map((c) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description || "",
                    brand: c.brand?.brandProfile?.companyName || "Unknown Brand",
                    logo: c.brand?.brandProfile?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.brand?.brandProfile?.companyName || 'Brand')}&background=random`,
                    platform: c.platformRequired || "Any",
                    budget: c.targetBudget ? `$${parseFloat(c.targetBudget).toLocaleString()}` : "Negotiable",
                    deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "Open",
                    deadlineRaw: c.deadline,
                    isGuaranteedPay: c.isGuaranteedPay || parseFloat(c.escrowBalance) > 0,
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
                    setCampaigns(response.data.data.map((c) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description || "",
                        brand: c.brand?.brandProfile?.companyName || "Unknown Brand",
                        logo: c.brand?.brandProfile?.logoUrl || `https://ui-avatars.com/api/?name=Brand&background=random`,
                        platform: c.platformRequired || "Any",
                        budget: c.targetBudget ? `$${parseFloat(c.targetBudget).toLocaleString()}` : "Negotiable",
                        deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "Open",
                        deadlineRaw: c.deadline,
                        isGuaranteedPay: c.isGuaranteedPay,
                    })));
                } catch (fallbackError) {
                    console.error("Fallback also failed", fallbackError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Explore Campaigns</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Find your next sponsorship opportunity.</p>
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
                    {campaigns.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            No campaigns are available right now.
                        </div>
                    ) : (
                        campaigns.map((campaign) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
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
