/**
 * Calculates a suggested rate for a creator based on industry standards.
 * Base assumption: $10 per 1,000 followers ($0.01 per follower).
 * Multipliers applied based on engagement rate.
 * 
 * @param {number} followers 
 * @param {number} engagementRate (as a percentage, e.g., 3.5)
 * @returns {number} Suggested rate in USD
 */
export const calculateSuggestedRate = (followers = 0, engagementRate = 0) => {
    if (!followers) return 0;

    const baseRate = followers * 0.01;
    let multiplier = 1.0;

    if (engagementRate < 1) {
        multiplier = 0.8;
    } else if (engagementRate >= 1 && engagementRate < 3) {
        multiplier = 1.0;
    } else if (engagementRate >= 3 && engagementRate < 6) {
        multiplier = 1.25;
    } else if (engagementRate >= 6) {
        multiplier = 1.5;
    }

    // Round to nearest 10 for clean pricing
    return Math.round((baseRate * multiplier) / 10) * 10;
};

export const getPriceRange = (suggestedRate) => {
    const min = Math.round((suggestedRate * 0.85) / 10) * 10;
    const max = Math.round((suggestedRate * 1.2) / 10) * 10;
    return { min, max };
};
