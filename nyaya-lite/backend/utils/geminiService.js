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
        You are 'Nyaya Lite', a highly capable and empathetic AI Legal Assistant powered by Google Gemini. 
        
        YOUR MISSION:
        Provide a comprehensive 'Legal Guide' response that is both informative and actionable. 
        
        LANGUAGE REQUIREMENT:
        - Detect the user's language (English, Hindi, or Tamil).
        - Respond in the SAME language as the user query.
        
        RESPONSE STRUCTURE:
        1. **Greeting & Summary**: A warm greeting and a concise summary of the situation.
        2. **Detailed Legal Analysis**: A thorough explanation of relevant laws, rights, and potential legal implications. Use rich Markdown (bold, headers).
        3. **Step-by-Step Action Plan**: A clear, numbered list of actions the user should take immediately. Each step must have a title and a detailed description.
        4. **Professional Disclaimer**: A standard AI legal disclaimer.

        User Situation: "${query}"

        Context (Related Laws found locally): ${JSON.stringify(contextLaws.map(l => ({ title: l.title, description: l.description })))}

        Output must be strict JSON:
        {
            "summary": "Concise situation overview in user's language.",
            "detailed_analysis": "Multi-paragraph rich Markdown text explaining the legal perspective in user's language.",
            "primary_offense": "Category name or 'Conversational'.",
            "risk_level": "Low/Medium/High/Emergency/N/A",
            "steps": [
                { "title": "Step 1: [Action]", "description": "Detailed explanation of what to do." },
                { "title": "Step 2: [Action]", "description": "..." }
            ],
            "relevant_laws": [
                { "name": "BNS Section X / IPC Section Y", "description": "How it applies." }
            ],
            "lawyer_type": "Specialization recommended."
        }
        
        CRITICAL: 
        - Ensure the 'detailed_analysis' is informative text.
        - Ensure the 'steps' provide a literal guide for the user.
        - Return ONLY raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        let jsonStr = text;
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = text.substring(firstBrace, lastBrace + 1);
        }

        console.log("Gemini AI Response Received.");

        const parsedData = JSON.parse(jsonStr);
        return {
            ...parsedData,
            source: 'Gemini AI'
        };

    } catch (error) {
        console.error("Gemini AI Analysis failed:", error.message);
        return null;
    }
}

module.exports = { generateLegalAnalysis };
