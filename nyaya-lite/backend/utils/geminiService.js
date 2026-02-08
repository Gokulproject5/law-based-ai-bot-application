const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Enhanced Legal Analysis with Conversation Context
 * @param {string} query - The user's legal question
 * @param {Array} contextLaws - Optional: closely related laws from local DB
 * @param {Object} conversationContext - Previous conversation context
 * @returns {Promise<Object>} - Structured analysis
 */
async function generateLegalAnalysis(query, contextLaws = [], conversationContext = null) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Using rule-based fallback.");
            return null;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        });

        // Build conversation history for context
        let conversationHistoryText = "";
        if (conversationContext && conversationContext.conversationHistory && conversationContext.conversationHistory.length > 0) {
            conversationHistoryText = "\n\nPREVIOUS CONVERSATION:\n" +
                conversationContext.conversationHistory.map(msg =>
                    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
                ).join('\n');
        }

        // Detect emotional state and adapt tone
        const emotionalState = conversationContext?.context?.emotionalState || 'neutral';
        let toneGuidance = "";

        switch (emotionalState) {
            case 'distressed':
                toneGuidance = "The user seems distressed or in an urgent situation. Be extra empathetic, reassuring, and prioritize immediate safety steps.";
                break;
            case 'frustrated':
                toneGuidance = "The user appears frustrated. Be patient, validating, and provide clear, actionable guidance.";
                break;
            case 'confused':
                toneGuidance = "The user seems confused. Use simple language, break down complex concepts, and provide examples.";
                break;
            case 'grateful':
                toneGuidance = "The user is appreciative. Maintain a warm, helpful tone and offer additional assistance.";
                break;
            default:
                toneGuidance = "Maintain a professional yet friendly and empathetic tone.";
        }

        // Check if this is a follow-up question
        const isFollowUp = conversationContext?.conversationHistory?.length > 0;
        const followUpGuidance = isFollowUp
            ? "This is a follow-up question. Reference the previous conversation and build upon it. Maintain continuity and context."
            : "This is a new conversation. Provide a comprehensive initial response.";

        // Enhanced prompt with personality and context
        const prompt = `
You are **Nyaya Lite AI**, an advanced legal assistant powered by Google Gemini. You combine deep legal knowledge with empathy and clarity.

🎯 YOUR CORE IDENTITY:
- Expert in Indian law (IPC, BNS, CrPC, Civil laws)
- Empathetic and patient communicator
- Focused on practical, actionable guidance
- Culturally sensitive to Indian context
- Multi-lingual (English, Hindi, Tamil, Telugu, Malayalam, Kannada)

📋 CURRENT SITUATION:
${toneGuidance}
${followUpGuidance}

${conversationHistoryText}

🔍 USER'S CURRENT QUERY:
"${query}"

📚 RELEVANT LEGAL CONTEXT (from database):
${JSON.stringify(contextLaws.slice(0, 5).map(l => ({
            title: l.title,
            category: l.category,
            ipc_sections: l.ipc_sections,
            description: l.description
        })), null, 2)}

🎨 RESPONSE REQUIREMENTS:

1. **Language Detection**: Detect and respond in the user's language (auto-detect from query)

2. **Empathetic Opening**: Start with a brief, warm acknowledgment of their situation

3. **Comprehensive Analysis**: Provide detailed legal analysis using:
   - Clear headings (###)
   - **Bold** for key terms
   - Bullet points for lists
   - Real-world examples when helpful
   - Relevant IPC/BNS sections with explanations

4. **Actionable Steps**: Provide 3-7 specific, numbered action steps with:
   - Clear title for each step
   - Detailed description (2-3 sentences)
   - Priority indicators (if urgent)
   - Timeline guidance (when applicable)

5. **Context Awareness**: 
   - Reference previous messages if this is a follow-up
   - Build upon earlier advice
   - Address new aspects of the situation

6. **Confidence & Limitations**:
   - Be clear about what you know vs. what requires a lawyer
   - Provide confidence levels for recommendations
   - Always include professional consultation disclaimer

📤 OUTPUT FORMAT (Strict JSON):
{
    "summary": "One-sentence situation summary in user's language",
    "detailed_analysis": "Rich Markdown text (3-5 paragraphs) with legal analysis. Use ### for headings, **bold** for emphasis, and bullet points. Include relevant sections and their explanations.",
    "primary_offense": "Main legal category (e.g., 'Theft', 'Harassment', 'Property Dispute', 'General Query')",
    "risk_level": "Low | Medium | High | Emergency | N/A",
    "confidence_score": 0.85,
    "steps": [
        {
            "title": "Immediate Action: [What to do]",
            "description": "Detailed 2-3 sentence explanation with specific guidance",
            "priority": "high | medium | low",
            "timeline": "Immediately | Within 24 hours | Within 7 days | etc."
        }
    ],
    "relevant_laws": [
        {
            "title": "Law Title/Offense (e.g. Theft under IPC)",
            "ipc_sections": ["IPC Section XXX", "BNS Section YYY"],
            "description": " Detailed legal explanation of how this section applies to the specific situation.",
            "penalty": "Imprisonment for X years, or fine, or both.",
            "severity": "Low | Medium | High | Emergency",
            "offense_nature": "Cognizable | Non-Cognizable",
            "bail_status": "Bailable | Non-Bailable",
            "court_jurisdiction": "Triable by Magistrate of First Class | Sessions Court | etc.",
            "steps": ["Step 1 specific to this law", "Step 2"],
            "evidence_required": ["Evidence Item 1", "Evidence Item 2"]
        }
    ],
    "lawyer_type": "Recommended specialization (e.g., 'Criminal Defense Lawyer', 'Family Law Attorney')",
    "follow_up_suggestions": [
        "Suggested follow-up question 1",
        "Suggested follow-up question 2"
    ],
    "emotional_support": "Brief empathetic message based on detected emotional state"
}

⚠️ CRITICAL RULES:
- Return ONLY valid JSON (no markdown code blocks)
- Ensure all strings are properly escaped
- Make detailed_analysis rich and informative (minimum 200 words)
- Provide at least 3 actionable steps
- Always include emotional_support message
- Be culturally sensitive to Indian context
- Use simple language for legal jargon
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        let jsonStr = text.trim();

        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Find JSON boundaries
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        console.log("✅ Gemini AI Response Received");

        const parsedData = JSON.parse(jsonStr);

        return {
            ...parsedData,
            source: 'Gemini AI',
            timestamp: new Date().toISOString(),
            model: 'gemini-pro'
        };

    } catch (error) {
        console.error("❌ Gemini AI Analysis failed:", error.message);
        if (error.message.includes('JSON')) {
            console.error("JSON Parse Error - Raw response might be malformed");
        }
        return null;
    }
}

/**
 * Generate a conversational response (for general queries)
 * @param {string} query - User's question
 * @param {Object} conversationContext - Conversation context
 * @returns {Promise<Object>} - Conversational response
 */
async function generateConversationalResponse(query, conversationContext = null) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let conversationHistoryText = "";
        if (conversationContext?.conversationHistory?.length > 0) {
            conversationHistoryText = "\n\nPrevious conversation:\n" +
                conversationContext.conversationHistory.slice(-5).map(msg =>
                    `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}`
                ).join('\n');
        }

        const prompt = `
You are Nyaya Lite AI, a friendly and knowledgeable legal assistant.

${conversationHistoryText}

User: "${query}"

Provide a helpful, conversational response. If the query is legal-related, offer to help analyze their situation. If it's a greeting or general question, respond warmly and guide them on how you can help.

Keep your response concise (2-3 sentences) and friendly.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            message: text,
            source: 'Gemini AI',
            type: 'conversational'
        };

    } catch (error) {
        console.error("Conversational response failed:", error.message);
        return null;
    }
}

module.exports = {
    generateLegalAnalysis,
    generateConversationalResponse
};
