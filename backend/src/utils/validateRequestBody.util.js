export function validateRequestBody(body) {
    const { sourceCode, languageId, testInputs, expectedOutputs, problemId } = body;

    if (!sourceCode || !languageId || !testInputs || !expectedOutputs || !problemId) {
        return "Missing required fields.";
    }

    if (!Array.isArray(testInputs) || !Array.isArray(expectedOutputs)) {
        return "Test inputs and expected outputs must be arrays.";
    }

    if (testInputs.length !== expectedOutputs.length) {
        return "Mismatch between number of test inputs and expected outputs.";
    }

    return null;
}
