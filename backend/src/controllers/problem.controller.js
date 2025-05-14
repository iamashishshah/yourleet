import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResult, submitTestCases } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
    const {
        title,
        description,
        hints,
        tags,
        difficulty,
        examples,
        constraints,
        testcases,
        codesnippet,
        referenceSolutions,
    } = req.body;

    //TODO: check all above things if all are present or not?
    // if (
    //     !title ||
    //     !description ||
    //     !Array.isArray(examples) ||
    //     examples.length === 0 ||
    //     !Array.isArray(constraints) ||
    //     constraints.length === 0 ||
    //     !Array.isArray(testcases) ||
    //     testcases.length === 0 ||
    //     !codesnippet ||
    //     !referenceSolutions ||
    //     !difficulty
    // ) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Missing or invalid required fields in request body.",
    //     });
    // }

    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied — Admins only.",
        });
    }

    // get the language from the frontend
    try {
        // We'll collect all test results for all languages
        for (const [language, exampleCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                return res.status(400).json({
                    success: false,
                    message: `Unsupported language: ${language}`,
                });
            }

            const submissions = testcases.map(({ input, output }) => ({
                source_code: exampleCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            const submissionResult = await submitTestCases(submissions);

            const tokens = submissionResult.map((result) => result.token);
            // now we got the token of each submission, we need to verify if our code has executed or not
            const results = await pollBatchResult(tokens, 40, 1000);
            console.log("Result from db: ", results);
            const failedCaseIndex = results.findIndex((result) => result.status.id !== 3);

            if (failedCaseIndex !== -1) {
                return res.status(400).json({
                    success: false,
                    message: `Test case ${failedCaseIndex + 1} failed for ${language}.`,
                });
            }

            // for (let i = 0; i < results.length; i++) {
            //     const result = results[i];

            //     if (result.status.id !== 3) {
            //         return res.status(400).json({
            //             success: false,
            //             error: `Test case ${i + 1} failed for language ${language}`,
            //         });
            //     }
            // }
        }

        // ✅ Save to DB if all tests pass
        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                hints,
                tags,
                difficulty,
                examples,
                constraints,
                testcases,
                codesnippet,
                referenceSolutions,
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Problem created successfully.",
            problem: newProblem,
        });
    } catch (error) {
        console.error("createProblem error: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const updateProblem = async (req, res) => {
    console.log("Did i reach here");
    const {
        title,
        description,
        hints,
        tags,
        difficulty,
        examples,
        constraints,
        testcases,
        codesnippet,
        referenceSolutions,
    } = req.body;

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid required fields in request params.",
        });
    }

    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied — Admins only.",
        });
    }

    try {
        // try to find if the problem exist or not the will update
        const problem = await db.problem.findUnique({
            where: {
                id,
            },
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem does not found.",
            });
        }

        // We'll collect all test results for all languages
        for (const [language, exampleCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                return res.status(400).json({
                    success: false,
                    message: `Unsupported language: ${language}`,
                });
            }

            const submissions = testcases.map(({ input, output }) => ({
                source_code: exampleCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            const submissionResult = await submitTestCases(submissions);
            const tokens = submissionResult.map((result) => result.token);
            // now we got the token of each submission, we need to verify if our code has executed or not
            const results = await pollBatchResult(tokens, 40, 1000);
            console.log("Result from db: ", results);
            const failedCaseIndex = results.findIndex((result) => result.status.id !== 3);

            if (failedCaseIndex !== -1) {
                return res.status(400).json({
                    success: false,
                    message: `Test case ${failedCaseIndex + 1} failed for ${language}.`,
                });
            }

            // for (let i = 0; i < results.length; i++) {
            //     const result = results[i];

            //     if (result.status.id !== 3) {
            //         return res.status(400).json({
            //             success: false,
            //             error: `Test case ${i + 1} failed for language ${language}`,
            //         });
            //     }
            // }
        }

        // ✅ Save to DB if all tests pass
        const updatedProblem = await db.problem.update({
            where: {
                id,
            },
            data: {
                title,
                description,
                hints,
                tags,
                difficulty,
                examples,
                constraints,
                testcases,
                codesnippet,
                referenceSolutions,
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Problem updated successfully.",
            problem: updatedProblem,
        });
    } catch (error) {
        console.error("Error while updating problem: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const getProblemById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid required fields in request params.",
        });
    }

    try {
        const problem = await db.problem.findUnique({
            where: { id },
        });
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem does not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Problem fetched successfully.",
            problem,
        });
    } catch (error) {
        console.error("get problem by id error: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const deleteProblem = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid required fields in request params.",
        });
    }

    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied — Admins only.",
        });
    }

    try {
        const problem = await db.problem.findUnique({
            where: {
                id,
            },
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem does not exist.",
            });
        }

        const result = await db.problem.delete({
            where: { id },
        });

        console.log("What's prisma is returning after deletion: ", result);

        res.status(200).json({
            success: true,
            message: "Problem deleted successfully.",
            result,
        });
    } catch (error) {
        console.error("Error in deleting a problem: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


export const getAllProblems = async (req, res) => {
    // I need first user id, and find the user
    // validate the user if he's  admin or not
    // find all  data from database and remove everything
    // add all problems in an array and return to the user
    try {
        const problems = await db.problem.findMany({});
        if (!problems) {
            return res.status(404).json({
                success: false,
                error: "No problem is found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Problems fetched successfully.",
            problems,
        });
    } catch (error) {
        console.error("get All problems error: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// TODO: Implement public access to a user's solved problems by allowing requests using their username.
// Create a route in the format: yourleet.com/u/:username


/**
 * Retrieves all problems solved by a user.
 * 
 * If the user is authenticated (e.g., via cookie or token), their solved problems
 * are fetched using the authenticated user's information.
 * 
 * Alternatively, if this endpoint is intended for public access (e.g., to view another
 * user's solved problems), the username must be provided in the request parameters.
 * The solved problems will then be retrieved based on the provided username.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllProblmesSolvedByUser = async (req, res) => {
   
};
