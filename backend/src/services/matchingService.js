/**
 * Matching Service
 * Advanced AI-powered creator-campaign matching with explainability
 * Phase 8: AI Matching & Explainability
 */

import { prisma } from '../config/db.js';

// ============================================
// MATCH SCORE WEIGHTS
// ============================================

const WEIGHTS = {
    NICHE_MATCH: 25,          // Creator niche matches campaign tags
    INDUSTRY_MATCH: 15,       // Creator niche matches brand industry
    PLATFORM_MATCH: 20,       // Creator's primary platform matches required
    FOLLOWER_TIER: 10,        // Follower count in desired range
    ENGAGEMENT_RATE: 15,      // High engagement rate
    VERIFICATION_TIER: 10,    // Higher verification = more trustworthy
    PAST_PERFORMANCE: 15,     // Historical success with similar campaigns
    GUARANTEED_PAY: 5,        // Campaign offers guaranteed pay
    RECENT_ACTIVITY: 5,       // Creator recently active
    EXCLUSIVITY_FIT: 5        // Creator availability for exclusivity
};

// ============================================
// CREATOR-CAMPAIGN MATCHING
// ============================================

/**
 * Calculate match score between a creator and campaign with explainability
 */
export const calculateMatchScore = async (creatorId, campaignId) => {
    // Fetch creator profile
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
        include: {
            user: { select: { name: true, email: true } },
            demographics: true
        }
    });

    if (!creator) throw new Error('Creator not found');

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            brand: {
                include: { brandProfile: true }
            }
        }
    });

    if (!campaign) throw new Error('Campaign not found');

    // Calculate individual scores
    const signals = [];
    let totalScore = 0;

    // 1. Niche Match
    const nicheScore = calculateNicheMatch(creator, campaign);
    if (nicheScore.score > 0) {
        signals.push({
            signal: 'Niche Match',
            score: nicheScore.score,
            maxScore: WEIGHTS.NICHE_MATCH,
            explanation: nicheScore.explanation,
            icon: '🎯'
        });
        totalScore += nicheScore.score;
    }

    // 2. Industry Match
    const industryScore = calculateIndustryMatch(creator, campaign);
    if (industryScore.score > 0) {
        signals.push({
            signal: 'Industry Alignment',
            score: industryScore.score,
            maxScore: WEIGHTS.INDUSTRY_MATCH,
            explanation: industryScore.explanation,
            icon: '🏢'
        });
        totalScore += industryScore.score;
    }

    // 3. Platform Match
    const platformScore = calculatePlatformMatch(creator, campaign);
    if (platformScore.score > 0) {
        signals.push({
            signal: 'Platform Match',
            score: platformScore.score,
            maxScore: WEIGHTS.PLATFORM_MATCH,
            explanation: platformScore.explanation,
            icon: '📱'
        });
        totalScore += platformScore.score;
    }

    // 4. Follower Tier
    const followerScore = calculateFollowerTier(creator, campaign);
    if (followerScore.score > 0) {
        signals.push({
            signal: 'Audience Size',
            score: followerScore.score,
            maxScore: WEIGHTS.FOLLOWER_TIER,
            explanation: followerScore.explanation,
            icon: '👥'
        });
        totalScore += followerScore.score;
    }

    // 5. Engagement Rate
    const engagementScore = calculateEngagementScore(creator);
    if (engagementScore.score > 0) {
        signals.push({
            signal: 'Engagement Rate',
            score: engagementScore.score,
            maxScore: WEIGHTS.ENGAGEMENT_RATE,
            explanation: engagementScore.explanation,
            icon: '💬'
        });
        totalScore += engagementScore.score;
    }

    // 6. Verification Tier
    const verificationScore = calculateVerificationScore(creator);
    if (verificationScore.score > 0) {
        signals.push({
            signal: 'Verification Status',
            score: verificationScore.score,
            maxScore: WEIGHTS.VERIFICATION_TIER,
            explanation: verificationScore.explanation,
            icon: '✓'
        });
        totalScore += verificationScore.score;
    }

    // 7. Past Performance
    const performanceScore = await calculatePastPerformance(creatorId, campaign);
    if (performanceScore.score > 0) {
        signals.push({
            signal: 'Track Record',
            score: performanceScore.score,
            maxScore: WEIGHTS.PAST_PERFORMANCE,
            explanation: performanceScore.explanation,
            icon: '📈'
        });
        totalScore += performanceScore.score;
    }

    // 8. Guaranteed Pay Bonus
    if (campaign.isGuaranteedPay) {
        signals.push({
            signal: 'Guaranteed Payment',
            score: WEIGHTS.GUARANTEED_PAY,
            maxScore: WEIGHTS.GUARANTEED_PAY,
            explanation: 'Campaign offers escrow-protected payment',
            icon: '💰'
        });
        totalScore += WEIGHTS.GUARANTEED_PAY;
    }

    // Sort signals by score and get top 3
    const topSignals = signals
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    // Calculate max possible score
    const maxPossibleScore = Object.values(WEIGHTS).reduce((sum, w) => sum + w, 0);

    // Normalize to 0-100
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

    return {
        score: normalizedScore,
        rawScore: totalScore,
        maxScore: maxPossibleScore,
        matchLevel: getMatchLevel(normalizedScore),
        topSignals,
        allSignals: signals,
        creator: {
            id: creatorId,
            name: creator.fullName,
            handle: creator.handle
        },
        campaign: {
            id: campaignId,
            title: campaign.title
        }
    };
};

