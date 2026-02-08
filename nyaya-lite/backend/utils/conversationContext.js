/**
 * Conversation Context Manager
 * Manages conversation history and context for multi-turn conversations
 */

class ConversationContext {
    constructor() {
        // In-memory storage (use Redis/MongoDB for production)
        this.sessions = new Map();
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Get or create a session
     * @param {string} sessionId - Unique session identifier
     * @returns {Object} Session data
     */
    getSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                id: sessionId,
                messages: [],
                context: {
                    detectedEntities: {},
                    userIntent: null,
                    legalCategory: null,
                    severity: null,
                    emotionalState: 'neutral'
                },
                metadata: {
                    createdAt: new Date(),
                    lastActivity: new Date(),
                    messageCount: 0
                }
            });
        }

        const session = this.sessions.get(sessionId);
        session.metadata.lastActivity = new Date();
        return session;
    }

    /**
     * Add a message to the conversation
     * @param {string} sessionId - Session ID
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message content
     * @param {Object} metadata - Additional metadata
     */
    addMessage(sessionId, role, content, metadata = {}) {
        const session = this.getSession(sessionId);
        
        session.messages.push({
            role,
            content,
            timestamp: new Date(),
            ...metadata
        });

        session.metadata.messageCount++;

        // Keep only last 20 messages to manage memory
        if (session.messages.length > 20) {
            session.messages = session.messages.slice(-20);
        }

        return session;
    }

    /**
     * Update session context
     * @param {string} sessionId - Session ID
     * @param {Object} contextUpdate - Context updates
     */
    updateContext(sessionId, contextUpdate) {
        const session = this.getSession(sessionId);
        session.context = {
            ...session.context,
            ...contextUpdate
        };
        return session;
    }

    /**
     * Get conversation history for AI context
     * @param {string} sessionId - Session ID
     * @param {number} limit - Number of recent messages to include
     * @returns {Array} Formatted conversation history
     */
    getConversationHistory(sessionId, limit = 10) {
        const session = this.getSession(sessionId);
        return session.messages.slice(-limit).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Get full context for AI prompt
     * @param {string} sessionId - Session ID
     * @returns {Object} Complete context
     */
    getFullContext(sessionId) {
        const session = this.getSession(sessionId);
        return {
            conversationHistory: this.getConversationHistory(sessionId),
            context: session.context,
            metadata: session.metadata
        };
    }

    /**
     * Clear old sessions (cleanup)
     */
    cleanup() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.metadata.lastActivity.getTime() > this.SESSION_TIMEOUT) {
                this.sessions.delete(sessionId);
            }
        }
    }

    /**
     * Delete a session
     * @param {string} sessionId - Session ID
     */
    deleteSession(sessionId) {
        this.sessions.delete(sessionId);
    }

    /**
     * Analyze user's emotional state from text
     * @param {string} text - User input
     * @returns {string} Emotional state
     */
    detectEmotionalState(text) {
        const lowerText = text.toLowerCase();
        
        // Urgent/Distressed
        if (/(urgent|emergency|help|scared|afraid|worried|panic)/i.test(lowerText)) {
            return 'distressed';
        }
        
        // Angry/Frustrated
        if (/(angry|frustrated|furious|mad|unfair|cheated)/i.test(lowerText)) {
            return 'frustrated';
        }
        
        // Confused
        if (/(confused|don't understand|not sure|what should|help me understand)/i.test(lowerText)) {
            return 'confused';
        }
        
        // Grateful/Positive
        if (/(thank|thanks|appreciate|helpful|great)/i.test(lowerText)) {
            return 'grateful';
        }
        
        return 'neutral';
    }

    /**
     * Determine if this is a follow-up question
     * @param {string} sessionId - Session ID
     * @param {string} text - User input
     * @returns {boolean} Is follow-up
     */
    isFollowUpQuestion(sessionId, text) {
        const session = this.getSession(sessionId);
        
        if (session.messages.length < 2) return false;
        
        const followUpPatterns = [
            /^(what|how|why|when|where|who|can|should|is|are|do|does)/i,
            /(also|additionally|furthermore|moreover|and|but)/i,
            /(more|another|other|else)/i,
            /^(yes|no|okay|ok|sure|maybe)/i
        ];
        
        return followUpPatterns.some(pattern => pattern.test(text.trim()));
    }
}

// Singleton instance
const conversationManager = new ConversationContext();

// Cleanup old sessions every 10 minutes
setInterval(() => {
    conversationManager.cleanup();
}, 10 * 60 * 1000);

module.exports = conversationManager;
