import { db } from "../libs/db.js";

export const getAllSubmissions = async (req, res) => {
    const userId = req.user.id;

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    try {
        const submissions = await db.submission.findMany({
            where: { userId },
            skip: Number(skip),
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                problemId: true,
                language: true,
                status: true,
                time: true,
                memory: true,
                createdAt: true,
                sourceCode: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "List of submissions.",
            page: Number(page),
            limit: Number(limit),
            submissions,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to fetch submissions for user ${userId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve submissions at the moment. Please try again later.",
        });
    }
};

export const getSubmissions = async (req, res) => {
    // get the all submissions that a user has submitted for a problem
    const userId = req.user.id;
    const problemId = req.params?.problemId;

    if (!problemId) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid problem ID.",
        });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    try {
        const submissions = await db.submission.findMany({
            where: { userId, problemId },
            orderBy: { createdAt: "desc" },
            take: Number(limit),
            skip: Number(skip),
            select: {
                id: true,
                language: true,
                status: true,
                time: true,
                memory: true,
                createdAt: true,
                sourceCode: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "All submissions for the given problem.",
            page: Number(page),
            limit: Number(limit),
            submissions,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to fetch submissions for problem ${problemId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve submissions at the moment. Please try again later.",
        });
    }
};

export const getProblemSubmissionsCount = async (req, res) => {
    const problemId = req.params?.problemId;

    if (!problemId) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid problem ID.",
        });
    }

    try {
        const count = await db.submission.count({
            where: { problemId },
        });
        res.status(200).json({
            success: true,
            message: "Submission count retrieved successfully.",
            count,
        });
    } catch (error) {
       console.error(`[ERROR] Failed to fetch submission count for problem ${problemId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve submissions count at the moment. Please try again later.",
        });
    }
};