// ============================================
// INDIVIDUAL SCORING FUNCTIONS
// ============================================

const calculateNicheMatch = (creator, campaign) => {
    const creatorNiches = Array.isArray(creator.nicheTags) ? creator.nicheTags : [];
    const campaignTags = Array.isArray(campaign.tags) ? campaign.tags : [];

    if (creatorNiches.length === 0 || campaignTags.length === 0) {
        return { score: 0, explanation: 'No niche data available' };
    }

    let matchCount = 0;
    const matchedTags = [];

    creatorNiches.forEach(niche => {
        campaignTags.forEach(tag => {
            if (niche.toLowerCase().includes(tag.toLowerCase()) ||
                tag.toLowerCase().includes(niche.toLowerCase())) {
                matchCount++;
                matchedTags.push(tag);
            }
        });
    });

    if (matchCount === 0) {
        return { score: 0, explanation: 'No niche overlap found' };
    }

    const score = Math.min(WEIGHTS.NICHE_MATCH, matchCount * 8);
    return {
        score,
        explanation: `Your niche matches: ${[...new Set(matchedTags)].slice(0, 3).join(', ')}`
    };
};

const calculateIndustryMatch = (creator, campaign) => {
    const creatorNiches = Array.isArray(creator.nicheTags) ? creator.nicheTags : [];
    const brandIndustry = campaign.brand?.brandProfile?.industry;

    if (!brandIndustry || creatorNiches.length === 0) {
        return { score: 0, explanation: 'No industry data available' };
    }

    const matches = creatorNiches.some(niche =>
        niche.toLowerCase().includes(brandIndustry.toLowerCase()) ||
        brandIndustry.toLowerCase().includes(niche.toLowerCase())
    );

    if (matches) {
        return {
            score: WEIGHTS.INDUSTRY_MATCH,
            explanation: `Aligned with ${brandIndustry} industry`
        };
    }

    return { score: 0, explanation: 'No industry alignment' };
};

const calculatePlatformMatch = (creator, campaign) => {
    const creatorPlatform = creator.primaryPlatform?.toLowerCase();
    const requiredPlatform = campaign.platformRequired?.toLowerCase();

    if (!creatorPlatform || !requiredPlatform) {
        return { score: WEIGHTS.PLATFORM_MATCH / 2, explanation: 'Platform not specified' };
    }

    if (creatorPlatform === requiredPlatform) {
        return {
            score: WEIGHTS.PLATFORM_MATCH,
            explanation: `Perfect match: ${campaign.platformRequired}`
        };
    }

    // Cross-platform creators might be valuable
    return { score: 0, explanation: `Campaign requires ${campaign.platformRequired}` };
};

const calculateFollowerTier = (creator, campaign) => {
    const followers = creator.followersCount || 0;
    const budget = parseFloat(campaign.targetBudget || campaign.budget || 0);

    // Determine desired tier based on budget
    let tier = 'nano';
    if (budget >= 10000) tier = 'mega';
    else if (budget >= 5000) tier = 'macro';
    else if (budget >= 1000) tier = 'mid';
    else if (budget >= 500) tier = 'micro';

    // Check if creator fits tier
    const tiers = {
        nano: { min: 1000, max: 10000 },
        micro: { min: 10000, max: 50000 },
        mid: { min: 50000, max: 250000 },
        macro: { min: 250000, max: 1000000 },
        mega: { min: 1000000, max: Infinity }
    };

    const targetTier = tiers[tier];

    if (followers >= targetTier.min && followers <= targetTier.max) {
        return {
            score: WEIGHTS.FOLLOWER_TIER,
            explanation: `Ideal audience size for this budget (${tier} tier)`
        };
    }

    // Partial score for adjacent tiers
    if (followers >= targetTier.min * 0.5 || followers <= targetTier.max * 1.5) {
        return {
            score: WEIGHTS.FOLLOWER_TIER / 2,
            explanation: `Audience size close to target range`
        };
    }

    return { score: 0, explanation: 'Audience size outside target range' };
};

