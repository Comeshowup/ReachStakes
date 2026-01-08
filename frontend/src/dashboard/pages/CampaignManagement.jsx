import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CAMPAIGNS_DATA } from '../data';
import paymentService from '../../api/paymentService'; // Import payment service
import * as brandService from '../../api/brandService';
import {
    LayoutGrid,
    Plus,
    Search,
    Filter,
    ArrowRight,
    Users,
    Calendar,
    Briefcase,
    X,
    Loader2
} from 'lucide-react';

const RequestCampaignModal = ({ isOpen, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
            alert("Campaign Request Sent! A dedicated strategist will follow up within 24 hours.");
        }, 1500);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/5"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request New Campaign</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Brief our team on your next initiative.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Campaign Goal</label>
                            <textarea
                                placeholder="E.g., Launch our new summer collection, Drive app installs..."
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Target Budget</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        placeholder="5,000"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Launch Timing</label>
                                <input
                                    type="text"
                                    placeholder="Q1 2026 / March"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">Average response time: &lt; 2 hours</p>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const CampaignManagement = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await brandService.getBrandCampaigns();
                if (response.status === 'success') {
                    setCampaigns(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const handleEnterWorkspace = (id) => {
        navigate(`/brand/workspace/${id}`);
    };

    return (
        <div className="space-y-8 p-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Campaigns</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all your campaigns, from draft to active.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create Campaign
                    </button>
                </div>
            </div>

            {/* Simple Search */}
            <div className="bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-gray-200 dark:border-slate-800 w-full max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-500 text-sm"
                    />
                </div>
            </div>

            {/* Campaign Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Campaigns Yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">Start your first collaboration to see it here.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Create your first campaign
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            {/* Status Stripe */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${campaign.status === 'Active' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-slate-700'}`} />

                            <div className="p-8 space-y-8">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${campaign.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-700/10 text-slate-500 border border-slate-700/20'}`}>
                                                {campaign.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                                                ID: #{String(campaign.id).substring(0, 6)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">{campaign.name}</h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <Briefcase className="w-5 h-5 text-indigo-500" />
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                                            <Users className="w-3 h-3" /> Creators
                                        </div>
                                        <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">{campaign.creators}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                                            <Briefcase className="w-3 h-3" /> Target Budget
                                        </div>
                                        <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                                            ${campaign.targetBudget ? campaign.targetBudget.toLocaleString() : '0'}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                                            <Calendar className="w-3 h-3" /> Est. ROI
                                        </div>
                                        <p className="font-mono font-bold text-emerald-500 text-lg">{campaign.roi}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                                            <Calendar className="w-3 h-3" /> Funded
                                        </div>
                                        <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                                            {campaign.fundingProgress >= 100 ? (
                                                <span className="text-emerald-500">100%</span>
                                            ) : (
                                                `${campaign.fundingProgress || 0}%`
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Funding Progress Bar */}
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${campaign.fundingProgress >= 100
                                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                                : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                            }`}
                                        style={{ width: `${Math.min(campaign.fundingProgress || 0, 100)}%` }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleEnterWorkspace(campaign.id)}
                                        className="flex-1 py-3.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500/50 group-hover:shadow-lg group-hover:shadow-indigo-500/25"
                                    >
                                        Workspace
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {['Draft', 'Pending Payment', 'Active'].includes(campaign.status) && campaign.fundingProgress < 100 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/brand/escrow?campaign=${campaign.id}`);
                                            }}
                                            className="px-4 py-3.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold rounded-2xl transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
                                            title="Fund Campaign"
                                        >
                                            <Briefcase className="w-5 h-5" />
                                            <span className="hidden sm:inline">Fund</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <RequestCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default CampaignManagement;
