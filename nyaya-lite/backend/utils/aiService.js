const geminiService = require('./geminiService');
const openRouterService = require('./openRouterService');

const provider = process.env.AI_PROVIDER || 'gemini';

console.log(`🤖 AI Service initialized with provider: ${provider}`);

const service = provider === 'openrouter' ? openRouterService : geminiService;

module.exports = {
    // LLM Functions
    detectIntent: service.detectIntent || geminiService.detectIntent,
    generateLegalAnalysis: service.generateLegalAnalysis || geminiService.generateLegalAnalysis,
    generateConversationalResponse: service.generateConversationalResponse || geminiService.generateConversationalResponse,
    
    // Embedding functions (Always use Gemini for consistency if needed, or specific provider)
    // For now, we keep embeddings on Gemini as OpenRouter doesn't have a standard embedding API 
    // and changing it would require re-indexing the database.
    generateEmbedding: geminiService.generateEmbedding,
    performRAGSearch: geminiService.performRAGSearch,
    cosineSimilarity: geminiService.cosineSimilarity
};
