import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp, ChevronRight, Zap, Clock, ShieldCheck } from 'lucide-react';
import ReachVerifiedBadge from './ReachVerifiedBadge';

// Tier thresholds based on schema comments
const TIER_THRESHOLDS = {
    Silver: { campaigns: 3, onTimeRate: 80 },
    Gold: { campaigns: 10, onTimeRate: 90 },
    Black: { campaigns: 25, onTimeRate: 95 }
};

const TIER_BENEFITS = {
    Silver: ['Priority Support', 'Verified Badge'],
    Gold: ['Instant Payouts', 'Featured in Discovery', 'Gold Badge'],
    Black: ['VIP Campaign Access', 'Dedicated Manager', 'Elite Badge']
};

const TIER_COLORS = {
    None: { bg: 'from-slate-800 to-slate-900', accent: 'text-slate-400', ring: 'ring-slate-600' },
    Silver: { bg: 'from-slate-600 to-slate-800', accent: 'text-slate-300', ring: 'ring-slate-400' },
    Gold: { bg: 'from-amber-600 to-amber-800', accent: 'text-amber-300', ring: 'ring-amber-400' },
    Black: { bg: 'from-slate-900 to-black', accent: 'text-white', ring: 'ring-white' }
};

const getNextTier = (current) => {
    if (current === 'None' || !current) return 'Silver';
    if (current === 'Silver') return 'Gold';
    if (current === 'Gold') return 'Black';
    return null; // Already max
};

const getProgress = (current, target) => {
    if (target === 0) return 100;
    return Math.min(100, Math.round((current / target) * 100));
};

const CreatorProgressCard = ({
    verificationTier = 'None',
    completedCampaigns = 0,
    onTimeDeliveryRate = 0,
    currentStreak = 0,
    longestStreak = 0
}) => {
    const nextTier = getNextTier(verificationTier);
    const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
    const colors = TIER_COLORS[verificationTier] || TIER_COLORS.None;

    const campaignProgress = nextThreshold
        ? getProgress(completedCampaigns, nextThreshold.campaigns)
        : 100;

    const onTimeProgress = nextThreshold
        ? getProgress(onTimeDeliveryRate, nextThreshold.onTimeRate)
        : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-6 border border-white/10`}
        >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-white/10">
                            <Flame className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-white">{currentStreak}</span>
                            <span className="text-sm text-white/60 ml-1">day streak</span>
                        </div>
                    </div>
                    <p className="text-xs text-white/40">
                        Best: {longestStreak} days
                    </p>
                </div>

                <ReachVerifiedBadge tier={verificationTier} size="lg" />
            </div>

            {/* Progress Section */}
            {nextTier && (
                <div className="relative z-10 space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                            Progress to {nextTier}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                    </div>

                    {/* Campaigns Progress */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-white/70 flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5" />
                                Campaigns
                            </span>
                            <span className={colors.accent}>
                                {completedCampaigns}/{nextThreshold.campaigns}
                            </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${campaignProgress}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* On-Time Rate Progress */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-white/70 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                On-Time Rate
                            </span>
                            <span className={colors.accent}>
                                {onTimeDeliveryRate?.toFixed(0) || 0}%/{nextThreshold.onTimeRate}%
                            </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${onTimeProgress}%` }}
                                transition={{ duration: 1, delay: 0.4 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Benefits Preview */}
            {nextTier && TIER_BENEFITS[nextTier] && (
                <div className="relative z-10 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                            Unlock at {nextTier}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TIER_BENEFITS[nextTier].map((benefit, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-md bg-white/10 text-white/70"
                            >
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Max Tier Message */}
            {!nextTier && verificationTier === 'Black' && (
                <div className="relative z-10 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <ShieldCheck className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">Elite Status Achieved</p>
                    <p className="text-xs text-white/60">You've reached the highest tier!</p>
                </div>
            )}
        </motion.div>
    );
};

export default CreatorProgressCard;
