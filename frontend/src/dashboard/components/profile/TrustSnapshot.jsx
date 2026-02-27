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
 * TrustSnapshot — Above-the-fold credibility metrics.
 * Token-driven, no gradients. Clean fintech aesthetic.
 * Shows platform reach, engagement, campaign status, and audience location.
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
    delay = 0
}) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="trust-strip__card"
    >
        <div
            className="kpi-card-polished__icon"
            style={{ background: 'var(--bd-bg-secondary)', marginBottom: 'var(--bd-space-3)' }}
        >
            <Icon style={{ width: 16, height: 16, color: 'var(--bd-text-secondary)' }} />
        </div>
        <p className="trust-strip__label">{label}</p>
        <p className="trust-strip__value">{value}</p>
        {subValue && <p className="trust-strip__sub">{subValue}</p>}
    </motion.div>
);

const PlatformReachCard = ({ socialAccounts = [], totalFollowers = 0, delay = 0 }) => {
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="trust-strip__card"
        >
            <div
                className="kpi-card-polished__icon"
                style={{ background: 'var(--bd-purple-muted)', marginBottom: 'var(--bd-space-3)' }}
            >
                <Users style={{ width: 16, height: 16, color: 'var(--bd-purple)' }} />
            </div>
            <p className="trust-strip__label">Total Reach</p>
            <p className="trust-strip__value">{formatFollowers(totalFollowers)}</p>
            {topPlatforms.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    {topPlatforms.map((acc, i) => {
                        const PlatformIcon = getPlatformIcon(acc.platform);
                        return (
                            <span
                                key={acc.platform}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    fontSize: '0.6875rem',
                                    color: 'var(--bd-text-muted)',
                                }}
                            >
                                <PlatformIcon style={{ width: 12, height: 12 }} />
                                {formatFollowers(acc.followersCount)}
                                {i < topPlatforms.length - 1 && <span style={{ margin: '0 2px' }}>·</span>}
                            </span>
                        );
                    })}
                </div>
            )}
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
        <div className="trust-strip" style={{ position: 'relative', zIndex: 20, marginTop: '-2rem', padding: '0 2rem' }}>
            <PlatformReachCard
                socialAccounts={socialAccounts}
                totalFollowers={totalFollowers}
                delay={0.05}
            />

            <TrustCard
                icon={TrendingUp}
                label="Engagement"
                value={formattedEngagement}
                subValue="Avg. across platforms"
                delay={0.1}
            />

            <TrustCard
                icon={StatusIcon}
                label={completedCampaigns > 0 ? "Track Record" : "Status"}
                value={statusDisplay.value}
                delay={0.15}
            />

            <TrustCard
                icon={MapPin}
                label="Audience"
                value={primaryRegion}
                subValue={audienceRegions.length > 1 ? `+${audienceRegions.length - 1} more` : undefined}
                delay={0.2}
            />
        </div>
    );
};

export default TrustSnapshot;
