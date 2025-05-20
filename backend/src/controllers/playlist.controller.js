import { db } from "../libs/db.js";

export async function getAllPlaylists(req, res) {
    //TODO: test this controller
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is missing or invalid.",
        });
    }
    try {
        const playlists = await db.playlist.findMany({
            //[ [], []]
            where: { userId },
            include: {
                problems: {
                    problem: true,
                },
            },
        });

        if (playlists.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No playlists found for this user.",
                playlists: [],
            });
        }

        res.status(200).json({
            success: true,
            message: "All playlists created by the user.",
            playlists,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to fetch playlists for user ${userId}:`, error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
}

export async function getPlaylist(req, res) {
    const { playlistId } = req.params;

    if (!playlistId) {
        return res.status(400).json({
            success: false,
            message: "Playlist ID is missing or invalid.",
        });
    }

    try {
        const playlist = await db.playlist.findUnique({
            where: {
                playlistId,
            },
            include: {
                problems: {
                    include: {
                        problem: true,
                    },
                },
            },
        });

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist doesn't exist.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Playlist fetched successfully.",
            playlist,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to fetch playlist for user ${req.user.id}:`, error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
}

export async function createPlaylist(req, res) {}
export async function addProblemInPlaylist(req, res) {}
export async function deletePlaylist(req, res) {}
export async function deleteProblemFromPlaylist(req, res) {}
