import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Briefcase,
    Users,
    Filter,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    MapPin,
    Globe,
    CheckCircle,
    Star,
    DollarSign,
    TrendingUp,
    Instagram,
    Youtube,
    Twitch,
    Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ALL_BRANDS, ALL_CREATORS } from "../../data";

// --- Mock Platform Icons Helper ---
const PlatformIcon = ({ platform }) => {
    switch (platform.toLowerCase()) {
        case "instagram": return <Instagram className="w-3 h-3" />;
        case "youtube": return <Youtube className="w-3 h-3" />;
        case "twitch": return <Twitch className="w-3 h-3" />;
        case "tiktok": return <span className="text-[8px] font-bold">TT</span>;
        default: return <Globe className="w-3 h-3" />;
    }
};

const AccordionFilter = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className="border-b border-gray-200 dark:border-slate-800 py-4 last:border-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full text-left group"
            >
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
                    {title}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 space-y-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DiscoveryHub = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [activeType, setActiveType] = useState("brands"); // "brands" or "creators"
    const [openFilters, setOpenFilters] = useState({
        industry: true,
        size: true,
        niche: true,
        platform: true,
        engagement: true
    });

    // Simulate search loading
    useEffect(() => {
        if (searchQuery) {
            setIsSearching(true);
            const timer = setTimeout(() => setIsSearching(false), 500);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    const toggleFilter = (section) => {
        setOpenFilters(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // --- Filter Logic ---
    const filteredResults = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (activeType === "brands") {
            return ALL_BRANDS.filter(brand =>
                brand.name.toLowerCase().includes(query) ||
                brand.industry.toLowerCase().includes(query)
            );
        } else {
            return ALL_CREATORS.filter(creator =>
                creator.name.toLowerCase().includes(query) ||
                creator.handle.toLowerCase().includes(query) ||
                creator.niche.some(n => n.toLowerCase().includes(query))
            );
        }
    }, [searchQuery, activeType]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 p-6 md:p-8 space-y-8 font-sans">

            {/* 1. Header & Global Search */}
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">perfect partner</span>.
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Connect with top-tier brands and creators to elevate your campaigns.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full max-w-xl group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full shadow-sm group-focus-within:ring-2 group-focus-within:ring-indigo-500/20 group-focus-within:border-indigo-500/50 transition-all duration-300 overflow-hidden">
                            <div className="pl-4 text-gray-400">
                                {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : <Search className="w-5 h-5" />}
                            </div>
                            <input
                                type="text"
                                placeholder={activeType === "brands" ? "Search brands by name or industry..." : "Search creators by name, handle, or niche..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3.5 bg-transparent text-base placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-900 rounded-full border border-gray-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveType("brands")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeType === "brands"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            Brands
                        </button>
                        <button
                            onClick={() => setActiveType("creators")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeType === "creators"
                                ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Creators
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto pt-4">

                {/* 2. Filter Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 sticky top-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        <Filter className="w-3 h-3" /> Filters
                    </div>

                    {activeType === "brands" ? (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            <AccordionFilter title="Industry" isOpen={openFilters.industry} onToggle={() => toggleFilter('industry')}>
                                {["SaaS", "Retail", "Beauty", "Food & Bev", "Gaming", "Travel"].map(niche => (
                                    <label key={niche} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors">
                                        <input type="checkbox" className="rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-transparent" />
                                        {niche}
                                    </label>
                                ))}
                            </AccordionFilter>

                            <AccordionFilter title="Company Size" isOpen={openFilters.size} onToggle={() => toggleFilter('size')}>
                                {["Startup", "Mid-Market", "Enterprise"].map(size => (
                                    <label key={size} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors">
                                        <div className="relative flex items-center">
                                            <input type="radio" name="size" className="peer h-4 w-4 border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-transparent" />
                                        </div>
                                        {size}
                                    </label>
                                ))}
                            </AccordionFilter>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            <AccordionFilter title="Niche" isOpen={openFilters.niche} onToggle={() => toggleFilter('niche')}>
                                {["Tech", "Beauty", "Gaming", "Lifestyle", "Food", "Travel"].map(niche => (
                                    <label key={niche} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 cursor-pointer hover:text-purple-500 transition-colors">
                                        <input type="checkbox" className="rounded border-gray-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 bg-transparent" />
                                        {niche}
                                    </label>
                                ))}
                            </AccordionFilter>

                            <AccordionFilter title="Platform" isOpen={openFilters.platform} onToggle={() => toggleFilter('platform')}>
                                {["Instagram", "TikTok", "YouTube", "Twitch"].map(platform => (
                                    <label key={platform} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 cursor-pointer hover:text-purple-500 transition-colors">
                                        <input type="checkbox" className="rounded border-gray-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 bg-transparent" />
                                        {platform}
                                    </label>
                                ))}
                            </AccordionFilter>

                            <AccordionFilter title="Engagement" isOpen={openFilters.engagement} onToggle={() => toggleFilter('engagement')}>
                                <div className="px-1 py-2">
                                    <input type="range" className="w-full accent-purple-500 h-1 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                    <div className="flex justify-between text-[10px] font-medium text-gray-500 mt-2">
                                        <span>1%</span>
                                        <span>15%+</span>
                                    </div>
                                </div>
                            </AccordionFilter>
                        </div>
                    )}
                </aside>

                {/* 3. Results Grid */}
                <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredResults.map((item, index) => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25,
                                        mass: 0.5,
                                        delay: index * 0.05
                                    }}
                                    whileHover={{
                                        scale: 1.03,
                                        y: -5,
                                        transition: { type: "spring", stiffness: 400, damping: 10 }
                                    }}
                                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors duration-300 flex flex-col h-full relative overflow-hidden ring-1 ring-transparent hover:ring-indigo-500/20 dark:hover:ring-indigo-500/20"
                                >
                                    {activeType === "brands" ? (
                                        // Brand Card
                                        <>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="relative">
                                                    <img src={item.logo} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-slate-800 shadow-sm" />
                                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5">
                                                        <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm ${item.status === "Hiring"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="mb-5">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">{item.name}</h3>
                                                <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-2">{item.industry}</p>
                                                <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.tagline}</p>
                                            </div>

                                            <div className="mt-auto space-y-5">
                                                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-slate-800/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Avg. Budget</span>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.budget}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Platforms</span>
                                                        <div className="flex gap-1.5">
                                                            <div className="p-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"><Instagram className="w-3 h-3" /></div>
                                                            <div className="p-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"><Youtube className="w-3 h-3" /></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <button className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center justify-center gap-2">
                                                        <MessageSquare className="w-4 h-4" /> Message
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/profile/${activeType === 'brands' ? 'brand' : 'creator'}/${item.id}`)}
                                                        className="py-2.5 bg-transparent border border-gray-200 dark:border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl font-bold text-sm transition-all">
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // Creator Card
                                        <>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="relative">
                                                    <img src={item.avatar} alt={item.name} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" />
                                                    <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 rounded-full p-0.5 border border-gray-100 dark:border-slate-800">
                                                        <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                                                            <PlatformIcon platform={item.platform} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {item.niche.slice(0, 2).map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wide">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mb-5">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-500 transition-colors">{item.name}</h3>
                                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">{item.handle}</p>
                                            </div>

                                            <div className="mt-auto space-y-5">
                                                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-slate-800/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Engagement</span>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3 text-green-500" /> {item.engagement}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Followers</span>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.followers}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <button className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center justify-center gap-2">
                                                        <MessageSquare className="w-4 h-4" /> Start Chat
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/profile/creator/${item.id}`)}
                                                        className="py-2.5 bg-transparent border border-gray-200 dark:border-slate-700 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 text-gray-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl font-bold text-sm transition-all">
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredResults.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                            <p className="text-gray-500 dark:text-slate-400">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscoveryHub;
