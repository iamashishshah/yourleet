import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.["jwt-token"];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized — no token provided.",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized — invalid or expired token.",
            });
        }
        // console.log("Decoded data: ", decoded)
        const user = await db.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                image: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is missing from the request.",
            });
        }
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                role: true,
            },
        });

        if (!user || user.role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Access denied — Admins only.",
            });
        }

        next();
    } catch (error) {
        console.error("checkAdmin middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export { authMiddleware, checkAdmin };
