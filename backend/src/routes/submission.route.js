import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAllSubmissions, getSubmission, getSubmissionCountForProblem } from "../controllers/submission.controller.js";

const submissionRoutes = express.Router();
submissionRoutes.get("/", authMiddleware, getAllSubmissions);
submissionRoutes.get("/problem/:problemId", authMiddleware ,getSubmission)
submissionRoutes.get("/problem/:problemId/count", authMiddleware, getSubmissionCountForProblem)

export default submissionRoutes;