const calculateEngagementScore = (creator) => {
    const engagementRate = parseFloat(creator.engagementRate || 0);

    if (engagementRate >= 5) {
        return {
            score: WEIGHTS.ENGAGEMENT_RATE,
            explanation: `Excellent engagement rate: ${engagementRate}%`
        };
    } else if (engagementRate >= 3) {
        return {
            score: WEIGHTS.ENGAGEMENT_RATE * 0.8,
            explanation: `Strong engagement rate: ${engagementRate}%`
        };
    } else if (engagementRate >= 1) {
        return {
            score: WEIGHTS.ENGAGEMENT_RATE * 0.5,
            explanation: `Average engagement rate: ${engagementRate}%`
        };
    }

    return { score: 0, explanation: 'Engagement rate data not available' };
};

const calculateVerificationScore = (creator) => {
    const tier = creator.verificationTier;

    switch (tier) {
        case 'Black':
            return { score: WEIGHTS.VERIFICATION_TIER, explanation: 'Black tier verified - highest trust' };
        case 'Gold':
            return { score: WEIGHTS.VERIFICATION_TIER * 0.8, explanation: 'Gold tier verified' };
        case 'Silver':
            return { score: WEIGHTS.VERIFICATION_TIER * 0.5, explanation: 'Silver tier verified' };
        default:
            return { score: 0, explanation: 'Not yet verified' };
    }
};

const calculatePastPerformance = async (creatorId, campaign) => {
    // Get past collaborations
    const pastCollabs = await prisma.campaignCollaboration.findMany({
        where: {
            creatorId,
            status: { in: ['Approved', 'Paid'] }
        },
        include: {
            campaign: {
                include: { brand: { include: { brandProfile: true } } }
            }
        }
    });

    if (pastCollabs.length === 0) {
        return { score: 0, explanation: 'No past campaign data' };
    }

    let score = 0;
    let explanation = '';

    // Same brand = huge bonus
    const sameBrandCollabs = pastCollabs.filter(c =>
        c.campaign.brandId === campaign.brandId
    );
    if (sameBrandCollabs.length > 0) {
        score += 10;
        explanation = `Worked with this brand ${sameBrandCollabs.length}x before`;
    }

    // Same industry
    const brandIndustry = campaign.brand?.brandProfile?.industry;
    const sameIndustryCollabs = pastCollabs.filter(c =>
        c.campaign.brand?.brandProfile?.industry === brandIndustry
    );
    if (sameIndustryCollabs.length > 0) {
        score += 5;
        if (!explanation) explanation = `${sameIndustryCollabs.length} successful ${brandIndustry} campaigns`;
    }

    // General experience
    if (pastCollabs.length >= 5 && score === 0) {
        score = 5;
        explanation = `Completed ${pastCollabs.length} campaigns`;
    }

    return {
        score: Math.min(WEIGHTS.PAST_PERFORMANCE, score),
        explanation: explanation || 'Has campaign experience'
    };
};

const getMatchLevel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Great';
    if (score >= 40) return 'Good';
    if (score >= 20) return 'Fair';
    return 'Low';
};

// ============================================
// PREDICTED ROI
// ============================================

/**
 * Calculate predicted ROI for a creator-campaign pairing
 */
