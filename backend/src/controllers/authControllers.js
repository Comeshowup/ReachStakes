import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Phase 2: Gamification - Streak Tracking Helper
const updateCreatorStreak = async (userId) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { lastLoginAt: true, currentStreak: true, longestStreak: true }
        });

        if (!profile) return null;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastLogin = profile.lastLoginAt ? new Date(profile.lastLoginAt) : null;
        const lastLoginDate = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()) : null;

        let newStreak = 1;

        if (lastLoginDate) {
            const daysDiff = Math.floor((today - lastLoginDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day login - don't change streak
                newStreak = profile.currentStreak || 1;
            } else if (daysDiff === 1) {
                // Consecutive day - increment streak
                newStreak = (profile.currentStreak || 0) + 1;
            }
            // else: Gap > 1 day - reset to 1
        }

        const newLongestStreak = Math.max(newStreak, profile.longestStreak || 0);

        return await prisma.creatorProfile.update({
            where: { userId },
            data: {
                lastLoginAt: now,
                currentStreak: newStreak,
                longestStreak: newLongestStreak
            }
        });
    } catch (error) {
        console.error("Streak update error:", error);
        return null;
    }
};

const register = async (req, res) => {
    const { email, password, role, handle, referralCode } = req.body;
    const name = req.body.name || req.body.companyName || req.body.fullName;

    //check if user exists
    const userExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (userExists) {
        return res.status(400).json({
            status: "error",
            message: "User already exists"
        });
    }

    // Phase 3: Validate referral code if provided
    let referrerUserId = null;
    if (referralCode && role === 'creator') {
        const referrer = await prisma.creatorProfile.findUnique({
            where: { referralCode: referralCode.toUpperCase() },
            select: { userId: true }
        });
        if (referrer) {
            referrerUserId = referrer.userId;
        }
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        // Use transaction to ensure both user and profile are created or neither
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create User
            const user = await prisma.user.create({
                data: {
                    name: name, // This acts as "Full Name" for creators or "Contact Name" for brands initially
                    email: email,
                    passwordHash: hashedPassword,
                    role: role,
                    referredBy: referrerUserId // Phase 3: Link to referrer
                }
            });

            // 2. Create Profile based on role
            if (role === 'brand') {
                await prisma.brandProfile.create({
                    data: {
                        userId: user.id,
                        companyName: name, // Using the provided name as Company Name initially
                        contactEmail: email
                    }
                });
            } else if (role === 'creator') {
                if (!handle) {
                    throw new Error("Handle is required for creators");
                }
                await prisma.creatorProfile.create({
                    data: {
                        userId: user.id,
                        fullName: name,
                        handle: handle,
                        // Defaults
                        mediaKitEnabled: true,
                        verificationTier: referrerUserId ? 'Silver' : 'None', // Phase 3: Fast-Track Verification for referred creators
                        referredByUserId: referrerUserId // Phase 3: Also track in profile
                    }
                });

                // Phase 3: Increment referrer's count
                if (referrerUserId) {
                    await prisma.creatorProfile.update({
                        where: { userId: referrerUserId },
                        data: { referralCount: { increment: 1 } }
                    });
                }
            }

            return user;
        });

        //generate token
        const token = generateToken(result.id, res);

        res.status(201).json({
            status: "success",
            data: {
                user: result,
                token: generateToken(result.id)
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(400).json({
            status: "error",
            message: error.message || "Registration failed"
        });
    }
}

const login = async (req, res) => {
    console.log("Login Request Body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email and password are required"
        });
    }

    //check if user exists
    const user = await prisma.user.findUnique({
        where: {
            email: email
        },
        include: { brandProfile: true }
    });

    if (!user) {
        return res.status(401).json({
            status: "error",
            message: "Invalid email or password"
        });
    }

    //check if password is correct
    // If user was created via Google, passwordHash might be null.
    // In that case, they cannot login with password.
    if (!user.passwordHash) {
        return res.status(401).json({
            status: "error",
            message: "Please login with Google"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
        return res.status(401).json({
            status: "error",
            message: "Invalid email or password"
        });
    }

    //generate token
    const token = generateToken(user.id, res);

    // Phase 2: Update streak for creators
    if (user.role === 'creator') {
        await updateCreatorStreak(user.id);
    }

    res.status(201).json({
        status: "success",
        data: {
            user,
            token
        }
    });
}

const googleLogin = async (req, res) => {
    const { access_token, role } = req.body;

    try {
        // Verify access token and get user info from Google
        // This ensures the token is valid and belongs to the user claiming it
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const { email, name, sub: googleId } = googleResponse.data;

        // RESTRICTION: Only allow specific allowed emails from env
        // This provides better security and configurability than hardcoded strings
        const allowedEmails = process.env.ALLOWED_EMAILS ? process.env.ALLOWED_EMAILS.split(',') : [];
        if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
            return res.status(403).json({
                status: "error",
                message: "Access restricted. Your email is not authorized for this application."
            });
        }

        // Check if user already exists in the database
        let user = await prisma.user.findUnique({
            where: { email },
            include: { brandProfile: true }
        });

        if (!user) {
            // Create new user if they don't exist
            // Defaulting role to "brand" if not provided, though typically role should be selected on frontend
            const userRole = role || "brand";

            const result = await prisma.$transaction(async (prisma) => {
                const newUser = await prisma.user.create({
                    data: {
                        name,
                        email,
                        role: userRole,
                        // passwordHash is optional for Google users
                    },
                });

                // Create Profile based on role
                if (userRole === 'brand') {
                    await prisma.brandProfile.create({
                        data: {
                            userId: newUser.id,
                            companyName: name,
                            contactEmail: email,
                            onboardingCompleted: false // Explicitly set false
                        }
                    });
                } else if (userRole === 'creator') {
                    // Generater a placeholder handle
                    const handle = email.split('@')[0] + Math.floor(Math.random() * 1000);
                    await prisma.creatorProfile.create({
                        data: {
                            userId: newUser.id,
                            fullName: name,
                            handle: handle,
                            mediaKitEnabled: true,
                            verificationTier: 'None'
                        }
                    });
                }

                return newUser;
            });

            // Re-fetch user with profile to ensure we return consistent structure
            user = await prisma.user.findUnique({
                where: { id: result.id },
                include: { brandProfile: true }
            });
        }

        // Generate JWT token for session management
        const token = generateToken(user.id, res);

        // Phase 2: Update streak for creators
        if (user.role === 'creator') {
            await updateCreatorStreak(user.id);
        }

        res.status(200).json({
            status: "success",
            data: {
                user,
                token,
            },
        });

    } catch (error) {
        console.error("Google Auth Error:", error.response?.data || error);
        // Return more specific error for debugging
        res.status(400).json({
            status: "error",
            message: error.message || "Google authentication failed",
            details: error.response?.data || error.toString()
        });
    }
};

const logout = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(Date.now() + 1),
    });
    res.status(200).json({
        status: "success",
        message: "User logged out successfully"
    });
}

export { register, login, logout, googleLogin };