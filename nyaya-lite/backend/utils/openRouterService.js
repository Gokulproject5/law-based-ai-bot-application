const axios = require('axios');

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

/**
 * Call OpenRouter API
 */
async function callOpenRouter(messages, temperature = 0.5, jsonMode = false) {
    try {
        const headers = {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nyaya-lite.ai", // Optional, for OpenRouter rankings
            "X-Title": "Nyaya Lite", // Optional
        };

        const body = {
            model: MODEL,
            messages: messages,
            temperature: temperature,
        };

        if (jsonMode) {
            body.response_format = { type: "json_object" };
        }

        const response = await axios.post(OPENROUTER_URL, body, { headers });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ OpenRouter API Error:", error.response?.data || error.message);
        throw error;
    }
}

/**
 * Detect the legal intent of the query
 */
async function detectIntent(query) {
    try {
        if (process.env.ENABLE_AI === 'false') return { category: 'General', confidence: 0 };
        if (!API_KEY) return { category: 'General', confidence: 0 };

        const messages = [
            {
                role: "system",
                content: "You are a legal intent classifier. Return JSON only."
            },
            {
                role: "user",
                content: `Classify this legal query into one of these categories:
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
                }`
            }
        ];

        const text = await callOpenRouter(messages, 0.3, true);
        return JSON.parse(text);
    } catch (e) {
        console.error("Intent detection failed:", e.message);
        return { category: 'General', confidence: 0 };
    }
}

/**
 * Enhanced Legal Analysis
 */
