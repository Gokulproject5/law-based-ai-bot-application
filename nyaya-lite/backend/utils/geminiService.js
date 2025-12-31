const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate legal analysis using Gemini AI
 * @param {string} query - The user's legal question
 * @param {Array} contextLaws - Optional: closely related laws from local DB to use as context
 * @returns {Promise<Object>} - Structured analysis
 */
async function generateLegalAnalysis(query, contextLaws = []) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Using rule-based fallback.");
            return null; // Triggers fallback to local logic
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are an advanced Indian Legal Assistant named 'Nyaya'.
        Your task is to analyze the following user situation and provide actionable legal advice based on Indian Law (IPC, CrPC, etc.).

        User Situation: "${query}"

        Context (Related Laws found locally): ${JSON.stringify(contextLaws.map(l => l.title))}

        Output must be strict JSON format with the following structure:
        {
            "summary": "Brief summary of the legal situation (2-3 sentences).",
            "primary_offense": "The main legal offense or issue (e.g., 'Criminal Breach of Trust', 'Consumer Rights Violation').",
            "risk_level": "Low/Medium/High/Emergency",
            "steps": [
                { "title": "Step 1 Title", "description": "Detailed action to take." },
                { "title": "Step 2 Title", "description": "Detailed action to take." }
            ],
            "relevant_laws": [
                { "name": "Section Name", "description": "Brief explanation of how it applies." }
            ],
            "lawyer_type": "The type of lawyer they should seek (e.g., 'Family Lawyer', 'Criminal Defense Lawyer')."
        }
        
        Do not use markdown in the JSON keys/values. Keep it valid JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini AI Analysis failed:", error);
        return null; // Fallback
    }
}

module.exports = { generateLegalAnalysis };
