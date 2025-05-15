import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResult, submitTestCases } from "../libs/judge0.lib.js";
import { saveSubmissionToDb } from "../libs/saveSubmissionToDb.lib.js";
import { analyzeTestCaseResults } from "../utils/analyzeTestCaseResult.util.js";
import { prepareSubmissionsPayload } from "../utils/submissionPayloadGenerator.util.js";
import { validateRequestBody } from "../utils/validateRequestBody.util.js";

export const submitCode = async (req, res) => {
  const error = validateRequestBody(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  const { sourceCode, languageId, testInputs, expectedOutputs, problemId } = req.body;
  const userId = req.user.id;

  try {
    const submissionsPayload = prepareSubmissionsPayload(sourceCode, languageId, testInputs);
    const submissionResponses = await submitTestCases(submissionsPayload);

    const tokens = submissionResponses.map(r => r.token);
    const executionResults = await pollBatchResult(tokens, 40, 1000);

    if (!executionResults) {
      return res.status(400).json({
        success: false,
        message: "Error during code compilation or execution.",
      });
    }

    const { results, cumulativeTime, cumulativeMemory } = analyzeTestCaseResults(executionResults, expectedOutputs);
    const language = getLanguageName(languageId);

    const submission = await saveSubmissionToDb({
      userId,
      problemId,
      sourceCode,
      language,
      testInputs,
      results,
      cumulativeMemory,
      cumulativeTime,
    });

    const failedIndex = results.findIndex(r => !r.isPassed);

    if (failedIndex !== -1) {
      return res.status(401).json({
        success: false,
        compilationMessage: "Code compiled successfully.",
        message: `Wrong answer on test case ${failedIndex + 1}.`,
        verdict: "Wrong Answer",
        caseResult: results,
      });
    }

    await db.problemSolved.upsert({
      where: { userId_problemId: { problemId, userId } },
      update: {},
      create: { userId, problemId },
    });

    const fullSubmission = await db.submission.findUnique({
      where: { id: submission.id },
      include: { testCases: true },
    });

    return res.status(200).json({
      success: true,
      compilationMessage: "Code compiled successfully.",
      message: "All test cases passed.",
      verdict: "Accepted",
      timeTaken: `${Math.floor(cumulativeTime * 1000)}ms`,
      memoryUsed: `${(cumulativeMemory / 1024).toFixed(2)}MB`,
      caseResult: fullSubmission,
    });

  } catch (err) {
    console.error("Error while submitting code:", err);
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
