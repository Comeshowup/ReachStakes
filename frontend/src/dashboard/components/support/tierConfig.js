/**
 * Tier Configuration — Support Center
 * Centralized tier-aware logic. No scattered conditionals.
 *
 * Usage:
 *   import { getTierConfig } from './tierConfig';
 *   const tier = getTierConfig(user.planTier); // 'starter' | 'pro' | 'enterprise'
 */

export const TIER_CONFIG = {
    starter: {
        label: 'Starter',
        slaText: 'Replies within 24 hours',
        responseTime: '< 24 hrs',
        hasNamedManager: false,
        hasEscalation: false,
        hasPhonePriority: false,
        badgeClass: 'sc-tier-badge--starter',
        managerName: null,
        managerRole: null,
    },
    pro: {
        label: 'Pro',
        slaText: 'Replies within 1–2 minutes',
        responseTime: '~1 min',
        hasNamedManager: true,
        hasEscalation: true,
        hasPhonePriority: false,
        badgeClass: 'sc-tier-badge--pro',
        managerName: 'Sarah Mitchell',
        managerRole: 'Campaign Success Manager',
    },
    enterprise: {
        label: 'Enterprise',
        slaText: 'Dedicated advisor • Priority line',
        responseTime: 'Instant',
        hasNamedManager: true,
        hasEscalation: true,
        hasPhonePriority: true,
        badgeClass: 'sc-tier-badge--enterprise',
        managerName: 'James Chen',
        managerRole: 'Senior Strategy Advisor',
    },
};

/**
 * Resolve tier config with safe fallback to 'starter'.
 * @param {string} planTier - 'starter' | 'pro' | 'enterprise'
 * @returns {object} tier configuration
 */
export const getTierConfig = (planTier) => {
    const key = (planTier || '').toLowerCase();
    return TIER_CONFIG[key] || TIER_CONFIG.starter;
};
