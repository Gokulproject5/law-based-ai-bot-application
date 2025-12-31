const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { analyzeText } = require('../utils/analyzer');
const { generateLegalAnalysis } = require('../utils/geminiService');
const LawEntry = require('../models/LawEntry');
const Lawyer = require('../models/Lawyer');
const { searchNearbyLawyers, getLawyerDetails } = require('../utils/googlePlacesAPI');

// Validation Schema
const analyzeSchema = Joi.object({
    text: Joi.string().min(3).max(5000).required().messages({
        'string.empty': 'Please describe your situation.',
        'string.min': 'Description is too short. Please provide more details.',
        'string.max': 'Description is too long. Please summarize.'
    })
});

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    // Validate Input
    const { error } = analyzeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { text } = req.body;

    try {
        // Fetch all laws for analysis (in-memory is fine for <1000 records)
        const allLaws = await LawEntry.find({});

        // 1. Try Gemini AI Analysis first
        console.log("Attempting Gemini AI Analysis...");
        let aiAnalysis = await generateLegalAnalysis(text, allLaws.slice(0, 10)); // Pass some context
        console.log("AI Analysis Result:", aiAnalysis ? "SUCCESS" : "FAILED/NULL");

        // 2. Fallback to local analysis if AI fails or no key
        const localResult = analyzeText(text, allLaws);

        if (aiAnalysis) {
            // Merge AI result with local matches if needed, or just return AI result
            // We'll structure it to match what frontend expects, or send new format
            return res.json({
                ...aiAnalysis, // summary, steps, risk_level, relevant_laws
                matches: localResult.matches, // Keep local matches as reference
                source: 'AI'
            });
        }

        // 3. Return local result if AI failed
        const { matches, analysis } = localResult;

        if (matches.length === 0) return res.json({
            message: 'No direct match found',
            suggestion: 'Please rephrase or choose a category from the menu.',
            matches: [],
            analysis: {}
        });

        return res.json({
            matches,
            ...analysis,
            source: 'Local'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Analysis failed' });
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

module.exports = router;
