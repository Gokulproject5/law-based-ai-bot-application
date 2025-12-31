const express = require('express');
const router = express.Router();
const { analyzeText } = require('../utils/analyzer');
const LawEntry = require('../models/LawEntry');
const Lawyer = require('../models/Lawyer');
const { searchNearbyLawyers, getLawyerDetails } = require('../utils/googlePlacesAPI');

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    try {
        // Fetch all laws for analysis (in-memory is fine for <1000 records)
        const allLaws = await LawEntry.find({});
        const { matches, analysis } = analyzeText(text, allLaws);

        if (matches.length === 0) return res.json({
            message: 'No direct match found',
            suggestion: 'Please rephrase or choose a category from the menu.',
            matches: [],
            analysis: {}
        });

        return res.json({
            matches,
            ...analysis // Include primary_issue, related_issues, urgency_level, entities, etc.
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
