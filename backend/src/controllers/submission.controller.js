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
export const getSubmission = async (req, res) => {};
export const getSubmissionCountForProblem = async (req, res) => {};