export const predictROI = async (creatorId, campaignId) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId }
    });

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
    });

    if (!creator || !campaign) throw new Error('Creator or campaign not found');

    // Get historical performance
    const pastCollabs = await prisma.campaignCollaboration.findMany({
        where: {
            creatorId,
            status: 'Paid',
            videoStats: { not: null }
        }
    });

    // Base metrics
    const followers = creator.followersCount || 10000;
    const engagementRate = parseFloat(creator.engagementRate || 2) / 100;
    const budget = parseFloat(campaign.targetBudget || campaign.budget || 500);

    // Estimate views (typically 10-30% of followers see content)
    const estimatedViews = followers * 0.15;
    const estimatedEngagement = estimatedViews * engagementRate;

    // Conversion estimates (industry averages)
    const clickThroughRate = 0.02; // 2% CTR from views
    const conversionRate = 0.03;   // 3% of clicks convert
    const avgOrderValue = 75;      // $75 average order

    const estimatedClicks = estimatedViews * clickThroughRate;
    const estimatedConversions = estimatedClicks * conversionRate;
    const estimatedRevenue = estimatedConversions * avgOrderValue;

    // ROI calculation
    const roi = budget > 0 ? ((estimatedRevenue - budget) / budget * 100) : 0;

    // Cost efficiency
    const costPerView = budget / estimatedViews;
    const costPerEngagement = budget / estimatedEngagement;

    // Confidence based on historical data
    let confidence = 'Low';
    if (pastCollabs.length >= 10) confidence = 'High';
    else if (pastCollabs.length >= 5) confidence = 'Medium';

    return {
        investment: budget,
        projectedMetrics: {
            views: Math.round(estimatedViews),
            engagement: Math.round(estimatedEngagement),
            clicks: Math.round(estimatedClicks),
            conversions: Math.round(estimatedConversions),
            revenue: Math.round(estimatedRevenue)
        },
        efficiency: {
            costPerView: costPerView.toFixed(4),
            costPerEngagement: costPerEngagement.toFixed(2),
            costPerConversion: estimatedConversions > 0
                ? (budget / estimatedConversions).toFixed(2)
                : 'N/A'
        },
        projectedROI: roi.toFixed(1),
        confidence,
        factors: [
            { factor: 'Follower Count', value: followers.toLocaleString(), impact: 'High' },
            { factor: 'Engagement Rate', value: `${(engagementRate * 100).toFixed(1)}%`, impact: engagementRate > 0.03 ? 'High' : 'Medium' },
            { factor: 'Historical Data', value: `${pastCollabs.length} campaigns`, impact: pastCollabs.length > 5 ? 'High' : 'Low' }
        ]
    };
};

// ============================================
// CREATOR RECOMMENDATIONS
// ============================================

/**
 * Get "Scale this creator" recommendations
 * Find similar creators who might perform well
 */
export const getScaleRecommendations = async (creatorId, limit = 5) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId }
    });

    if (!creator) throw new Error('Creator not found');

    // Find similar creators
    const similarCreators = await prisma.creatorProfile.findMany({
        where: {
            userId: { not: creatorId },
            primaryPlatform: creator.primaryPlatform,
            OR: [
                { nicheTags: { hasSome: creator.nicheTags || [] } },
                {
                    followersCount: {
                        gte: (creator.followersCount || 0) * 0.5,
                        lte: (creator.followersCount || 0) * 2
                    }
                }
            ]
        },
        include: {
            user: { select: { name: true } }
        },
        take: limit * 2 // Get more to filter
    });

    // Score and rank
    const recommendations = similarCreators.map(c => {
        let similarityScore = 0;
        const reasons = [];

        // Platform match
        if (c.primaryPlatform === creator.primaryPlatform) {
            similarityScore += 20;
            reasons.push(`Same platform (${c.primaryPlatform})`);
        }

        // Niche overlap
        const creatorNiches = creator.nicheTags || [];
        const cNiches = c.nicheTags || [];
        const nicheOverlap = creatorNiches.filter(n => cNiches.includes(n));
        if (nicheOverlap.length > 0) {
            similarityScore += nicheOverlap.length * 15;
            reasons.push(`Shares ${nicheOverlap[0]} niche`);
        }

        // Similar follower count
        const followerRatio = (c.followersCount || 1) / (creator.followersCount || 1);
        if (followerRatio >= 0.7 && followerRatio <= 1.3) {
            similarityScore += 15;
            reasons.push('Similar audience size');
        }

        // Similar engagement
        const engDiff = Math.abs((c.engagementRate || 0) - (creator.engagementRate || 0));
        if (engDiff < 1) {
            similarityScore += 10;
            reasons.push('Similar engagement rate');
        }

        return {
            id: c.userId,
            name: c.fullName || c.user.name,
            handle: c.handle,
            platform: c.primaryPlatform,
            followers: c.followersCount,
            engagementRate: c.engagementRate,
            verificationTier: c.verificationTier,
            similarityScore,
            reasons: reasons.slice(0, 3)
        };
    })
        .filter(c => c.similarityScore > 0)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

    return {
        originalCreator: {
            id: creatorId,
            name: creator.fullName,
            handle: creator.handle
        },
        recommendations
    };
};

// ============================================
// SMART CAMPAIGN SUGGESTIONS
// ============================================

/**
 * Get personalized campaign suggestions for a creator
 */
