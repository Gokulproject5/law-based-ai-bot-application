const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { analyzeText } = require('../utils/analyzer');
const { generateLegalAnalysis, generateConversationalResponse, performRAGSearch, detectIntent } = require('../utils/geminiService');
const conversationManager = require('../utils/conversationContext');
const LawEntry = require('../models/LawEntry');
const LegalSection = require('../models/LegalSection');
const Lawyer = require('../models/Lawyer');
const { searchNearbyLawyers, searchNearbyPolice, searchNearbyCourts, getLawyerDetails } = require('../utils/googlePlacesAPI');

// Validation Schema
const analyzeSchema = Joi.object({
    text: Joi.string().min(2).max(5000).required().messages({
        'string.empty': 'Please describe your situation.',
        'string.min': 'Description is too short. Please provide more details.',
        'string.max': 'Description is too long. Please summarize.'
    }),
    sessionId: Joi.string().optional(),
    language: Joi.string().valid('en', 'hi', 'ta').default('en').optional()
});

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    // Validate Input
    const { error } = analyzeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { text, sessionId = 'default', language = 'en' } = req.body;

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

        // Fetch all laws for analysis
        const allLaws = await LawEntry.find({}).lean();

        // ARCITECTURE STEP 2: Intent Detection
        console.log(`🧠 NLP: Detecting intent for "${text}"...`);
        const intent = await detectIntent(text);
        console.log(`✅ Intent Detected: ${intent.category} (${intent.specific_intent}) | Confidence: ${intent.confidence}`);

        // Update context with intent
        conversationManager.updateContext(sessionId, { lastIntent: intent });

        // Determine if this is a legal query or general conversation
        const isLegalQuery = intent.category !== 'General' || /\b(law|legal|ipc|section|police|court|lawyer|crime|theft|harassment|property|accident|fraud|rights|complaint|fir)\b/i.test(text);

        let aiAnalysis = null;

        if (isLegalQuery || isFollowUp) {
            // 1. RAG ARCHITECTURE: Semantic Retrieval
            console.log(`🔍 RAG: Performing semantic search for "${text}"`);

            // Load both high-level laws and granular sections
            const allLaws = await LawEntry.find();
            const allSections = await LegalSection.find({ embedding: { $exists: true, $not: { $size: 0 } } });

            // Search across both sets
            const relevantLaws = await performRAGSearch(text, [...allLaws, ...allSections]);

            console.log(`🧠 RAG: Augmenting prompt with ${relevantLaws.length} relevant legal docs`);
            // Pass intent to the analysis engine
            aiAnalysis = await generateLegalAnalysis(text, relevantLaws, conversationContext, intent, language);
            console.log("AI Analysis Result:", aiAnalysis ? "✅ SUCCESS" : "❌ FAILED/NULL");
        } else {
            // Handle general conversation
            console.log(`💬 Handling conversational query (Session: ${sessionId})`);
            const conversationalResponse = await generateConversationalResponse(text, conversationContext, language);

            if (conversationalResponse) {
                conversationManager.addMessage(sessionId, 'assistant', conversationalResponse.message);
                return res.json(conversationalResponse);
            }
        }

        // 2. Fallback to local analysis (Ground Truth / Search)
        const localResult = analyzeText(text, allLaws);

        // Update context with detected category
        if (localResult.analysis?.primary_issue) {
            conversationManager.updateContext(sessionId, {
                legalCategory: localResult.analysis.primary_issue,
                severity: localResult.analysis.urgency_level
            });
        }

        // 🧱 ARCHITECTURE STEP 8: Post Processor & Rule Layer
        let finalResponse = aiAnalysis || localResult;

        // Rule: Force emergency buttons for high-risk categories
        if (intent.category === 'Criminal' || localResult.analysis.urgency_level === 'Emergency') {
            const safetyButtons = localResult.emergency_buttons || [];

            // Merge buttons with AI buttons (avoid duplicates by label)
            if (aiAnalysis && aiAnalysis.emergency_buttons) {
                safetyButtons.forEach(sb => {
                    if (!aiAnalysis.emergency_buttons.some(ab => ab.label === sb.label)) {
                        aiAnalysis.emergency_buttons.push(sb);
                    }
                });
            } else if (aiAnalysis) {
                aiAnalysis.emergency_buttons = safetyButtons;
            }
        }

        // Ensure matches are populated for UI ResultCards
        if (aiAnalysis) {
            // Add AI response to conversation
            conversationManager.addMessage(sessionId, 'assistant', aiAnalysis.summary || aiAnalysis.detailed_analysis);

            return res.json({
                ...aiAnalysis,
                // CRITICAL FIX: Prioritize actual database objects (localResult.matches) over AI-generated strings 
                // for the ResultCard component to function correctly.
                matches: (localResult.matches && localResult.matches.length > 0) ? localResult.matches : (aiAnalysis.relevant_laws || []),
                sessionId,
                isFollowUp,
                emotionalState,
                intent: intent
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
            ...localResult,
            text: localResult.detailed_analysis,
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
        const categories = await LawEntry.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/lawyers
router.get('/lawyers', async (req, res) => {
    try {
        const lawyers = await Lawyer.find();
        res.json(lawyers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lawyers' });
    }
});

// GET /api/lawyers/nearby
router.get('/lawyers/nearby', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const lawyers = await searchNearbyLawyers(
            parseFloat(lat),
            parseFloat(lng),
            radius ? parseInt(radius) : 5000
        );

        res.json(lawyers);
    } catch (err) {
        console.error('Error fetching nearby lawyers:', err);
        res.status(500).json({ error: 'Failed to fetch nearby lawyers' });
    }
});

// GET /api/police/nearby
router.get('/police/nearby', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const stations = await searchNearbyPolice(
            parseFloat(lat),
            parseFloat(lng),
            radius ? parseInt(radius) : 5000
        );

        res.json(stations);
    } catch (err) {
        console.error('Error fetching nearby police:', err);
        res.status(500).json({ error: 'Failed to fetch nearby police' });
    }
});

// GET /api/courts/nearby
router.get('/courts/nearby', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const courts = await searchNearbyCourts(
            parseFloat(lat),
            parseFloat(lng),
            radius ? parseInt(radius) : 5000
        );

        res.json(courts);
    } catch (err) {
        console.error('Error fetching nearby courts:', err);
        res.status(500).json({ error: 'Failed to fetch nearby courts' });
    }
});

// GET /api/lawyers/details/:placeId
router.get('/lawyers/details/:placeId', async (req, res) => {
    try {
        const details = await getLawyerDetails(req.params.placeId);
        if (!details) {
            return res.status(404).json({ error: 'Lawyer details not found' });
        }
        res.json(details);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lawyer details' });
    }
});

const indianKanoon = require('../utils/indianKanoon');

// GET /api/cases/search
router.get('/cases/search', async (req, res) => {
    try {
        const { q, p } = req.query;
        if (!q) return res.status(400).json({ error: 'Search query required' });

        const results = await indianKanoon.search(q, p || 0);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Failed to search Indian Kanoon' });
    }
});

// GET /api/cases/doc/:docid
router.get('/cases/doc/:docid', async (req, res) => {
    try {
        const doc = await indianKanoon.getDocument(req.params.docid);
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});

module.exports = router;
