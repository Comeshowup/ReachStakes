import { prisma } from "../config/db.js";
import crypto from "crypto";

// Generate a unique referral code
const generateReferralCode = () => {
    const code = `REACH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return code;
};

// @desc    Get current user's referral stats
// @route   GET /api/referrals/my-stats
// @access  Private
export const getMyStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get creator profile with referral data
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: {
                referralCode: true,
                referralCount: true,
                referralEarnings: true,
                fullName: true,
                handle: true
            }
        });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Creator profile not found'
            });
        }

        // Get list of referred users
        const referredUsers = await prisma.user.findMany({
            where: { referredBy: userId },
            select: {
                id: true,
                name: true,
                createdAt: true,
                creatorProfile: {
                    select: {
                        handle: true,
                        avatarUrl: true,
                        completedCampaigns: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json({
            status: 'success',
            data: {
                referralCode: profile.referralCode,
                referralLink: profile.referralCode
                    ? `https://reachstakes.com/join?ref=${profile.referralCode}`
                    : null,
                referralCount: profile.referralCount,
                referralEarnings: parseFloat(profile.referralEarnings) || 0,
                recentReferrals: referredUsers.map(u => ({
                    id: u.id,
                    name: u.name,
                    handle: u.creatorProfile?.handle,
                    avatar: u.creatorProfile?.avatarUrl,
                    completedCampaigns: u.creatorProfile?.completedCampaigns || 0,
                    joinedAt: u.createdAt
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching referral stats:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch referral stats'
        });
    }
};

// @desc    Generate a referral code for user
// @route   POST /api/referrals/generate-code
// @access  Private
export const generateCode = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user already has a code
        const existingProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { referralCode: true }
        });

        if (existingProfile?.referralCode) {
            return res.json({
                status: 'success',
                data: {
                    referralCode: existingProfile.referralCode,
                    message: 'Referral code already exists'
                }
            });
        }

        // Generate unique code
        let code = generateReferralCode();
        let attempts = 0;
        const maxAttempts = 5;

        // Ensure uniqueness
        while (attempts < maxAttempts) {
            const existing = await prisma.creatorProfile.findUnique({
                where: { referralCode: code }
            });
            if (!existing) break;
            code = generateReferralCode();
            attempts++;
        }

        // Update profile with new code
        const updated = await prisma.creatorProfile.update({
            where: { userId },
            data: { referralCode: code }
        });

        res.json({
            status: 'success',
            data: {
                referralCode: updated.referralCode,
                referralLink: `https://reachstakes.com/join?ref=${updated.referralCode}`
            }
        });
    } catch (error) {
        console.error("Error generating referral code:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate referral code'
        });
    }
};

// @desc    Validate a referral code (for signup form)
// @route   GET /api/referrals/validate/:code
// @access  Public
export const validateCode = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({
                status: 'error',
                message: 'Referral code is required'
            });
        }

        const profile = await prisma.creatorProfile.findUnique({
            where: { referralCode: code.toUpperCase() },
            select: {
                userId: true,
                fullName: true,
                handle: true,
                avatarUrl: true
            }
        });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Invalid referral code',
                valid: false
            });
        }

        res.json({
            status: 'success',
            valid: true,
            data: {
                referrerName: profile.fullName,
                referrerHandle: profile.handle,
                referrerAvatar: profile.avatarUrl,
                bonus: 'Fast-Track Verification'
            }
        });
    } catch (error) {
        console.error("Error validating referral code:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to validate referral code'
        });
    }
};

// @desc    Apply referral bonus after first campaign completion
// @route   POST /api/referrals/apply-bonus
// @access  Private (Internal use)
export const applyReferralBonus = async (userId, campaignEarnings) => {
    try {
        // Get user's referrer
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referredBy: true }
        });

        if (!user?.referredBy) return null;

        // Calculate 1% bonus for referrer
        const bonusAmount = parseFloat(campaignEarnings) * 0.01;

        // Update referrer's earnings
        const updated = await prisma.creatorProfile.update({
            where: { userId: user.referredBy },
            data: {
                referralEarnings: {
                    increment: bonusAmount
                }
            }
        });

        console.log(`Referral bonus of $${bonusAmount.toFixed(2)} applied to user ${user.referredBy}`);
        return updated;
    } catch (error) {
        console.error("Error applying referral bonus:", error);
        return null;
    }
};