export const getCampaignSuggestions = async (creatorId, limit = 10) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId }
    });

    if (!creator) throw new Error('Creator not found');

    // Get active campaigns
    const campaigns = await prisma.campaign.findMany({
        where: {
            OR: [{ status: 'Active' }, { status: 'Draft' }]
        },
        include: {
            brand: {
                include: { brandProfile: true }
            }
        }
    });

    // Exclude already applied
    const existingCollabs = await prisma.campaignCollaboration.findMany({
        where: { creatorId },
        select: { campaignId: true }
    });
    const appliedIds = new Set(existingCollabs.map(c => c.campaignId));

    // Score each campaign
    const suggestions = [];

    for (const campaign of campaigns) {
        if (appliedIds.has(campaign.id)) continue;

        const matchResult = await calculateMatchScore(creatorId, campaign.id);

        suggestions.push({
            campaign: {
                id: campaign.id,
                title: campaign.title,
                description: campaign.description?.slice(0, 150),
                platform: campaign.platformRequired,
                budget: campaign.targetBudget || campaign.budget,
                deadline: campaign.deadline,
                isGuaranteedPay: campaign.isGuaranteedPay,
                brand: {
                    name: campaign.brand?.brandProfile?.companyName,
                    logo: campaign.brand?.brandProfile?.logoUrl
                }
            },
            matchScore: matchResult.score,
            matchLevel: matchResult.matchLevel,
            topReasons: matchResult.topSignals.map(s => ({
                signal: s.signal,
                explanation: s.explanation,
                icon: s.icon
            }))
        });
    }

    // Sort by match score and return top N
    return suggestions
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
};

// ============================================
// AUDIENCE OVERLAP ANALYSIS
// ============================================

/**
 * Analyze potential audience overlap between creators
 */
export const analyzeAudienceOverlap = async (creatorIds) => {
    if (!Array.isArray(creatorIds) || creatorIds.length < 2) {
        throw new Error('At least 2 creator IDs required');
    }

    const creators = await prisma.creatorProfile.findMany({
        where: { userId: { in: creatorIds } },
        include: { demographics: true }
    });

    if (creators.length < 2) {
        throw new Error('Could not find enough creators');
    }

    // Analyze overlap factors
    const analysis = {
        creators: creators.map(c => ({
            id: c.userId,
            name: c.fullName,
            handle: c.handle,
            platform: c.primaryPlatform,
            followers: c.followersCount,
            niches: c.nicheTags
        })),
        overlapFactors: []
    };

    // Platform overlap
    const platforms = creators.map(c => c.primaryPlatform);
    const uniquePlatforms = [...new Set(platforms)];
    if (uniquePlatforms.length === 1) {
        analysis.overlapFactors.push({
            factor: 'Same Platform',
            severity: 'High',
            description: `All creators are on ${uniquePlatforms[0]} - consider diversifying`,
            recommendation: 'Add creators from other platforms for broader reach'
        });
    }

    // Niche overlap
    const allNiches = creators.flatMap(c => c.nicheTags || []);
    const nicheCounts = {};
    allNiches.forEach(n => { nicheCounts[n] = (nicheCounts[n] || 0) + 1; });

    const overlappingNiches = Object.entries(nicheCounts)
        .filter(([_, count]) => count > 1)
        .map(([niche]) => niche);

    if (overlappingNiches.length > 0) {
        analysis.overlapFactors.push({
            factor: 'Niche Overlap',
            severity: overlappingNiches.length > 2 ? 'Medium' : 'Low',
            description: `Shared niches: ${overlappingNiches.join(', ')}`,
            recommendation: 'Some overlap is good for consistent messaging'
        });
    }

    // Follower tier overlap
    const tiers = creators.map(c => {
        const f = c.followersCount || 0;
        if (f < 10000) return 'nano';
        if (f < 50000) return 'micro';
        if (f < 250000) return 'mid';
        if (f < 1000000) return 'macro';
        return 'mega';
    });
    const uniqueTiers = [...new Set(tiers)];

    if (uniqueTiers.length === 1) {
        analysis.overlapFactors.push({
            factor: 'Same Audience Size',
            severity: 'Medium',
            description: `All creators are ${uniqueTiers[0]}-tier`,
            recommendation: 'Mix different tiers for varied reach'
        });
    }

    // Calculate overall overlap score
    let overlapScore = 0;
    if (uniquePlatforms.length === 1) overlapScore += 40;
    if (overlappingNiches.length > 0) overlapScore += overlappingNiches.length * 10;
    if (uniqueTiers.length === 1) overlapScore += 20;

    analysis.overlapScore = Math.min(100, overlapScore);
    analysis.overlapLevel = overlapScore > 60 ? 'High' : overlapScore > 30 ? 'Medium' : 'Low';

    return analysis;
};
