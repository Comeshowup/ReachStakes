import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket,
    Gem,
    Users,
    Zap,
    DollarSign,
    Lock,
    Trophy,
    Share2,
    X
} from 'lucide-react';

// Badge definitions with unlock criteria
const BADGES = [
    {
        id: 'first_campaign',
        name: 'First Campaign',
        description: 'Launch your first campaign',
        icon: Rocket,
        color: 'brand-sky',
        progress: 100,
        unlocked: true,
        unlockedAt: '2026-01-10',
    },
    {
        id: 'roas_10x',
        name: '10x ROAS Club',
        description: 'Achieve 10x return on ad spend',
        icon: Gem,
        color: 'violet',
        progress: 78,
        unlocked: false,
        requirement: 'Current: 7.8x',
    },
    {
        id: 'century_club',
        name: 'Century Club',
        description: 'Manage 100+ creators',
        icon: Users,
        color: 'emerald',
        progress: 45,
        unlocked: false,
        requirement: '45 of 100 creators',
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Launch a campaign in under 3 days',
        icon: Zap,
        color: 'amber',
        progress: 100,
        unlocked: true,
        unlockedAt: '2026-01-12',
    },
    {
        id: 'top_spender',
        name: 'Top Spender',
        description: 'Invest $100K+ monthly',
        icon: DollarSign,
        color: 'rose',
        progress: 32,
        unlocked: false,
        requirement: '$32K of $100K',
    },
];

const colorClasses = {
    'brand-sky': {
        bg: 'bg-brand-sky/20',
        border: 'border-brand-sky/30',
        text: 'text-brand-sky',
        glow: 'shadow-[0_0_30px_-5px_rgba(56,189,248,0.5)]',
    },
    'violet': {
        bg: 'bg-violet-500/20',
        border: 'border-violet-500/30',
        text: 'text-violet-400',
        glow: 'shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)]',
    },
    'emerald': {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]',
    },
    'amber': {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)]',
    },
    'rose': {
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        glow: 'shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]',
    },
};

// Confetti effect for unlock celebration
const Confetti = ({ show }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
                        y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
                        scale: 0,
                    }}
                    animate={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                        scale: [0, 1, 0],
                        rotate: Math.random() * 360,
                    }}
                    transition={{
                        duration: 1.5,
                        delay: Math.random() * 0.3,
                        ease: 'easeOut',
                    }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                        backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'][Math.floor(Math.random() * 5)],
                    }}
                />
            ))}
        </div>
    );
};

const BadgeCard = ({ badge, delay, onShare }) => {
    const Icon = badge.icon;
    const colors = colorClasses[badge.color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="group relative"
        >
            <div
                className={`relative p-5 rounded-2xl border transition-all duration-300 ${badge.unlocked
                        ? `${colors.bg} ${colors.border} ${colors.glow}`
                        : 'bg-white/[0.02] border-white/10'
                    }`}
            >
                {/* Lock overlay for locked badges */}
                {!badge.unlocked && (
                    <div className="absolute inset-0 rounded-2xl backdrop-blur-[2px] flex items-center justify-center z-10">
                        <Lock className="w-6 h-6 text-white/20" />
                    </div>
                )}

                {/* Badge content */}
                <div className={`${!badge.unlocked ? 'opacity-40' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${colors.bg}`}>
                            <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        {badge.unlocked && (
                            <button
                                onClick={() => onShare(badge)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <Share2 className="w-4 h-4 text-white/50" />
                            </button>
                        )}
                    </div>

                    <h4 className="text-sm font-semibold text-white mb-1">{badge.name}</h4>
                    <p className="text-xs text-white/50 mb-3">{badge.description}</p>

                    {badge.unlocked ? (
                        <div className="flex items-center gap-2">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span className="text-xs text-white/40">
                                Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                            </span>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-white/40">{badge.requirement}</span>
                                <span className={colors.text}>{badge.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${badge.progress}%` }}
                                    transition={{ duration: 1, delay: delay + 0.3 }}
                                    className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ShareModal = ({ badge, onClose }) => {
    if (!badge) return null;
    const Icon = badge.icon;
    const colors = colorClasses[badge.color];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-[#0a0a0b] border border-white/10 p-6"
            >
                <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
                        <X className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                <div className={`mx-auto w-20 h-20 rounded-2xl ${colors.bg} ${colors.glow} flex items-center justify-center mb-4`}>
                    <Icon className={`w-10 h-10 ${colors.text}`} />
                </div>

                <h3 className="text-center text-xl font-bold text-white mb-2">{badge.name}</h3>
                <p className="text-center text-sm text-white/50 mb-6">{badge.description}</p>

                <div className="space-y-2">
                    <button className="w-full py-3 rounded-xl bg-brand-sky text-black font-semibold hover:bg-brand-sky/90 transition-colors">
                        Share to LinkedIn
                    </button>
                    <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors">
                        Copy Image
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AchievementBadges = () => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [shareModalBadge, setShareModalBadge] = useState(null);

    const unlockedCount = BADGES.filter(b => b.unlocked).length;

    const handleShare = (badge) => {
        setShareModalBadge(badge);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6"
        >
            <Confetti show={showConfetti} />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20">
                        <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Achievements</h3>
                        <p className="text-xs text-white/50">{unlockedCount} of {BADGES.length} unlocked</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {BADGES.map((badge, i) => (
                        <div
                            key={badge.id}
                            className={`w-2 h-2 rounded-full ${badge.unlocked ? 'bg-amber-400' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BADGES.map((badge, i) => (
                    <BadgeCard key={badge.id} badge={badge} delay={i * 0.1} onShare={handleShare} />
                ))}
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {shareModalBadge && (
                    <ShareModal badge={shareModalBadge} onClose={() => setShareModalBadge(null)} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AchievementBadges;
