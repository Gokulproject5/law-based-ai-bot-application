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
        
        RESPONSE GUIDELINES:
        1. Start with a warm, professional greeting.
        2. Use Markdown (bold, lists, headers) to structure your advice.
        3. If the user query is vague (e.g., "I have a problem"), be conversational and ask for more details while promising help.
        4. For specific cases, provide a thorough analysis of rights, potential charges, and resolutions.
        5. NEVER give definitive legal advice; always include a professional disclaimer that you are an AI assistant.

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
