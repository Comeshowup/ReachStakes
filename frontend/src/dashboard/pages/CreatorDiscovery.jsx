import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    Instagram,
    Youtube,
    Twitter,
    CheckCircle,
    Users,
    TrendingUp,
    DollarSign,
    X
} from "lucide-react";

// --- Mock Data ---
import { creators } from "../data";

// --- Helper Functions ---
const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
};

const parseFollowers = (followerStr) => {
    if (!followerStr) return 0;
    const clean = followerStr.toLowerCase().replace(/,/g, '');
    if (clean.endsWith('m')) return parseFloat(clean) * 1000000;
    if (clean.endsWith('k')) return parseFloat(clean) * 1000;
    return parseFloat(clean) || 0;
};

const COLORS = ["bg-blue-500", "bg-pink-500", "bg-purple-500", "bg-orange-500", "bg-green-500", "bg-teal-500"];

const MOCK_CREATORS = creators.map((c, i) => ({
    ...c,
    handle: c.handle || `@${c.name.replace(/\s+/g, '').toLowerCase()}`,
    niche: Array.isArray(c.niche) ? c.niche[0] : c.niche || 'General',
    platform: c.platform || 'Instagram',
    followers: c.followers || '0',
    engagement: c.engagement || '0%',
    price: c.price || '$0',
    priceValue: parsePrice(c.price),
    followerValue: parseFollowers(c.followers),
    image: c.image || c.avatar || "https://i.pravatar.cc/150",
    color: COLORS[i % COLORS.length],
    tags: Array.isArray(c.niche) ? c.niche : [c.niche || 'Creator']
}));

const NICHES = ["Tech", "Beauty", "Gaming", "Food", "Travel", "Fitness", "Lifestyle"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Twitch"];
const PRICE_RANGES = [
    { label: "Any Price", min: 0, max: Infinity },
    { label: "Under $1k", min: 0, max: 1000 },
    { label: "$1k - $3k", min: 1000, max: 3000 },
    { label: "$3k+", min: 3000, max: Infinity }
];

// --- Components ---

const CreatorCard = ({ creator }) => {
    const [invited, setInvited] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group"
        >
            {/* Banner & Profile Pic */}
            <div className={`h-24 ${creator.color} opacity-80 relative`}>
                <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <div className="px-6 relative">
                <div className="flex justify-between items-end -mt-10 mb-4">
                    <img
                        src={creator.image}
                        alt={creator.name}
                        className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-sm"
                    />
                    <div className="flex gap-1">
                        {creator.platform === "Instagram" && <Instagram className="w-5 h-5 text-pink-600" />}
                        {creator.platform === "YouTube" && <Youtube className="w-5 h-5 text-red-600" />}
                        {creator.platform === "Twitter" && <Twitter className="w-5 h-5 text-blue-400" />}
                        {creator.platform === "TikTok" && <span className="text-xs font-bold bg-black text-white px-1 rounded">Tk</span>}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{creator.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{creator.handle}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                        <Users className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="font-semibold">{creator.followers}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                        <TrendingUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="font-semibold">{creator.engagement}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                        <DollarSign className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="font-semibold">{creator.price}</span>
                    </div>
                </div>

                {/* Badge */}
                <div className="mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        🔥 {creator.engagement} Eng. Rate
                    </span>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                    Passionate creator sharing the best in {creator.niche}. Let's create something amazing together!
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {creator.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-1 rounded-md">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Action */}
                <button
                    onClick={() => setInvited(!invited)}
                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${invited
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-700 shadow-lg shadow-gray-200 dark:shadow-none"
                        }`}
                >
                    {invited ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Invited
                        </>
                    ) : (
                        "Invite to Campaign"
                    )}
                </button>
            </div>
            <div className="h-6"></div>
        </motion.div>
    );
};

const CreatorDiscovery = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNiches, setSelectedNiches] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState("All");
    const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);

    const toggleNiche = (niche) => {
        setSelectedNiches(prev =>
            prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
        );
    };

    const filteredCreators = useMemo(() => {
        return MOCK_CREATORS.filter(creator => {
            const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                creator.handle.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesNiche = selectedNiches.length === 0 || selectedNiches.includes(creator.niche);
            const matchesPlatform = selectedPlatform === "All" || creator.platform === selectedPlatform;
            const matchesPrice = creator.priceValue >= selectedPriceRange.min && creator.priceValue <= selectedPriceRange.max;

            return matchesSearch && matchesNiche && matchesPlatform && matchesPrice;
        });
    }, [searchQuery, selectedNiches, selectedPlatform, selectedPriceRange]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold mb-2">Discover Talent</h1>
                    <p className="text-indigo-100 mb-8 text-lg">Find the perfect creator for your next campaign from our curated network of influencers.</p>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or handle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-lg focus:ring-4 focus:ring-indigo-500/30 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Niche Filter */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Niche
                        </h3>
                        <div className="space-y-2">
                            {NICHES.map(niche => (
                                <label key={niche} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedNiches.includes(niche) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                                        {selectedNiches.includes(niche) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedNiches.includes(niche)}
                                        onChange={() => toggleNiche(niche)}
                                    />
                                    <span className={`text-sm ${selectedNiches.includes(niche) ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-slate-400'}`}>{niche}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Platform Filter */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Platform</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedPlatform("All")}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPlatform === "All" ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                            >
                                All
                            </button>
                            {PLATFORMS.map(platform => (
                                <button
                                    key={platform}
                                    onClick={() => setSelectedPlatform(platform)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPlatform === platform ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                                >
                                    {platform}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Price Range</h3>
                        <div className="space-y-2">
                            {PRICE_RANGES.map(range => (
                                <button
                                    key={range.label}
                                    onClick={() => setSelectedPriceRange(range)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedPriceRange.label === range.label ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex-1">
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-gray-500 dark:text-slate-400 text-sm">Showing <span className="font-bold text-gray-900 dark:text-white">{filteredCreators.length}</span> creators</p>
                        {(selectedNiches.length > 0 || selectedPlatform !== "All" || searchQuery) && (
                            <button
                                onClick={() => {
                                    setSelectedNiches([]);
                                    setSelectedPlatform("All");
                                    setSearchQuery("");
                                    setSelectedPriceRange(PRICE_RANGES[0]);
                                }}
                                className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredCreators.map(creator => (
                                <CreatorCard key={creator.id} creator={creator} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredCreators.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 transition-colors">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No creators found</h3>
                            <p className="text-gray-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatorDiscovery;
