export function analyzeTestCaseResults(executionResults, expectedOutputs) {
    let cumulativeTime = 0;
    let cumulativeMemory = 0;

    const results = executionResults.map((result, index) => {
        const time = Number(result.time?.trim()) || 0;
        const memory = Number(result.memory) || 0;
        cumulativeTime += time;
        cumulativeMemory += memory;

        const actualOutput = result.stdout?.trim();
        const expectedOutput = expectedOutputs[index]?.trim();

        return {
            testCase: index + 1,
            isPassed: actualOutput === expectedOutput,
            stdout: actualOutput,
            expected: expectedOutput,
            stderr: result.stderr || null,
            compileOutput: result.compile_output || null,
            status: result.status.description,
            memory: `${(memory / 1024).toFixed(2)}MB`,
            time: time ? `${Math.floor(time * 1000)}ms` : undefined,
        };
    });

    return { results, cumulativeTime, cumulativeMemory };
}
