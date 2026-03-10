import { prisma } from "../config/db.js";

/**
 * Profile Strength Weights
 * Each field contributes a percentage to the overall profile completion.
 */
const WEIGHTS = {
    logoUrl: 15,
    bannerUrl: 10,
    about: 20,  // brand story
    websiteUrl: 10,
    instagram: 10,
    linkedin: 10,
    brandGuidelines: 15,
    mediaKit: 10,
};

/**
 * Calculate profile strength from a BrandProfile record.
 * @param {Object} profile - The raw BrandProfile from DB
 * @returns {{ score: number, checklist: Array }}
 */
export function calculateProfileStrength(profile) {
    if (!profile) return { score: 0, checklist: [] };

    const socialLinks = profile.socialLinks || {};

    const fields = {
        logoUrl: !!profile.logoUrl,
        bannerUrl: !!profile.bannerUrl,
        about: !!profile.about,
        websiteUrl: !!profile.websiteUrl,
        instagram: !!(socialLinks.instagram),
        linkedin: !!(socialLinks.linkedin),
        brandGuidelines: !!profile.brandGuidelines,
        mediaKit: !!profile.mediaKit,
    };

    let score = 0;
    const checklist = [];

    for (const [field, weight] of Object.entries(WEIGHTS)) {
        const completed = fields[field] || false;
        if (completed) score += weight;
        checklist.push({
            field,
            label: getFieldLabel(field),
            completed,
            weight,
        });
    }

    return { score, checklist };
}

/**
 * Human-readable labels for checklist items
 */
function getFieldLabel(field) {
    const labels = {
        logoUrl: "Upload brand logo",
        bannerUrl: "Add cover image",
        about: "Write brand story",
        websiteUrl: "Add website URL",
        instagram: "Add Instagram",
        linkedin: "Add LinkedIn",
        brandGuidelines: "Upload brand guidelines",
        mediaKit: "Upload media kit",
    };
    return labels[field] || field;
}

/**
 * Persist the calculated profile strength to the DB.
 * @param {number} userId
 * @param {number} score
 */
export async function persistProfileStrength(userId, score) {
    await prisma.brandProfile.update({
        where: { userId },
        data: { profileStrength: score },
    });
}

/**
 * Full helper: recalculate and persist.
 * Call after any profile update.
 */
export async function recalculateAndPersist(userId) {
    const profile = await prisma.brandProfile.findUnique({
        where: { userId },
    });
    if (!profile) return { score: 0, checklist: [] };

    const { score, checklist } = calculateProfileStrength(profile);
    await persistProfileStrength(userId, score);
    return { score, checklist };
}

export default {
    calculateProfileStrength,
    persistProfileStrength,
    recalculateAndPersist,
};
