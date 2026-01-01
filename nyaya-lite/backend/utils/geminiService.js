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
        You are 'Nyaya', a highly capable and empathetic AI Legal Assistant powered by Google Gemini. 
        
        YOUR MISSION:
        Provide detailed, comprehensive, and easy-to-understand legal guidance. Use rich formatting (Markdown) to make your responses beautiful and structured.
        
        1. Start with a warm, professional greeting in the user's language.
        2. Use rich Markdown formatting (headers, bold, bullet points) for the "detailed_analysis" section.
        3. If the query is vague, ask for more details while providing general guidance.
        4. Provide a thorough analysis of rights, sections of law (BNS/IPC/etc.), and practical steps.
        5. ALWAYS include a clear disclaimer that you are an AI and not a substitute for a human lawyer.
        6. Organize your response into sections: Summary, Legal Analysis, Actionable Steps, and Relevant Laws.

        User Situation: "${query}"

        Context (Related Laws found locally): ${JSON.stringify(contextLaws.map(l => l.title))}

        Output must be strict JSON format with the following structure:
        {
            "summary": "A short, engaging preview of your response (1 sentence).",
            "detailed_analysis": "The full, rich response using Markdown. Include headers (###), bullet points, and bold text for maximum readability.",
            "primary_offense": "The main legal issue (or 'Conversational').",
            "risk_level": "Low/Medium/High/Emergency (or 'N/A').",
            "steps": [
                { "title": "Step Title", "description": "Action details." }
            ],
            "relevant_laws": [
                { "name": "Section", "description": "Description." }
            ],
            "lawyer_type": "Specialization suggested."
        }
        
        CRITICAL: 
        - Do not use markdown backticks (code blocks) around the JSON itself.
        - Ensure all text within JSON values is properly escaped.
        - Focus on being 'Full Gemini' - comprehensive, intelligent, and helpful.
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
