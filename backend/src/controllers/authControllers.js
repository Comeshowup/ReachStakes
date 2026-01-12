import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
    const { email, password, role, handle } = req.body;
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
                    role: role
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
                        verificationTier: 'None'
                    }
                });
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
        }
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
        });

        if (!user) {
            // Create new user if they don't exist
            // Defaulting role to "brand" if not provided, though typically role should be selected on frontend
            const userRole = role || "brand";

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    role: userRole,
                    // passwordHash is optional for Google users
                },
            });
        }

        // Generate JWT token for session management
        const token = generateToken(user.id, res);

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