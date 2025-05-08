import axios from "axios";
import { JUDGE0_LANGUAGES } from "../constants/judge0Language";

export const getJudge0LanguageId = (language) => {
    if (!language) return null;

    const langId = JUDGE0_LANGUAGES[language.toUpperCase()];

    if (!langId) {
        console.warn(`Unsupported language: ${language}`);
        return null;
    }

    return langId;
};

/**
 * Submits a batch of test cases to the Judge0 API.
 * @param {Array<Object>} submissions - Array of submission objects for Judge0.
 * @returns {Array<Object>} Array of submission results containing tokens.
 * @throws {Error} If the API request fails or response is malformed.
 */
export const submitTestCases = async (submissions) => {
    try {
        const response = await axios.post(
            `${process.env.JUDGE0_API_URI}/submissions/batch?base64_encoded=false`,
            { submissions }, // Judge0 expects `{ submissions: [...] }`
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        const { data } = response;

        if (!data || !Array.isArray(data.submissions)) {
            throw new Error("Invalid response format from Judge0 API.");
        }

        return data.submissions; // [{ token: "abc" }, { token: "def" }]
    } catch (error) {
        console.error("submitTestCases error:", error.message);
        throw new Error("Failed to submit test cases to Judge0.");
    }
};
