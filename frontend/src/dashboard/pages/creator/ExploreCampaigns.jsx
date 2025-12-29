import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal, MapPin, DollarSign, Calendar, ArrowUpRight, Loader2 } from "lucide-react";
import axios from "axios";

const ExploreCampaigns = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/campaigns/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const formattedCampaigns = response.data.data.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description || "",
                    brand: c.brand?.brandProfile?.companyName || "Unknown Brand",
                    logo: c.brand?.brandProfile?.logoUrl || "https://via.placeholder.com/50",
                    platform: c.platformRequired || "Any",
                    type: c.campaignType || "General",
                    budget: c.budgetMin && c.budgetMax ? `$${c.budgetMin} - $${c.budgetMax}` : (c.budgetMin ? `$${c.budgetMin}+` : "Negotiable"),
                    deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "Open"
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
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <img src={campaign.logo} alt={campaign.brand} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{campaign.brand}</h3>
                                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{campaign.platform}</span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                                    #{campaign.type}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="flex-1 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {campaign.title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                    {campaign.description}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="space-y-4">
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

                                <Link to={`/campaign/${campaign.id}`} className="w-full py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                                    View Details & Apply
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ExploreCampaigns;
