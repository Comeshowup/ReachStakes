/**
 * Vetting Service
 * Fraud detection, audience authenticity analysis, and vetting report generation
 */

import { prisma } from '../config/db.js';

/**
 * Calculate audience authenticity score (0-100)
 * Analyzes follower patterns, engagement ratios, and demographic consistency
 */
export const calculateAudienceAuthenticityScore = async (creatorId) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
        include: { demographics: true }
    });

    if (!creator) {
        throw new Error('Creator not found');
    }

    let score = 100;
    const factors = [];

    // Factor 1: Follower-to-engagement ratio (should be 1-5% typically)
    const engagementRate = parseFloat(creator.engagementRate || 0);
    if (engagementRate < 0.5) {
        score -= 25;
        factors.push({ name: 'Low engagement rate', impact: -25, detail: `${engagementRate}% is below expected 1-5%` });
    } else if (engagementRate > 15) {
        // Suspiciously high engagement can indicate fake engagement
        score -= 15;
        factors.push({ name: 'Unusually high engagement', impact: -15, detail: `${engagementRate}% may indicate purchased engagement` });
    } else if (engagementRate >= 2 && engagementRate <= 8) {
        factors.push({ name: 'Healthy engagement rate', impact: 0, detail: `${engagementRate}% is within normal range` });
    }

    // Factor 2: Follower count consistency with platform
    const followersCount = creator.followersCount || 0;
    if (followersCount > 0 && followersCount < 1000 && engagementRate > 10) {
        score -= 10;
        factors.push({ name: 'Engagement inconsistent with follower count', impact: -10, detail: 'High engagement on small audience may be artificial' });
    }

    // Factor 3: Profile completeness (real creators have complete profiles)
    const completenessScore = calculateProfileCompleteness(creator);
    if (completenessScore < 50) {
        score -= 20;
        factors.push({ name: 'Incomplete profile', impact: -20, detail: `${completenessScore}% profile completeness` });
    } else if (completenessScore >= 80) {
        factors.push({ name: 'Complete profile', impact: 0, detail: 'Profile is well-maintained' });
    }

    // Factor 4: Connected social accounts (more = more trustworthy)
    const connectedPlatforms = creator.connectedPlatforms || [];
    if (connectedPlatforms.length === 0) {
        score -= 15;
        factors.push({ name: 'No connected platforms', impact: -15, detail: 'Cannot verify social presence' });
    } else if (connectedPlatforms.length >= 2) {
        factors.push({ name: 'Multiple platforms connected', impact: 0, detail: `${connectedPlatforms.length} platforms verified` });
    }

    // Factor 5: Account age / completed campaigns
    const completedCampaigns = creator.completedCampaigns || 0;
    if (completedCampaigns >= 5) {
        score = Math.min(100, score + 10);
        factors.push({ name: 'Proven track record', impact: 10, detail: `${completedCampaigns} completed campaigns` });
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        factors,
        calculatedAt: new Date()
    };
};

/**
 * Calculate engagement quality score (0-100)
 * Analyzes engagement patterns and velocity
 */
export const calculateEngagementQualityScore = async (creatorId) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId }
    });

    if (!creator) {
        throw new Error('Creator not found');
    }

    let score = 100;
    const factors = [];

    // Factor 1: Engagement rate quality
    const engagementRate = parseFloat(creator.engagementRate || 0);
    if (engagementRate >= 2 && engagementRate <= 6) {
        factors.push({ name: 'Optimal engagement rate', impact: 0, detail: 'Engagement rate indicates genuine audience' });
    } else if (engagementRate < 1) {
        score -= 20;
        factors.push({ name: 'Very low engagement', impact: -20, detail: 'May indicate inactive or fake followers' });
    }

    // Factor 2: On-time delivery rate
    const onTimeRate = parseFloat(creator.onTimeDeliveryRate || 100);
    if (onTimeRate >= 95) {
        factors.push({ name: 'Excellent delivery record', impact: 0, detail: `${onTimeRate}% on-time delivery` });
    } else if (onTimeRate < 80) {
        score -= 15;
        factors.push({ name: 'Delivery concerns', impact: -15, detail: `${onTimeRate}% on-time rate is below standard` });
    }

    // Factor 3: Reliability score from past work
    const reliabilityScore = creator.reliabilityScore || 0;
    if (reliabilityScore >= 80) {
        score = Math.min(100, score + 5);
        factors.push({ name: 'High reliability', impact: 5, detail: `Reliability score: ${reliabilityScore}/100` });
    } else if (reliabilityScore < 50 && reliabilityScore > 0) {
        score -= 10;
        factors.push({ name: 'Low reliability', impact: -10, detail: `Reliability score: ${reliabilityScore}/100` });
    }

    // Factor 4: Video stats verification
    const avgViewDuration = parseFloat(creator.avgViewDuration || 0);
    if (avgViewDuration > 30) {
        factors.push({ name: 'Good view retention', impact: 0, detail: `${avgViewDuration}s average view duration` });
    }

    score = Math.max(0, Math.min(100, score));

    return {
        score,
        factors,
        calculatedAt: new Date()
    };
};

