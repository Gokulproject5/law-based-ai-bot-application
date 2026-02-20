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
/**
 * Detect the legal intent of the query
 * @param {string} query - User's query
 * @returns {Promise<Object>} - Intent analysis
 */
async function detectIntent(query) {
    try {
        // Check if AI is enabled
        if (process.env.ENABLE_AI === 'false') {
            return { category: 'General', confidence: 0 };
        }
        if (!process.env.GEMINI_API_KEY) return { category: 'General', confidence: 0 };

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
        Classify this legal query into one of these categories:
        - Criminal (Theft, Assault, Harassment)
        - Civil (Property, Contract, Family)
        - Consumer (Defective product, Service issue)
        - Cyber (Online fraud, Hacking)
        - Traffic (Accident, Challan)
        - Corporate (Startup, Tax)
        - General (Other)

        Query: "${query}"

        Return JSON only:
        {
            "category": "CategoryName",
            "specific_intent": "e.g., File FIR for theft",
            "confidence": 0.95
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Intent detection failed:", e.message);
        return { category: 'General', confidence: 0 };
    }
}

/**
 * Enhanced Legal Analysis with Conversation Context and Intent
 * @param {string} query - The user's legal question
 * @param {Array} contextLaws - Optional: closely related laws from local DB
 * @param {Object} conversationContext - Previous conversation context
 * @param {Object} intent - Detected intent
 * @returns {Promise<Object>} - Structured analysis
 */
async function generateLegalAnalysis(query, contextLaws = [], conversationContext = null, intent = null) {
    try {
        // Check if AI is enabled
        if (process.env.ENABLE_AI === 'false') {
            console.log("ℹ️ AI is disabled. Skipping Gemini analysis.");
            return null;
        }
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Using rule-based fallback.");
            return null;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.4, // Lower temperature for more precise legal output
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        // Build conversation history for context
        let conversationHistoryText = "";
        if (conversationContext && conversationContext.conversationHistory && conversationContext.conversationHistory.length > 0) {
            conversationHistoryText = "\n\nPREVIOUS CONVERSATION:\n" +
                conversationContext.conversationHistory.map(msg =>
                    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
                ).join('\n');
        }

        // Contextual Guidance
        const intentContext = intent ? `Detected Intent: ${intent.category} - ${intent.specific_intent}` : "";
        const emotionalState = conversationContext?.context?.emotionalState || 'neutral';

        const prompt = `
    You are a **Legal Awareness Assistant** for Indian Law. 
    🎯 MISSION: Provide educational awareness about Indian Laws. 
    ⚠️ STRICT RULE: DO NOT give personal legal advice.
    ⚠️ CONSTRAINT: Only reference valid Indian legal sections.

    📚 KNOWLEDGE BASE FOR GROUNDING:
    ${JSON.stringify(contextLaws.slice(0, 5).map(l => ({ title: l.title, sections: l.ipc_sections, description: l.description })), null, 2)}

    🔍 USER QUERY: "${query}"

    📤 OUTPUT FORMAT (Strict JSON):
    {
        "summary": "1-sentence summary of the query.",
        "detailed_analysis": "### 1️⃣ **Relevant Law**\\nList each relevant IPC/BNS section with its number and name (e.g. IPC 420 – Cheating, IPC 379 – Theft).\\n\\n### 2️⃣ **Explanation**\\nExplain these laws in very simple language for a common person.\\n\\n### 3️⃣ **Immediate Steps**\\nPractical first steps like 'File an FIR', 'Call Helpline', 'Document Evidence'.\\n\\n### 4️⃣ **Disclaimer**\\nState: 'This is educational legal awareness information and does not constitute personal legal advice.'",
        "relevant_laws": [
            {
                "name": "IPC 420 – Cheating",
                "ipc_sections": ["IPC 420"],
                "description": "Short description of what it covers."
            }
        ],
        "steps": [
            {
                "title": "Action Title",
                "description": "Action detail.",
                "priority": "Normal"
            }
        ],
        "risk_level": "Normal",
        "confidence_score": 1.0
    }

    ⚠️ IMPORTANT: Use the 1️⃣, 2️⃣, 3️⃣, 4️⃣ markers exactly as shown in 'detailed_analysis'. Always include real IPC/BNS section numbers in both relevant_laws and detailed_analysis.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        let jsonStr = text.replace(/```json|```/g, '').trim();
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);

        console.log("✅ Gemini AI Analysis Generated");
        return {
            ...JSON.parse(jsonStr),
            source: 'Gemini AI',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error("❌ Gemini AI Analysis failed:", error.message);
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
        // Check if AI is enabled
        if (process.env.ENABLE_AI === 'false') return null;

        if (!process.env.GEMINI_API_KEY) {
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

/**
 * Generate embedding for a text (RAG Feature)
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} - Vector embedding
 */
async function generateEmbedding(text) {
    try {
        // Check if AI is enabled (though this function is internal to RAG)
        if (process.env.ENABLE_AI === 'false') return null;

        if (!process.env.GEMINI_API_KEY) return null;
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("❌ Embedding failed:", error.message);
        return null;
    }
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return isNaN(similarity) ? 0 : similarity;
}

/**
 * Perform semantic search across law entries (RAG Feature)
 * @param {string} query - User query
 * @param {Array} laws - Array of LawEntry objects with embeddings
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Top K relevant laws
 */
async function performRAGSearch(query, laws, topK = 5) {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return laws.slice(0, topK);

    const scoredLaws = laws
        .filter(law => law.embedding && law.embedding.length > 0)
        .map(law => ({
            ...law._doc || law,
            similarity: cosineSimilarity(queryEmbedding, law.embedding)
        }))
        .sort((a, b) => b.similarity - a.similarity);

    return scoredLaws.slice(0, topK);
}

module.exports = {
    generateLegalAnalysis,
    generateConversationalResponse,
    generateEmbedding,
    performRAGSearch,
    detectIntent
};
