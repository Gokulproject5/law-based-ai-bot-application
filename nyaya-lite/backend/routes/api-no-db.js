const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { analyzeText } = require('../utils/analyzer');
const { generateLegalAnalysis, generateConversationalResponse } = require('../utils/geminiService');
const conversationManager = require('../utils/conversationContext');
const fs = require('fs');
const path = require('path');

// Load laws from JSON file (fallback when MongoDB is not available)
let lawsData = [];
try {
    const lawsPath = path.join(__dirname, '../data/lawdb.json');
    if (fs.existsSync(lawsPath)) {
        lawsData = JSON.parse(fs.readFileSync(lawsPath, 'utf8'));
        console.log(`✅ Loaded ${lawsData.length} laws from lawdb.json`);
    }
} catch (error) {
    console.error('⚠️  Could not load lawdb.json:', error.message);
}

// Validation Schema
const analyzeSchema = Joi.object({
    text: Joi.string().min(2).max(5000).required().messages({
        'string.empty': 'Please describe your situation.',
        'string.min': 'Description is too short. Please provide more details.',
        'string.max': 'Description is too long. Please summarize.'
    }),
    sessionId: Joi.string().optional()
});

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    // Validate Input
    const { error } = analyzeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { text, sessionId = 'default' } = req.body;

    try {
        // Get or create conversation session
        const session = conversationManager.getSession(sessionId);

        // Detect emotional state
        const emotionalState = conversationManager.detectEmotionalState(text);
        conversationManager.updateContext(sessionId, { emotionalState });

        // Add user message to conversation
        conversationManager.addMessage(sessionId, 'user', text);

        // Check if this is a follow-up
        const isFollowUp = conversationManager.isFollowUpQuestion(sessionId, text);

        // Get full conversation context
        const conversationContext = conversationManager.getFullContext(sessionId);

        // Use laws from JSON file
        const allLaws = lawsData;

        // Determine if this is a legal query or general conversation
        const isLegalQuery = /\b(law|legal|ipc|section|police|court|lawyer|crime|theft|harassment|property|accident|fraud|rights|complaint|fir)\b/i.test(text);

        let aiAnalysis = null;

        if (isLegalQuery || isFollowUp) {
            // 1. Try Gemini AI Legal Analysis
            console.log(`🔍 Analyzing legal query (Session: ${sessionId}, Follow-up: ${isFollowUp})`);
            aiAnalysis = await generateLegalAnalysis(text, allLaws.slice(0, 10), conversationContext);
            console.log("AI Analysis Result:", aiAnalysis ? "✅ SUCCESS" : "❌ FAILED/NULL");
        } else {
            // Handle general conversation
            console.log(`💬 Handling conversational query (Session: ${sessionId})`);
            const conversationalResponse = await generateConversationalResponse(text, conversationContext);

            if (conversationalResponse) {
                conversationManager.addMessage(sessionId, 'assistant', conversationalResponse.message);
                return res.json(conversationalResponse);
            }
        }

        // 2. Fallback to local analysis
        const localResult = analyzeText(text, allLaws);

        // Update context with detected category
        if (localResult.analysis?.primary_issue) {
            conversationManager.updateContext(sessionId, {
                legalCategory: localResult.analysis.primary_issue,
                severity: localResult.analysis.urgency_level
            });
        }

        if (aiAnalysis) {
            // Add AI response to conversation
            conversationManager.addMessage(sessionId, 'assistant', aiAnalysis.summary || aiAnalysis.detailed_analysis);

            return res.json({
                ...aiAnalysis,
                matches: localResult.matches, // Include local matches for comparison
                sessionId,
                isFollowUp,
                emotionalState
            });
        }

        // 3. Return local result if AI failed
        const { matches, analysis, steps } = localResult;

        if (matches.length === 0) {
            const noMatchMessage = 'No direct match found. Please rephrase or choose a category from the menu.';
            conversationManager.addMessage(sessionId, 'assistant', noMatchMessage);

            return res.json({
                message: noMatchMessage,
                suggestion: 'Try describing your situation in more detail or browse categories.',
                matches: [],
                analysis: {},
                sessionId
            });
        }

        // Add local response to conversation
        const responseMessage = `Found ${matches.length} relevant law(s) for your situation.`;
        conversationManager.addMessage(sessionId, 'assistant', responseMessage);

        return res.json({
            matches,
            steps,
            ...analysis,
            source: 'Local',
            sessionId,
            isFollowUp,
            emotionalState
        });
    } catch (err) {
        console.error('❌ Analysis error:', err);
        res.status(500).json({ error: 'Analysis failed. Please try again.' });
    }
});

// GET /api/categories
router.get('/categories', async (req, res) => {
    try {
        // Extract unique categories from lawsData
        const categories = [...new Set(lawsData.map(law => law.category))];
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/lawyers (mock data for now)
router.get('/lawyers', async (req, res) => {
    try {
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lawyers' });
    }
});

// GET /api/lawyers/nearby (mock)
router.get('/lawyers/nearby', async (req, res) => {
    try {
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch nearby lawyers' });
    }
});

// GET /api/lawyers/details/:placeId (mock)
router.get('/lawyers/details/:placeId', async (req, res) => {
    try {
        res.json(null);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lawyer details' });
    }
});

module.exports = router;
