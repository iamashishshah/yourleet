import axios from "axios";
import { JUDGE0_LANGUAGES } from "../constants/judge0Language.js";

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
        // console.log("data from judge0 is: ", data)
        if (!data || !Array.isArray(data)) {
            throw new Error("Invalid response format from Judge0 API.");
        }

        return data; // [{ token: "abc" }, { token: "def" }]
    } catch (error) {
        console.error("submitTestCases error:", error.message);
        throw new Error("Failed to submit test cases to Judge0.");
    }
};



const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Polls Judge0 until all submissions are complete.
 * @param {string[]} tokens - Array of submission tokens.
 * @param {number} [maxRetries=30] - Maximum number of polling attempts.
 * @param {number} [interval=1000] - Interval between polls (ms).
 * @returns {Promise<Array<Object>>} Final submission results.
 * @throws {Error} If polling exceeds retry limit or request fails.
 */
export const pollBatchResult = async (tokens, maxRetries = 30, interval = 1000) => {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const { data } = await axios.get(`${process.env.JUDGE0_API_URI}/submissions/batch`, {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false,
                },
            });
            
            const results = data.submissions;

            if (!Array.isArray(results)) {
                throw new Error("Invalid response from Judge0 API.");
            }

            const isAllDone = results.every((res) => res.status?.id > 2);

            if (isAllDone) return results;
            
            await sleep(interval);
            attempts++;
        } catch (error) {
            console.error("pollBatchResult error:", error.message);
            throw new Error("Failed to poll Judge0 for submission results.");
        }
    }

    throw new Error("Polling timed out. Submissions took too long to complete.");
};
