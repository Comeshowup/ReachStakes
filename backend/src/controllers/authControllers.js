import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

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

    //create user
    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
            passwordHash: hashedPassword,
            role: role
        }
    });

    //generate token
    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",
        data: {
            user,
            token: generateToken(user.id)
        }
    });
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
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const { email, name, sub: googleId } = googleResponse.data;

        // RESTRICTION: Only allow specific test email
        if (email !== "comeshowup@gmail.com" && email !== "bytecraft77@gmail.com") {
            return res.status(403).json({
                status: "error",
                message: "Access restricted. Only authorized test users can login via Google at this time."
            });
        }

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Create new user
            const userRole = role || "brand";

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    role: userRole,
                    // passwordHash is optional
                },
            });
        }

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
        res.status(400).json({
            status: "error",
            message: "Google authentication failed",
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