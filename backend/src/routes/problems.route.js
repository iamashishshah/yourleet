import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createProblem, deleteProblem, getAllProblems, getAllProblmesSolvedByUser, getProblemById, updateProblem } from "../controllers/problem.controller.js";

const problemRoutes = express.Router();

problemRoutes.get("/", authMiddleware, getAllProblems);
problemRoutes.post("/", authMiddleware, createProblem);
problemRoutes.get("/:id", authMiddleware, getProblemById);
problemRoutes.put("/:id", authMiddleware, updateProblem);
problemRoutes.delete("/:id", authMiddleware, deleteProblem);
problemRoutes.get("/me/solved-problems", authMiddleware, getAllProblmesSolvedByUser);

problemRoutes.get("/test", (req, res) => {
    res.send("Problem router is working perfectly fine.");
});
export default problemRoutes;
