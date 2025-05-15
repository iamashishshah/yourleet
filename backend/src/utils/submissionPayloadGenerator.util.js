export  function prepareSubmissionsPayload(sourceCode, languageId, testInputs) {
  return testInputs.map((input) => ({
    source_code: sourceCode,
    language_id: languageId,
    stdin: input,
  }));
}
