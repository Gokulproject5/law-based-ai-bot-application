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
        You are 'Nyaya', a friendly and expert Indian Legal Assistant. 
        Your goal is to explain the law in SIMPLE, PLAIN ENGLISH that a 12-year-old could understand. 
        Avoid heavy legal jargon unless necessary, and if used, explain it immediately.

        User Situation: "${query}"

        Context (Related Laws found locally): ${JSON.stringify(contextLaws.map(l => l.title))}

        Output must be strict JSON format with the following structure:
        {
            "summary": "A very simple, compassionate explanation of what is happening (1-2 sentences).",
            "simple_explanation": "Break down the legal situation in easy-to-understand terms. Explain the user's rights clearly.",
            "primary_offense": "The main legal issue in plain words.",
            "risk_level": "Low/Medium/High/Emergency",
            "steps": [
                { "title": "Immediate Action", "description": "What is the very first thing they should do? (Simple and clear)." },
                { "title": "Next Step", "description": "The logical following action." },
                { "title": "Safety/Precaution", "description": "A tip to stay safe or protect their rights." }
            ],
            "relevant_laws": [
                { "name": "Section Name", "description": "Describe this law like a story or simple rule." }
            ],
            "lawyer_type": "The type of lawyer they should seek."
        }
        
        CRITICAL: 
        1. Focus on 'How to handle the situation' effectively.
        2. Use a helpful, reassuring tone.
        3. Do not use markdown inside the JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        console.log("Raw AI Response:", text);

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini AI Analysis failed with ERROR:", error.message);
        if (error.response) console.error("Error Response:", error.response.data);
        return null; // Fallback
    }
}

module.exports = { generateLegalAnalysis };