/**
 * Calculate brand safety score (0-100)
 * Assesses content safety and past behavior
 */
export const calculateBrandSafetyScore = async (creatorId) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
        include: {
            user: {
                include: {
                    collaborations: {
                        where: { status: 'Completed' },
                        take: 20
                    }
                }
            }
        }
    });

    if (!creator) {
        throw new Error('Creator not found');
    }

    let score = creator.brandSafetyScore || 100;
    const factors = [];

    // Factor 1: Past collaboration history
    const completedCollabs = creator.user?.collaborations?.length || 0;
    if (completedCollabs >= 10) {
        factors.push({ name: 'Extensive brand experience', impact: 0, detail: `${completedCollabs} successful collaborations` });
    } else if (completedCollabs >= 3) {
        factors.push({ name: 'Some brand experience', impact: 0, detail: `${completedCollabs} completed collaborations` });
    } else if (completedCollabs === 0) {
        score -= 10;
        factors.push({ name: 'No collaboration history', impact: -10, detail: 'New to platform, unverified' });
    }

    // Factor 2: Niche tags (family-friendly vs controversial)
    const nicheTags = creator.nicheTags || [];
    const safeTags = ['lifestyle', 'beauty', 'tech', 'food', 'travel', 'fitness', 'fashion', 'parenting'];
    const hasSafeTags = nicheTags.some(tag => safeTags.includes(tag?.toLowerCase?.()));
    if (hasSafeTags) {
        factors.push({ name: 'Brand-safe content niche', impact: 0, detail: 'Content category is generally safe for brands' });
    }

    // Factor 3: Existing brand safety score
    if (creator.brandSafetyScore === 100) {
        factors.push({ name: 'Clean record', impact: 0, detail: 'No reported issues' });
    } else if (creator.brandSafetyScore < 80) {
        factors.push({ name: 'Previous issues flagged', impact: 0, detail: 'Some concerns in history' });
    }

    score = Math.max(0, Math.min(100, score));

    return {
        score,
        factors,
        calculatedAt: new Date()
    };
};

/**
 * Calculate profile completeness percentage
 */
const calculateProfileCompleteness = (creator) => {
    const fields = [
        creator.fullName,
        creator.handle,
        creator.avatarUrl,
        creator.about,
        creator.location,
        creator.nicheTags?.length > 0,
        creator.primaryPlatform,
        creator.followersCount > 0
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
};

/**
 * Run full vetting analysis for a creator
 */
export const vetCreator = async (creatorId) => {
    const [audienceResult, engagementResult, safetyResult] = await Promise.all([
        calculateAudienceAuthenticityScore(creatorId),
        calculateEngagementQualityScore(creatorId),
        calculateBrandSafetyScore(creatorId)
    ]);

    const overallScore = Math.round(
        (audienceResult.score * 0.4) +
        (engagementResult.score * 0.3) +
        (safetyResult.score * 0.3)
    );

    // Determine verification tier based on overall score
    let verificationTier = 'None';
    if (overallScore >= 90) verificationTier = 'Black';
    else if (overallScore >= 75) verificationTier = 'Gold';
    else if (overallScore >= 50) verificationTier = 'Silver';

    // Update creator profile with scores
    await prisma.creatorProfile.update({
        where: { userId: creatorId },
        data: {
            audienceAuthenticityScore: audienceResult.score,
            engagementQualityScore: engagementResult.score,
            brandSafetyScore: safetyResult.score,
            verificationTier: verificationTier,
            lastVettedAt: new Date(),
            vettingData: {
                audienceFactors: audienceResult.factors,
                engagementFactors: engagementResult.factors,
                safetyFactors: safetyResult.factors,
                overallScore,
                vettedAt: new Date().toISOString()
            }
        }
    });

    return {
        creatorId,
        audienceAuthenticityScore: audienceResult.score,
        engagementQualityScore: engagementResult.score,
        brandSafetyScore: safetyResult.score,
        overallScore,
        verificationTier,
        details: {
            audienceFactors: audienceResult.factors,
            engagementFactors: engagementResult.factors,
            safetyFactors: safetyResult.factors
        }
    };
};

/**
 * Generate a vetting report for a brand to view
 */
export const generateVettingReport = async (creatorId, brandId = null) => {
    // Run fresh vetting
    const vettingResult = await vetCreator(creatorId);

    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
        select: {
            fullName: true,
            handle: true,
            followersCount: true,
            engagementRate: true,
            verificationTier: true,
            completedCampaigns: true,
            primaryPlatform: true
        }
    });

    // Create report in database
    const report = await prisma.vettingReport.create({
        data: {
            creatorId,
            brandId,
            audienceAuthenticityScore: vettingResult.audienceAuthenticityScore,
            engagementQualityScore: vettingResult.engagementQualityScore,
            brandSafetyScore: vettingResult.brandSafetyScore,
            overallScore: vettingResult.overallScore,
            verificationTierAtTime: vettingResult.verificationTier,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            reportData: {
                creator: {
                    name: creator.fullName,
                    handle: creator.handle,
                    platform: creator.primaryPlatform,
                    followers: creator.followersCount,
                    engagementRate: creator.engagementRate,
                    completedCampaigns: creator.completedCampaigns
                },
                scores: {
                    audience: vettingResult.audienceAuthenticityScore,
                    engagement: vettingResult.engagementQualityScore,
                    safety: vettingResult.brandSafetyScore,
                    overall: vettingResult.overallScore
                },
                factors: vettingResult.details,
                riskFlags: extractRiskFlags(vettingResult.details),
                recommendations: generateRecommendations(vettingResult)
            }
        }
    });

    return report;
};

