const express = require('express');
const router = express.Router();
const { analyzeText } = require('../utils/analyzer');
const LawEntry = require('../models/LawEntry');
const Lawyer = require('../models/Lawyer');

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

module.exports = router;
