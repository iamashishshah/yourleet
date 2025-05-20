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
    //TODO: test this controller
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

export async function createPlaylist(req, res) {
    //TODO: test this controller
    const userId = req.user?.id;

    const { title, description = null } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title missing or invalid.",
        });
    }
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is missing or invalid.",
        });
    }

    try {
        const playlist = await db.playlist.create({
            data: {
                title,
                description,
                userId,
            },
        });

        // Log the playlist response after creation (keep it for debugging in development only)
        if (process.env.NODE_ENV !== "production") {
            console.log("Playlist created:", playlist);
        }

        // response after creating playlist
        console.log("Playlist response after creating:", playlist);
        res.status(201``).json({
            success: true,
            message: "Playlist created successfully.",
            playlist,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to create playlist for user ${req.user.id}:`, error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
}

export async function addProblemInPlaylist(req, res) {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || !problemIds.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing problems Id's",
        });
    }

    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated.",
        });
    }

    try {
        const problemAdded = await db.problemsInPlaylist.createMany({
            data: problemIds.map((problemId) => ({ problemId, playlistId })),
        });

        res.status(201).json({
            success: true,
            message: `${problemAdded.count} problem(s) added successfully.`,
            problemAdded,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to add problems for user ${userId}:`, error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
}

export async function deletePlaylist(req, res) {
    const { playlistId } = req.params;
    const userId = req.user?.id;

    if (!playlistId) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing playlist ID.",
        });
    }

    try {
        const playlist = await db.playlist.findUnique({
            where: { id: playlistId },
        });

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found.",
            });
        }

        if (playlist.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to delete this playlist.",
            });
        }

        const deletedPlaylist = await db.playlist.delete({
            where: { id: playlistId },
        });

        res.status(200).json({
            success: true,
            message: "Playlist deleted successfully.",
            deletedPlaylist,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to delete playlist for user ${userId}:`, error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
}

export async function deleteProblemFromPlaylist(req, res) {
    const { playlistId } = req.params;
    const { problemIds } = req.body;
    const userId = req.user?.id; 

    if (!playlistId || typeof playlistId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing playlist ID.",
        });
    }

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing problem IDs.",
        });
    }

    try {
        
        const playlist = await db.playlist.findUnique({
            where: { id: playlistId },
        });

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found.",
            });
        }

        if (playlist.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to modify this playlist.",
            });
        }

        
        const deletedProblems = await db.problemsInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds,
                },
            },
        });

        if (deletedProblems.count === 0) {
            return res.status(400).json({
                success: false,
                message: "No matching problems found to delete.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Problems removed from playlist successfully.",
            deletedCount: deletedProblems.count,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to delete problems from playlist ${playlistId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
}
