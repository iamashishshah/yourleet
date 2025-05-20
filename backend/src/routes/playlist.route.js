import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    addProblemInPlaylist,
    createPlaylist,
    deletePlaylist,
    deleteProblemFromPlaylist,
    getAllPlaylists,
    getPlaylist,
} from "../controllers/playlist.controller.js";



const playlistRoutes = express.Router();

playlistRoutes.get("/", authMiddleware, getAllPlaylists);
playlistRoutes.get("/:playlistId", authMiddleware, getPlaylist);
playlistRoutes.post("/", authMiddleware, createPlaylist);
playlistRoutes.post("/:playlistId/problem", authMiddleware, addProblemInPlaylist);
playlistRoutes.delete("/:playlistId", authMiddleware, deletePlaylist);
playlistRoutes.delete("/:playlistId/problem", authMiddleware, deleteProblemFromPlaylist);

export default playlistRoutes;
