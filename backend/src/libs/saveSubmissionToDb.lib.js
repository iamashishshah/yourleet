export async function saveSubmissionToDb({
    userId,
    problemId,
    sourceCode,
    language,
    testInputs,
    results,
    cumulativeMemory,
    cumulativeTime,
}) {
    const stdout = JSON.stringify(results.map((r) => r.stdout));
    const stderr = results.some((r) => r.stderr)
        ? JSON.stringify(results.map((r) => r.stderr))
        : null;
    const compileOutput = results.some((r) => r.compileOutput)
        ? JSON.stringify(results.map((r) => r.compileOutput))
        : null;

    const status = results.every((r) => r.isPassed) ? "Accepted" : "Wrong Answer";

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
            status,
            memory: `${(cumulativeMemory / 1024).toFixed(2)}MB`,
            time: `${Math.floor(cumulativeTime * 1000)}ms`,
        },
    });

    const testCaseResults = results.map((r) => ({
        submissionId: submission.id,
        testCase: r.testCase,
        isPassed: r.isPassed,
        stdout: r.stdout,
        expected: r.expected,
        stderr: r.stderr,
        compileOutput: r.compileOutput,
        status: r.status,
        memory: r.memory,
        time: r.time,
    }));

    await db.testCaseResult.createMany({ data: testCaseResults });

    return submission;
}
