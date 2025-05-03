import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const existingUser = await db.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ error: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.USER,
            },
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_TOKEN, {
            expiresIn: "1d",
        });

        res.cookie("jwt-token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "development",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageLink: user.image || null,
            },
        });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const login = async (req, res) => {
    //TODO: if you're already logged in then you can't
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const user = await db.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_TOKEN, {
            expiresIn: "7d",
        });

        res.cookie("jwt-token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return res.status(200).json({
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageLink: user.image || null,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

const logout = async (req, res) => {
    //TODO: if you're loggedout the can't acceess to me
    try {
        const token = req.cookies?.["jwt-token"];
        if (!token) {
            return res.status(400).json({
                message: "No active session found. User already logged out.",
                success: false,
            });
        }
        res.clearCookie("jwt-token", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json({
            message: "User logged out successfully.",
            success: true,
        });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
            error: "Internal server error during logout.",
            success: false,
        });
    }
};

const me = async (req, res) => {
    //TODO: if you're not signed in  or logged out then you can't access me
    try {
        return res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            user: req.user,
        });
    } catch (error) {
        console.error("Error checking user: ", error);
        res.status(500).json({
            success: false,
            message: "Error while checking user.",
        });
    }
};

export { register, login, logout, me };
