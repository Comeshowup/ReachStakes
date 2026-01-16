import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Medal,
    Crown,
    Eye,
    EyeOff,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';

// Mock leaderboard data
const LEADERBOARD_DATA = [
    { rank: 1, name: 'Premium Cosmetics', roas: 18.2, change: 'up', isYou: false },
    { rank: 2, name: 'StyleHub', roas: 15.7, change: 'up', isYou: false },
    { rank: 3, name: 'TechGear Pro', roas: 14.3, change: 'same', isYou: false },
    { rank: 4, name: 'Your Brand', roas: 12.8, change: 'up', isYou: true },
    { rank: 5, name: 'FitLife Co', roas: 11.9, change: 'down', isYou: false },
    { rank: 6, name: 'HomeStyle', roas: 10.5, change: 'up', isYou: false },
    { rank: 7, name: 'PetPals', roas: 9.8, change: 'same', isYou: false },
    { rank: 8, name: 'GreenEats', roas: 9.2, change: 'down', isYou: false },
    { rank: 9, name: 'TravelNow', roas: 8.7, change: 'up', isYou: false },
    { rank: 10, name: 'GameZone', roas: 8.1, change: 'same', isYou: false },
];

const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-white/40">{rank}</span>;
};

const getChangeIcon = (change) => {
    if (change === 'up') return <ArrowUp className="w-3 h-3 text-emerald-400" />;
    if (change === 'down') return <ArrowDown className="w-3 h-3 text-rose-400" />;
    return <Minus className="w-3 h-3 text-white/30" />;
};

const LeaderboardRow = ({ entry, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${entry.isYou
                ? 'bg-brand-sky/10 border border-brand-sky/20'
                : 'bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
    >
        {/* Rank */}
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            {getRankIcon(entry.rank)}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${entry.isYou ? 'text-brand-sky' : 'text-white'}`}>
                {entry.name}
                {entry.isYou && <span className="ml-2 text-xs text-brand-sky/70">(You)</span>}
            </p>
        </div>

        {/* ROAS */}
        <div className="text-right">
            <div className="flex items-center gap-1.5">
                {getChangeIcon(entry.change)}
                <span className={`text-sm font-bold ${entry.isYou ? 'text-brand-sky' : 'text-white'}`}>
                    {entry.roas}x
                </span>
            </div>
            <span className="text-[10px] text-white/40">ROAS</span>
        </div>
    </motion.div>
);

const BrandLeaderboard = () => {
    const [isVisible, setIsVisible] = useState(true);
    const yourRank = LEADERBOARD_DATA.find(e => e.isYou);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Monthly Leaderboard</h3>
                        <p className="text-xs text-white/50">Top ROAS performers</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 transition-colors"
                >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {isVisible ? 'Public' : 'Private'}
                </button>
            </div>

            {/* Your Position Highlight */}
            {yourRank && (
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-brand-sky/10 to-violet-500/10 border border-brand-sky/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/50 mb-1">Your Current Rank</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-brand-sky">#{yourRank.rank}</span>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                                    <ArrowUp className="w-3 h-3" />
                                    +2 this week
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-white/50 mb-1">Your ROAS</p>
                            <p className="text-2xl font-bold text-white">{yourRank.roas}x</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {LEADERBOARD_DATA.map((entry, i) => (
                    <LeaderboardRow key={entry.rank} entry={entry} delay={i * 0.05} />
                ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <p className="text-xs text-white/40">
                    Rankings update daily • Based on 30-day ROAS
                </p>
            </div>
        </motion.div>
    );
};

export default BrandLeaderboard;
