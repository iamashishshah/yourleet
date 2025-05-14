import { authMiddleware } from "../middlewares/auth.middleware.js"
import express from "express"
import { runCode, submitCode } from "../controllers/executeCode.controller.js"
const codeExecutionRoutes = express.Router()

codeExecutionRoutes.post("/run", authMiddleware, runCode)
codeExecutionRoutes.post("/submit", authMiddleware, submitCode)

export default codeExecutionRoutes