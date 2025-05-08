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