/**
 * Extract risk flags from vetting factors
 */
const extractRiskFlags = (details) => {
    const flags = [];

    const allFactors = [
        ...details.audienceFactors,
        ...details.engagementFactors,
        ...details.safetyFactors
    ];

    allFactors.forEach(factor => {
        if (factor.impact < -10) {
            flags.push({
                severity: 'high',
                message: factor.name,
                detail: factor.detail
            });
        } else if (factor.impact < 0) {
            flags.push({
                severity: 'medium',
                message: factor.name,
                detail: factor.detail
            });
        }
    });

    return flags;
};

/**
 * Generate recommendations based on vetting results
 */
const generateRecommendations = (result) => {
    const recommendations = [];

    if (result.overallScore >= 80) {
        recommendations.push('✅ This creator has a strong verification profile and is recommended for brand partnerships.');
    }

    if (result.audienceAuthenticityScore < 60) {
        recommendations.push('⚠️ Consider requesting additional audience verification before proceeding.');
    }

    if (result.engagementQualityScore >= 80) {
        recommendations.push('✅ Engagement quality is excellent, indicating genuine audience interaction.');
    }

    if (result.brandSafetyScore < 70) {
        recommendations.push('⚠️ Review content history before confirming brand-sensitive campaigns.');
    }

    if (result.verificationTier === 'Black') {
        recommendations.push('⭐ Black tier creator - Top performer with verified authentic audience.');
    } else if (result.verificationTier === 'None') {
        recommendations.push('ℹ️ New or unverified creator - Consider a trial collaboration first.');
    }

    return recommendations;
};

/**
 * Get vetting reports for a creator
 */
export const getCreatorVettingReports = async (creatorId) => {
    return prisma.vettingReport.findMany({
        where: { creatorId },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
};

/**
 * Get a specific vetting report
 */
export const getVettingReportById = async (reportId) => {
    return prisma.vettingReport.findUnique({
        where: { id: reportId },
        include: {
            creator: {
                select: {
                    fullName: true,
                    handle: true,
                    avatarUrl: true,
                    verificationTier: true
                }
            }
        }
    });
};

/**
 * Get creator vetting summary (for discovery/profile display)
 */
export const getCreatorVettingSummary = async (creatorId) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
        select: {
            verificationTier: true,
            audienceAuthenticityScore: true,
            engagementQualityScore: true,
            brandSafetyScore: true,
            lastVettedAt: true,
            reliabilityScore: true,
            completedCampaigns: true,
            onTimeDeliveryRate: true
        }
    });

    if (!creator) {
        throw new Error('Creator not found');
    }

    // Calculate overall score
    const overallScore = Math.round(
        ((creator.audienceAuthenticityScore || 0) * 0.4) +
        ((creator.engagementQualityScore || 0) * 0.3) +
        ((creator.brandSafetyScore || 100) * 0.3)
    );

    return {
        verificationTier: creator.verificationTier || 'None',
        scores: {
            overall: overallScore,
            audience: creator.audienceAuthenticityScore || 0,
            engagement: creator.engagementQualityScore || 0,
            safety: creator.brandSafetyScore || 100
        },
        reliability: {
            score: creator.reliabilityScore || 0,
            completedCampaigns: creator.completedCampaigns || 0,
            onTimeRate: creator.onTimeDeliveryRate ? parseFloat(creator.onTimeDeliveryRate) : null
        },
        lastVettedAt: creator.lastVettedAt
    };
};
