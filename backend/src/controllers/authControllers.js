import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

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

export { register, login, logout };    