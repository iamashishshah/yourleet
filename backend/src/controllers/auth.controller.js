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
            secure: process.env.NODE_ENV === "production",
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

const login = async (req, res) => {};

const logout = async (req, res) => {};

const me = async (req, res) => {};

export { register, login, logout, me };
