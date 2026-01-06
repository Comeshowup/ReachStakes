import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Calculator,
    TrendingUp,
    DollarSign,
    Users,
    Eye,
    Sparkles,
    ChevronDown,
    ArrowRight
} from "lucide-react";

/**
 * Creator Rate Calculator - Lead generation tool
 * Uses market research data to calculate recommended rates
 */

// Market research CPM data (Cost Per Mille - cost per 1000 views)
const PLATFORM_RATES = {
    TikTok: {
        name: "TikTok",
        minCPM: 0.02,
        maxCPM: 0.08,
        engagementBonus: 1.5, // Multiplier for high engagement
        color: "from-cyan-500 to-pink-500"
    },
    Instagram: {
        name: "Instagram",
        minCPM: 0.03,
        maxCPM: 0.10,
        engagementBonus: 1.4,
        color: "from-purple-500 to-pink-500"
    },
    YouTube: {
        name: "YouTube",
        minCPM: 0.05,
        maxCPM: 0.15,
        engagementBonus: 1.3,
        color: "from-red-500 to-orange-500"
    }
};

// Follower tier multipliers
const getTierMultiplier = (followers) => {
    if (followers >= 1000000) return { tier: "Mega", multiplier: 2.5 };
    if (followers >= 500000) return { tier: "Macro", multiplier: 2.0 };
    if (followers >= 100000) return { tier: "Mid-Tier", multiplier: 1.5 };
    if (followers >= 10000) return { tier: "Micro", multiplier: 1.2 };
    return { tier: "Nano", multiplier: 1.0 };
};

const calculateRate = (platform, followers, avgViews, engagementRate) => {
    const platformData = PLATFORM_RATES[platform];
    if (!platformData) return { min: 0, max: 0 };

    const { tier, multiplier } = getTierMultiplier(followers);

    // Base rate from views
    const baseMinRate = avgViews * (platformData.minCPM / 1000) * 1000;
    const baseMaxRate = avgViews * (platformData.maxCPM / 1000) * 1000;

    // Apply tier multiplier
    let minRate = baseMinRate * multiplier;
    let maxRate = baseMaxRate * multiplier;

    // Engagement bonus (above 5% is considered high)
    if (engagementRate > 5) {
        const engagementMultiplier = 1 + (Math.min(engagementRate, 15) - 5) * 0.1;
        minRate *= engagementMultiplier;
        maxRate *= engagementMultiplier;
    }

    // Minimum floor
    minRate = Math.max(minRate, 50);
    maxRate = Math.max(maxRate, minRate * 1.5);

    return {
        min: Math.round(minRate),
        max: Math.round(maxRate),
        tier
    };
};

const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
};

const RateCalculator = () => {
    const [platform, setPlatform] = useState("TikTok");
    const [followers, setFollowers] = useState("");
    const [avgViews, setAvgViews] = useState("");
    const [engagementRate, setEngagementRate] = useState("");
    const [result, setResult] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleCalculate = () => {
        const followersNum = parseInt(followers.replace(/,/g, "")) || 0;
        const viewsNum = parseInt(avgViews.replace(/,/g, "")) || 0;
        const engagementNum = parseFloat(engagementRate) || 0;

        if (followersNum < 1000 || viewsNum < 100) {
            setResult({ error: "Please enter valid follower count and average views" });
            return;
        }

        setIsCalculating(true);

        // Simulate calculation delay for UX
        setTimeout(() => {
            const rate = calculateRate(platform, followersNum, viewsNum, engagementNum);
            setResult(rate);
            setIsCalculating(false);
        }, 800);
    };

    const handleFollowersChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length <= 10) {
            setFollowers(value ? parseInt(value).toLocaleString() : "");
        }
    };

    const handleViewsChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length <= 10) {
            setAvgViews(value ? parseInt(value).toLocaleString() : "");
        }
    };

    return (
        <section className="py-20 px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-bold mb-6"
                    >
                        <Calculator className="w-4 h-4" />
                        Free Tool
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black text-white mb-4"
                    >
                        What Should You <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Charge Brands?</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        Get personalized rate recommendations based on current market data
                    </motion.p>
                </div>

                {/* Calculator Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-10 backdrop-blur-xl"
                >
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="space-y-6">
                            {/* Platform Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    Platform
                                </label>
                                <div className="relative">
                                    <select
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                    >
                                        {Object.keys(PLATFORM_RATES).map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Followers Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Total Followers
                                </label>
                                <input
                                    type="text"
                                    value={followers}
                                    onChange={handleFollowersChange}
                                    placeholder="e.g. 100,000"
                                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Avg Views Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Average Views Per Post
                                </label>
                                <input
                                    type="text"
                                    value={avgViews}
                                    onChange={handleViewsChange}
                                    placeholder="e.g. 50,000"
                                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Engagement Rate Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Engagement Rate (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={engagementRate}
                                    onChange={(e) => setEngagementRate(e.target.value)}
                                    placeholder="e.g. 5.5"
                                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Calculate Button */}
                            <button
                                onClick={handleCalculate}
                                disabled={isCalculating}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCalculating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="w-5 h-5" />
                                        Calculate My Rate
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results Section */}
                        <div className="flex flex-col justify-center">
                            {result ? (
                                result.error ? (
                                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                                        <p className="text-red-400 font-medium">{result.error}</p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        {/* Rate Display */}
                                        <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl text-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px]" />
                                            <div className="relative">
                                                <p className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">
                                                    Recommended Rate
                                                </p>
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <span className="text-5xl font-black text-white">
                                                        ${result.min.toLocaleString()}
                                                    </span>
                                                    <span className="text-2xl text-slate-400">-</span>
                                                    <span className="text-5xl font-black text-white">
                                                        ${result.max.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 text-sm">per sponsored post</p>
                                            </div>
                                        </div>

                                        {/* Tier Badge */}
                                        <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/30 rounded-xl">
                                            <Sparkles className="w-5 h-5 text-amber-400" />
                                            <span className="text-white font-medium">
                                                You're a <span className="text-amber-400 font-bold">{result.tier}</span> Creator
                                            </span>
                                        </div>

                                        {/* CTA */}
                                        <div className="space-y-3">
                                            <a
                                                href="/auth?mode=signup&role=creator"
                                                className="flex items-center justify-center gap-2 w-full py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all shadow-lg"
                                            >
                                                Lock In These Rates
                                                <ArrowRight className="w-5 h-5" />
                                            </a>
                                            <p className="text-center text-xs text-slate-500">
                                                Join verified brands ready to pay your rate
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                                    <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                                        <DollarSign className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">
                                        Your Rate Awaits
                                    </h4>
                                    <p className="text-slate-400 text-sm">
                                        Enter your stats to see what you should be charging brands
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-6 mt-8 text-slate-500 text-sm"
                >
                    <span>✓ Based on 2025 market rates</span>
                    <span>✓ Updated monthly</span>
                    <span>✓ 100% free, no signup required</span>
                </motion.div>
            </div>
        </section>
    );
};

export default RateCalculator;
