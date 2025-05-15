import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResult, submitTestCases } from "../libs/judge0.lib.js";

export const submitCode = async (req, res) => {
    const { sourceCode, languageId, testInputs, expectedOutputs, problemId } = req.body;

    const userId = req.user.id;

    // console.log("How test inputs look like: ",testInputs)
    // const arr = testInputs.join(" ")
    // console.log("test inputs after joining it: ", arr)

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
        
        if (!Array.isArray(submissionResponses) || submissionResponses.length === 0) {
            throw new Error("Failed to get valid submission tokens from Judge0");
        }

        const submissionTokens = submissionResponses.map((response) => response.token);

        // Polling for Judge0 execution results
        const executionResults = await pollBatchResult(submissionTokens, 40, 1000);

        if (!executionResults) {
            return res.status(400).json({
                success: false,
                message: "Error during code compilation or execution.",
            });
        }

        const firstFailureIndex = executionResults.findIndex((result) => result.status.id !== 3);

        let verdict = "Accepted";
        if (firstFailureIndex !== -1) {
            verdict = "Wrong Answer";
        }

        // Analyze test case results
        let cumulativeTime = 0;
        let cumulativeMemory = 0;

        const resultsPerTestCase = executionResults.map((result, index) => {
            cumulativeTime += Number(result.time?.trim()) || 0;
            cumulativeMemory += Number(result.memory) || 0;

            const actualOutput = result.stdout?.trim();
            const expectedOutput = expectedOutputs[index]?.trim();

            return {
                testCase: index + 1,
                isPassed: expectedOutput === actualOutput,
                stdout: actualOutput,
                expected: expectedOutput,
                stderr: result.stderr || null,
                compileOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${(result.memory / 1024).toFixed(2)}MB` : "0.00MB",
                time: result.time ? `${Math.floor(result.time * 1000)}ms` : undefined,
            };
        });

        const language = getLanguageName(languageId);

        const stdout = JSON.stringify(resultsPerTestCase.map((result) => result.stdout));

        const stderr = resultsPerTestCase.some((result) => result.stderr)
            ? JSON.stringify(resultsPerTestCase.map((result) => result.stderr))
            : null;

        const compileOutput = resultsPerTestCase.some((result) => result.compileOutput)
            ? JSON.stringify(resultsPerTestCase.map((result) => result.compileOutput))
            : null;

        const isAllPassed = resultsPerTestCase.every((result) => result.isPassed);
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode,
                language,
                stdin: testInputs.join("\n"),
                stdout,
                stderr,
                compileOutput,
                status: isAllPassed ? "Accepted" : "Wrong answer",
                memory: `${(cumulativeMemory / 1024).toFixed(2)}MB`,
                time: `${Math.floor(cumulativeTime * 1000)}ms`,
            },
        });

        // if all test cases have passed then mark it as "Completed" for the user

        const failedTestIndex = resultsPerTestCase.findIndex((passed) => !passed.isPassed);

        if (failedTestIndex !== -1) {
            return res.status(401).json({
                success: false,
                compilationMessage: "Code compiled successfully.",
                message: `Wrong answer on test case ${failedTestIndex + 1}.`,
                verdict,
                caseResult: resultsPerTestCase,
            });
        }
        await db.problemSolved.upsert({
            where: {
                userId_problemId: {
                    problemId,
                    userId,
                },
            },
            update: {},
            create: {
                userId,
                problemId,
            },
        });

        const testCaseResults = resultsPerTestCase.map((res) => ({
            submissionId: submission.id,
            testCase: res.testCase,
            isPassed: res.isPassed,
            stdout: res.stdout,
            expected: res.expected,
            stderr: res.stderr,
            compileOutput: res.compileOutput,
            status: res.status,
            memory: res.memory,
            time: res.time,
        }));

        await db.testCaseResult.createMany({
            data: testCaseResults,
        });

        const submissionDataWithTestcase = await db.submission.findUnique({
            where: {
                id: submission.id,
            },
            include: { testCases: true },
        });

        //TODO: implement language specific code fetching mechanism where you've already done in an specific language
        return res.status(200).json({
            success: true,
            compilationMessage: "Code compiled successfully.",
            message: "All test cases passed.",
            verdict,
            timeTaken: `${Math.floor(cumulativeTime * 1000)}ms`,
            memoryUsed: `${(cumulativeMemory / 1024).toFixed(2)}MB`,
            caseResult: submissionDataWithTestcase,
        });
    } catch (error) {
        console.error("Error while submitting code:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};



export const runCode = async (req, res) => {
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
