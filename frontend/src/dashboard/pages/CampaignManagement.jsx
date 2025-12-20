import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Filter,
    ChevronRight,
    Check,
    X,
    Upload,
    MoreHorizontal,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    ArrowUpDown,
    LayoutGrid,
    List as ListIcon
} from "lucide-react";
import { CAMPAIGNS_DATA } from "../data";

const CampaignList = ({ onLaunchClick }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredCampaigns = CAMPAIGNS_DATA.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || campaign.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Campaigns</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Manage and track your active campaigns</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onLaunchClick}
                        className="group relative px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Plus className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Launch Campaign</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                    />
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 hidden md:block"></div>

                <div className="flex items-center gap-2 w-full md:w-auto px-2">
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isFilterOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-4 z-20"
                                >
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</h3>
                                    <div className="space-y-1">
                                        {['All', 'Active', 'Completed', 'Draft'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => { setActiveFilter(status); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === status ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-400 transition-all">
                        <ArrowUpDown className="w-4 h-4" />
                        Sort
                    </button>
                </div>
            </div>

            {/* Campaign List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredCampaigns.length > 0 ? (
                        filteredCampaigns.map((campaign, index) => (
                            <motion.div
                                key={campaign.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Left: Identity */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{campaign.name}</h3>
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                                                #{campaign.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${campaign.status === "Active" ? "bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/20" :
                                                    campaign.status === "Completed" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20" :
                                                        "bg-gray-500/10 text-gray-600 dark:text-gray-400 ring-1 ring-gray-500/20"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${campaign.status === "Active" ? "bg-green-500 animate-pulse" :
                                                        campaign.status === "Completed" ? "bg-blue-500" :
                                                            "bg-gray-500"
                                                    }`}></span>
                                                {campaign.status}
                                            </span>
                                            {campaign.status === "Active" && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                                                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
                                                    </div>
                                                    {campaign.progress}%
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Center: Metrics */}
                                    <div className="flex items-center gap-8 md:border-l md:border-r border-gray-100 dark:border-slate-800 md:px-8">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Budget</p>
                                            <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-bold">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                {campaign.budget}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ROI</p>
                                            <div className={`flex items-center gap-1.5 font-bold ${campaign.roi !== '-' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                                <TrendingUp className="w-4 h-4" />
                                                {campaign.roi}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Action */}
                                    <div className="flex items-center justify-between md:justify-end gap-6 min-w-[140px]">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{campaign.creators}</span>
                                            <span className="text-xs text-gray-500 dark:text-slate-400">Creators</span>
                                        </div>
                                        <button className="p-2 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No campaigns found</h3>
                            <p className="text-gray-500 dark:text-slate-400 mb-6">Try adjusting your filters or search query</p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const WizardStep = ({ children }) => {
    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {children}
        </motion.div>
    );
};

const LaunchWizard = ({ onClose }) => {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((s) => Math.min(s + 1, 3));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Launch New Campaign</h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8 relative px-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 -z-10 rounded-full`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ring-4 ring-white dark:ring-slate-900 ${step >= s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                                    }`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <WizardStep key="step1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Campaign Details</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Campaign Title</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="e.g., Summer Launch 2025" autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Description</label>
                                        <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium resize-none" rows="3" placeholder="Describe your campaign goals..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Total Budget</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-bold">$</span>
                                            <input type="number" className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold" placeholder="5000" />
                                        </div>
                                    </div>
                                </div>
                            </WizardStep>
                        )}

                        {step === 2 && (
                            <WizardStep key="step2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Requirements</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Platform</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['YouTube', 'Instagram', 'TikTok'].map(platform => (
                                                <button key={platform} className="py-3 border-2 border-gray-100 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-bold text-gray-600 dark:text-slate-400">
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Video Type</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium appearance-none cursor-pointer">
                                                <option>Review</option>
                                                <option>Tutorial</option>
                                                <option>Unboxing</option>
                                                <option>Vlog Integration</option>
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Reference Assets</label>
                                        <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group">
                                            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                                            </div>
                                            <span className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Click to upload brand assets</span>
                                            <span className="text-xs text-gray-400 mt-1">PDF, JPG, MP4 up to 50MB</span>
                                        </div>
                                    </div>
                                </div>
                            </WizardStep>
                        )}

                        {step === 3 && (
                            <WizardStep key="step3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review & Launch</h3>
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4 text-sm border border-gray-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-slate-400">Title</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Summer Launch 2025</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-slate-400">Budget</span>
                                        <span className="font-bold text-gray-900 dark:text-white">$5,000</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-slate-400">Platform</span>
                                        <span className="font-bold text-gray-900 dark:text-white">YouTube</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
                                            <div className="mt-0.5 min-w-[16px]">ℹ️</div>
                                            <p>By launching this campaign, you agree to our terms of service. Funds will be held in escrow until creator deliverables are approved.</p>
                                        </div>
                                    </div>
                                </div>
                            </WizardStep>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-900 sticky bottom-0 z-10">
                    {step > 1 ? (
                        <button onClick={prevStep} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button onClick={nextStep} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                            Next Step
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-8 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-0.5 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Launch Campaign
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const CampaignManagement = () => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    return (
        <>
            <CampaignList onLaunchClick={() => setIsWizardOpen(true)} />
            <AnimatePresence>
                {isWizardOpen && <LaunchWizard onClose={() => setIsWizardOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default CampaignManagement;
