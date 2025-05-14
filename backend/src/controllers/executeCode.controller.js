import { pollBatchResult, submitTestCases } from "../libs/judge0.lib.js";

export const runCode = async (req, res) => {
    const { sourceCode, languageId, inputes, expectedOutputes, problemId } = req.body;
    const userId = req.user.id;

    if (!sourceCode || !languageId || !inputes || !expectedOutputes || !problemId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields.",
        });
    }

    if (!Array.isArray(inputes) || !Array.isArray(expectedOutputes)) {
        return res.status(400).json({
            success: false,
            message: "Inputes and expected outputs must be arrays.",
        });
    }

    if (inputes.length !== expectedOutputes.length) {
        return res.status(400).json({
            success: false,
            message: "Inputes and expected outputs count mismatch.",
        });
    }

    try {
        // Prepare submissions for Judge0
        const submissions = inputes.map((input) => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: input,
        }));

        const submissionResult = await submitTestCases(submissions);
        const tokens = submissionResult.map((result) => result.token);

        // Polling for results from Judge0
        const results = await pollBatchResult(tokens, 40, 1000);

        if (!results) {
            return res.status(400).json({
                success: false,
                message: "Error in compilation of code.",
            });
        }
        res.status(200).json({
            success: true,
            message: "Code compiled successfully.",
        });
        console.log("Result from judge0 after polling the batch: ", results);

        const failedCaseIndex = results.findIndex((results) => results.status.id !== 3);

        let finalVerdict = "Accepted";
        if (failedCaseIndex !== -1) {
            finalVerdict = "Wrong Answer";
        }

        res.status(200).json({
            success: true,
            message: "Code compiled successfully.",
            verdict: finalVerdict,
            caseResult: results,
        });
    } catch (error) {
        console.error("submit code error: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const submitCode = async (req, res) => {
    // 1. Validate request body ✅
    // 2. Match number of inputs and expected outputs  ✅
    // 3. Submit each input/output pair to Judge0
    // 4. Track pass/fail results per test case
    // 5. Determine overall verdict (Accepted / Wrong Answer)
    // 6. Store the submission record (status, time, memory, etc.)
    // 7. Store each test case result (stdout, stderr, status, etc.)
    // 8. If Accepted, mark as solved in ProblemSolved
    // 9. Return detailed verdict and case-wise output to frontend
};
