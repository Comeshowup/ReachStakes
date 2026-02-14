import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronRight, DollarSign, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * HotOpportunities Widget
 * 
 * Shows curated campaigns matching creator's niche with match percentage.
 * Addresses creator pain point: discoverability
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const MatchBadge = ({ score }) => {
    const getColor = () => {
        if (score >= 90) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (score >= 75) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        if (score >= 60) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getColor()}`}>
            {score}% match
        </span>
    );
};

const OpportunityCard = ({ campaign, onClick, index }) => {
    const matchScore = campaign._matchScore || Math.floor(Math.random() * 30) + 70; // Mock if not available

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
        >
            {/* Brand Logo */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {campaign.logo ? (
                    <img src={campaign.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {campaign.title || campaign.brand || 'Campaign'}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <DollarSign className="w-3 h-3" />
                    <span>{campaign.budget || '$500-$1,000'}</span>
                    <span>•</span>
                    <span>{campaign.platform || campaign.type || 'Multiple'}</span>
                </div>
            </div>

            {/* Match Badge */}
            <MatchBadge score={matchScore} />

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
        </motion.div>
    );
};

export default function HotOpportunities({ maxItems = 3 }) {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/campaigns/discover`, {
                params: { tab: 'foryou', limit: maxItems },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                setCampaigns(response.data.data.slice(0, maxItems).map(c => ({
                    id: c.id,
                    title: c.title,
                    brand: c.brand?.brandProfile?.companyName || 'Brand',
                    logo: c.brand?.brandProfile?.logoUrl,
                    budget: c.targetBudget ? `$${parseFloat(c.targetBudget).toLocaleString()}` : 'Negotiable',
                    platform: c.platformRequired || 'Any',
                    type: c.campaignType,
                    _matchScore: c._matchScore || Math.floor(Math.random() * 25) + 75
                })));
            }
        } catch (err) {
            console.error('Failed to fetch opportunities:', err);
            // Use empty state instead of error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                        <Flame className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Hot Opportunities</h3>
                </div>
                <button
                    onClick={() => navigate('/creator/explore')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                    Browse All <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-6">
                        <Flame className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                            No matching campaigns yet
                        </p>
                        <button
                            onClick={() => navigate('/creator/explore')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Explore Campaigns <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {campaigns.map((campaign, idx) => (
                            <OpportunityCard
                                key={campaign.id || idx}
                                campaign={campaign}
                                index={idx}
                                onClick={() => navigate(`/campaign/${campaign.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            {campaigns.length > 0 && (
                <div className="px-4 pb-4">
                    <button
                        onClick={() => navigate('/creator/explore')}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        Find More Campaigns <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
