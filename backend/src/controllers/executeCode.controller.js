import { pollBatchResult, submitTestCases } from "../libs/judge0.lib.js";

export const runCode = async (req, res) => {
    const {
        sourceCode,
        languageId,
        inputes: testInputs,
        expectedOutputes: expectedOutputs,
        problemId,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!sourceCode || !languageId || !testInputs || !expectedOutputs || !problemId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields.",
        });
    }

    if (!Array.isArray(testInputs) || !Array.isArray(expectedOutputs)) {
        return res.status(400).json({
            success: false,
            message: "Test inputs and expected outputs must be arrays.",
        });
    }

    if (testInputs.length !== expectedOutputs.length) {
        return res.status(400).json({
            success: false,
            message: "Mismatch between number of test inputs and expected outputs.",
        });
    }

    try {
        // Prepare submissions for Judge0
        const submissionsPayload = testInputs.map((input) => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: input,
        }));

        const submissionResponses = await submitTestCases(submissionsPayload);
        const submissionTokens = submissionResponses.map((response) => response.token);

        // Polling for Judge0 execution results
        const executionResults = await pollBatchResult(submissionTokens, 40, 1000);

        if (!executionResults) {
            return res.status(400).json({
                success: false,
                message: "Error during code compilation or execution.",
            });
        }

        const firstFailureIndex = executionResults.findIndex(
            (result) => result.status.id !== 3
        );

        let verdict = "Accepted";
        if (firstFailureIndex !== -1) {
            verdict = "Wrong Answer";
        }

        // Analyze test case results
        let cumulativeTime = 0;
        let cumulativeMemory = 0;

        const testCaseResults = executionResults.map((result, index) => {
            cumulativeTime += Number(result.time?.trim()) || 0;
            cumulativeMemory += Number(result.memory) || 0;

            const actualOutput = result.stdout?.trim();
            const expectedOutput = expectedOutputs[index]?.trim();

            return actualOutput === expectedOutput;
        });

        const failedTestIndex = testCaseResults.findIndex((passed) => !passed);

        if (failedTestIndex !== -1) {
            return res.status(401).json({
                success: false,
                compilationMessage: "Code compiled successfully.",
                message: `Wrong answer on test case ${failedTestIndex + 1}.`,
                verdict,
                caseResult: testCaseResults,
            });
        }

        return res.status(200).json({
            success: true,
            compilationMessage: "Code compiled successfully.",
            message: "All test cases passed.",
            verdict,
            timeTaken: `${Math.floor(cumulativeTime * 1000)}ms`,
            memoryUsed: `${(cumulativeMemory / 1024).toFixed(2)}MB`,
            caseResult: testCaseResults,
        });
    } catch (error) {
        console.error("Error while submitting code:", error);
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
