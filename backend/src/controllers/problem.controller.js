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
            console.log("Result from db: ", results)
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

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblmesSolvedByUser = async (req, res) => {};
