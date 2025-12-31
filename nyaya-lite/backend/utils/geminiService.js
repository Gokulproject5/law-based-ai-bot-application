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
        
        GOAL:
        1. If the user provides a legal situation, explain the law in SIMPLE, PLAIN ENGLISH.
        2. If the user is just saying hello, stating "I have a problem", or being vague, DO NOT give legal advice. Instead, respond with a helpful, guiding message like "Okay, tell me what happened. I’ll help you." or "I'm here to help. Could you describe your situation in more detail?"
        
        User Situation: "${query}"

        Context (Related Laws found locally): ${JSON.stringify(contextLaws.map(l => l.title))}

        Output must be strict JSON format with the following structure:
        {
            "summary": "A friendly greeting or a very simple explanation of the situation (1-2 sentences).",
            "simple_explanation": "If it's a greeting, explain how you can help. If it's a case, break it down simply.",
            "primary_offense": "The main legal issue (or 'Conversational' if no legal issue yet).",
            "risk_level": "Low/Medium/High/Emergency (or 'N/A' if just a greeting).",
            "steps": [
                { "title": "Immediate Action", "description": "What they should do now." }
            ],
            "relevant_laws": [
                { "name": "Section Name", "description": "Simple rule description." }
            ],
            "lawyer_type": "The type of lawyer they might need eventually."
        }
        
        CRITICAL: 
        1. If the user is vague, focus on a helpful, reassuring tone to get more details.
        2. Do not use markdown inside the JSON.
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
