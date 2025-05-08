import express from "express";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";
import {
    createProblem,
    deleteProblem,
    getAllProblems,
    getAllProblmesSolvedByUser,
    getProblemById,
    updateProblem,
} from "../controllers/problem.controller.js";

const problemRoutes = express.Router();

problemRoutes.get("/", authMiddleware, getAllProblems);
problemRoutes.post("/", authMiddleware, checkAdmin, createProblem);
problemRoutes.get("/:id", authMiddleware, getProblemById);
problemRoutes.put("/:id", authMiddleware, checkAdmin, updateProblem);
problemRoutes.delete("/:id", authMiddleware, checkAdmin, deleteProblem);
problemRoutes.get("/me/solved-problems", authMiddleware, getAllProblmesSolvedByUser);

problemRoutes.get("/test", (req, res) => {
    res.send("Problem router is working perfectly fine.");
});
export default problemRoutes;
