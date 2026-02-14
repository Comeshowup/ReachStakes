import React from "react";
import { motion } from "framer-motion";
import {
    Instagram,
    Youtube,
    Twitter,
    TrendingUp,
    Briefcase,
    MapPin,
    Users,
    Sparkles
} from "lucide-react";

/**
 * TrustSnapshot - Above-the-fold business metrics
 * Shows platform reach, engagement, campaign status, and audience location
 * Designed for brands to instantly assess creator value
 */

const getPlatformIcon = (platform) => {
    const icons = {
        instagram: Instagram,
        youtube: Youtube,
        twitter: Twitter
    };
    return icons[platform?.toLowerCase()] || Users;
};

const TrustCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    variant = "default",
    delay = 0
}) => {
    const variants = {
        default: "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800",
        success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30",
        info: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30",
        highlight: "bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white"
    };

    const isHighlight = variant === "highlight";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all ${variants[variant]}`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${isHighlight
                        ? "bg-white/20"
                        : "bg-gray-50 dark:bg-slate-800"
                    }`}>
                    <Icon className={`w-5 h-5 ${isHighlight
                            ? "text-white"
                            : "text-indigo-600 dark:text-indigo-400"
                        }`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isHighlight
                            ? "text-white/70"
                            : "text-gray-500 dark:text-slate-400"
                        }`}>
                        {label}
                    </p>
                    <p className={`text-lg font-bold truncate ${isHighlight
                            ? "text-white"
                            : "text-gray-900 dark:text-white"
                        }`}>
                        {value}
                    </p>
                    {subValue && (
                        <p className={`text-xs mt-0.5 ${isHighlight
                                ? "text-white/60"
                                : "text-gray-400 dark:text-slate-500"
                            }`}>
                            {subValue}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const PlatformReachCard = ({ socialAccounts = [], totalFollowers = 0, delay = 0 }) => {
    // Get top 2 platforms by followers
    const topPlatforms = [...socialAccounts]
        .filter(acc => acc.followersCount > 0)
        .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
        .slice(0, 2);

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
                    <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider mb-1 text-gray-500 dark:text-slate-400">
                        Total Reach
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatFollowers(totalFollowers)}
                    </p>
                    {topPlatforms.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            {topPlatforms.map((acc, i) => {
                                const PlatformIcon = getPlatformIcon(acc.platform);
                                return (
                                    <div
                                        key={acc.platform}
                                        className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400"
                                    >
                                        <PlatformIcon className="w-3 h-3" />
                                        <span>{formatFollowers(acc.followersCount)}</span>
                                        {i < topPlatforms.length - 1 && <span className="mx-1">·</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const TrustSnapshot = ({
    socialAccounts = [],
    totalFollowers = 0,
    engagementRate = 0,
    completedCampaigns = 0,
    location = "Not specified",
    audienceRegions = []
}) => {
    // Determine status message for new vs experienced creators
    const getStatusDisplay = () => {
        if (completedCampaigns === 0) {
            return { value: "New on Platform", variant: "info", icon: Sparkles };
        } else if (completedCampaigns < 5) {
            return { value: `${completedCampaigns} Campaigns`, variant: "default", icon: Briefcase };
        } else {
            return { value: `${completedCampaigns}+ Completed`, variant: "success", icon: Briefcase };
        }
    };

    const statusDisplay = getStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    // Format engagement rate
    const formattedEngagement = typeof engagementRate === 'number'
        ? `${engagementRate.toFixed(1)}%`
        : engagementRate;

    // Get primary audience region
    const primaryRegion = audienceRegions.length > 0
        ? audienceRegions[0]
        : location;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-8 relative z-20 px-8">
            {/* Platform Reach */}
            <PlatformReachCard
                socialAccounts={socialAccounts}
                totalFollowers={totalFollowers}
                delay={0.1}
            />

            {/* Engagement Rate */}
            <TrustCard
                icon={TrendingUp}
                label="Engagement"
                value={formattedEngagement}
                subValue="Avg. across platforms"
                variant="highlight"
                delay={0.2}
            />

            {/* Campaign Status */}
            <TrustCard
                icon={StatusIcon}
                label={completedCampaigns > 0 ? "Track Record" : "Status"}
                value={statusDisplay.value}
                variant={statusDisplay.variant}
                delay={0.3}
            />

            {/* Audience Location */}
            <TrustCard
                icon={MapPin}
                label="Audience"
                value={primaryRegion}
                subValue={audienceRegions.length > 1 ? `+${audienceRegions.length - 1} more` : undefined}
                delay={0.4}
            />
        </div>
    );
};

export default TrustSnapshot;
