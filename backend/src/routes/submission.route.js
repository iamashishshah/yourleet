import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAllSubmissions, getProblemSubmissionsCount, getSubmissions } from "../controllers/submission.controller.js";

const submissionRoutes = express.Router();
submissionRoutes.get("/", authMiddleware, getAllSubmissions);
submissionRoutes.get("/problem/:problemId", authMiddleware ,getSubmissions)
submissionRoutes.get("/problem/:problemId/count", authMiddleware, getProblemSubmissionsCount)

export default submissionRoutes;
