import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

const TABS = [
    { id: 'foryou', label: 'For You', icon: Sparkles, color: 'indigo' },
    { id: 'new', label: 'New', icon: Clock, color: 'blue' },
    { id: 'guaranteed', label: 'Guaranteed Pay', icon: ShieldCheck, color: 'emerald' },
    { id: 'expiring', label: 'Expiring Soon', icon: AlertTriangle, color: 'red' }
];

const CampaignFeedTabs = ({ activeTab = 'new', onTabChange }) => {
    return (
        <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <motion.button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                            ${isActive
                                ? 'bg-white/10 text-white shadow-lg'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                            }
                        `}
                    >
                        {/* Glow effect for guaranteed tab */}
                        {tab.id === 'guaranteed' && isActive && (
                            <motion.div
                                className="absolute inset-0 rounded-lg bg-emerald-500/20"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}

                        {/* Pulse effect for expiring tab */}
                        {tab.id === 'expiring' && isActive && (
                            <motion.div
                                className="absolute inset-0 rounded-lg bg-red-500/20"
                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}

                        <Icon
                            className={`w-4 h-4 relative z-10 ${isActive
                                    ? tab.id === 'guaranteed' ? 'text-emerald-400'
                                        : tab.id === 'expiring' ? 'text-red-400'
                                            : tab.id === 'foryou' ? 'text-indigo-400'
                                                : 'text-blue-400'
                                    : ''
                                }`}
                        />
                        <span className="relative z-10">{tab.label}</span>

                        {/* Active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-lg border border-white/20"
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};

export default CampaignFeedTabs;
