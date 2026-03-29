import jwt from "jsonwebtoken";

export const generateToken = (userId, res, role = null) => {
    const payload = { id: userId };
    if (role) payload.role = role;

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });

    if (res) {
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }

    return token;
}
