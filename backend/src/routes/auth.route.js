import express from "express"
import { login, logout, me, register } from "../controllers/auth.controller.js"

const authRoutes = express.Router()

authRoutes.post("/register", register)
authRoutes.post("/login", login)
authRoutes.post("/logout", logout)
authRoutes.get("/me", me)

export default authRoutes