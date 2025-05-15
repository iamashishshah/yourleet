import express from "express";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";
import {
    createProblem,
    deleteProblem,
    getAllProblems,
    getAllProblemsSolvedByUser,
    getProblemById,
    updateProblem,
} from "../controllers/problem.controller.js";

const problemRoutes = express.Router();

problemRoutes.post("/", authMiddleware, checkAdmin, createProblem);
problemRoutes.put("/:id", authMiddleware, checkAdmin, updateProblem);
problemRoutes.get("/:id", authMiddleware, getProblemById);
problemRoutes.delete("/:id", authMiddleware, checkAdmin, deleteProblem);
problemRoutes.get("/", authMiddleware, getAllProblems);
problemRoutes.get("/me/solved-problems", authMiddleware, getAllProblemsSolvedByUser);

problemRoutes.get("/test", (req, res) => {
    res.send("Problem router is working perfectly fine.");
});
export default problemRoutes;