async function generateLegalAnalysis(query, contextLaws = [], conversationContext = null, intent = null, language = 'en') {
    try {
        if (process.env.ENABLE_AI === 'false') return null;
        if (!API_KEY) return null;

        // Build conversation history
        let conversationHistory = [];
        if (conversationContext && conversationContext.conversationHistory) {
            conversationHistory = conversationContext.conversationHistory.slice(-5).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
        }

        const languageMap = { ta: 'Tamil (தமிழ்)', hi: 'Hindi (हिंदी)', en: 'English' };
        const targetLanguage = languageMap[language] || 'English';
        
        const languageInstruction = language !== 'en'
            ? `🌐 LANGUAGE REQUIREMENT: You MUST write the ENTIRE response — including all fields (summary, detailed_analysis, step titles, step descriptions, emotional_support) — in ${targetLanguage}. Do NOT use English anywhere in the content fields. IPC/BNS section numbers and legal codes may remain in their standard format (e.g., IPC 420).`
            : '';

        const systemPrompt = `
    You are a **Legal Awareness Assistant** for Indian Law. 
    🎯 MISSION: Provide educational awareness about Indian Laws and analyze legal scenarios.
    ⚠️ STRICT RULE: DO NOT give personal legal advice. Use phrases like "Based on the scenario provided..." and "Generally, in such cases...".
    ⚠️ CONSTRAINT: Only reference valid Indian legal sections.
    ${languageInstruction}

    📚 KNOWLEDGE BASE FOR GROUNDING:
    ${JSON.stringify(contextLaws.slice(0, 5).map(l => ({ title: l.title, sections: l.ipc_sections, description: l.description })), null, 2)}

    📤 OUTPUT FORMAT (Strict JSON):
    {
        "summary": "1-sentence summary of the query in ${targetLanguage}.",
        "detailed_analysis": "### 1️⃣ **Relevant Law**\\nList each relevant IPC/BNS section with its number and name (e.g. IPC 420 – Cheating, IPC 379 – Theft).\\n\\n### 2️⃣ **Explanation**\\nExplain these laws in very simple language in ${targetLanguage} for a common person.\\n\\n### 3️⃣ **Immediate Steps**\\nPractical first steps in ${targetLanguage} like 'File an FIR', 'Call Helpline', 'Document Evidence'.\\n\\n### 4️⃣ **Disclaimer**\\nState the disclaimer in ${targetLanguage}.",
        "relevant_laws": [
            {
                "name": "IPC 420 – Cheating",
                "ipc_sections": ["IPC 420"],
                "description": "Short description in ${targetLanguage}."
            }
        ],
        "steps": [
            {
                "title": "Action Title in ${targetLanguage}",
                "description": "Action detail in ${targetLanguage}.",
                "priority": "Normal"
            }
        ],
        "case_analysis": {
            "win_probability": 75,
            "legal_strategy": "A high-level strategic approach in ${targetLanguage} (e.g., 'Focus on documenting the timeline...', 'Prioritize mediation before litigation...')",
            "likely_outcome": "Likely outcome description in ${targetLanguage}",
            "expected_duration": "Estimated time for resolution in ${targetLanguage} (e.g., 6-12 months)",
            "key_challenges": [
                "Challenge 1 in ${targetLanguage}",
                "Challenge 2 in ${targetLanguage}"
            ],
            "estimated_cost_range": "General cost awareness in ${targetLanguage} (e.g., Low, Medium, High + brief explanation)",
            "improvement_suggestions": [
                "Detailed, high-impact tactical suggestion in ${targetLanguage} (e.g., 'Secure a certified bank statement showing the unauthorized transfer to establish a paper trail...')",
                "Evidentiary requirement in ${targetLanguage} (e.g., 'Identify at least two neutral witnesses present at the scene...')"
            ],
            "winning_roadmap": [
                {
                    "stage": "Roadmap stage name in ${targetLanguage} (e.g., 'Evidence Collection')",
                    "action": "Specific high-impact action to move towards 90-100% win probability in ${targetLanguage}",
                    "impact": "Explanation of how this specific action drastically increases case strength"
                }
            ]
        },
        "risk_level": "Normal",
        "confidence_score": 1.0,
        "emotional_support": "A supportive message in ${targetLanguage} if the user is distressed."
    }

    ⚠️ IMPORTANT: Use the 1️⃣, 2️⃣, 3️⃣, 4️⃣ markers exactly as shown in 'detailed_analysis'. Always include real IPC/BNS section numbers in both relevant_laws and detailed_analysis. All human-readable text must be in ${targetLanguage}.
    `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: query }
        ];

        const text = await callOpenRouter(messages, 0.4, true);
        
        // Robust JSON extraction
        let jsonStr = text.replace(/```json|```/g, '').trim();
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);

        console.log("✅ OpenRouter AI Analysis Generated");
        return {
            ...JSON.parse(jsonStr),
            source: `OpenRouter (${MODEL})`,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error("❌ OpenRouter AI Analysis failed:", error.message);
        return null;
    }
}

/**
 * Generate a conversational response
 */
async function generateConversationalResponse(query, conversationContext = null, language = 'en') {
    try {
        if (process.env.ENABLE_AI === 'false') return null;
        if (!API_KEY) return null;

        const languageMap = { ta: 'Tamil (தமிழ்)', hi: 'Hindi (हिंदी)', en: 'English' };
        const targetLanguage = languageMap[language] || 'English';
        
        const systemPrompt = `You are Nyaya Lite AI, a friendly and knowledgeable legal assistant.
        Respond ENTIRELY in ${targetLanguage}. Do not use English in your reply.
        Keep your response concise (2-3 sentences) and friendly.
        If the query is legal-related, offer to help analyze their situation. 
        If it's a greeting or general question, respond warmly and guide them on how you can help.`;

        let conversationHistory = [];
        if (conversationContext?.conversationHistory) {
            conversationHistory = conversationContext.conversationHistory.slice(-5).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
        }

        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: query }
        ];

        const text = await callOpenRouter(messages, 0.7);

        return {
            message: text,
            source: `OpenRouter (${MODEL})`,
            type: 'conversational'
        };

    } catch (error) {
        console.error("OpenRouter Conversational response failed:", error.message);
        return null;
    }
}

module.exports = {
    detectIntent,
    generateLegalAnalysis,
    generateConversationalResponse
};
