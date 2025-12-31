const express = require('express');
const router = express.Router();
const LawEntry = require('../models/LawEntry');
const analyzer = require('../utils/analyzer');
const indianLawAPI = require('../utils/indianLawAPI');

// GET all laws (with optional search)
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { keywords: { $regex: search, $options: 'i' } }
            ];
        }

        const laws = await LawEntry.find(query);
        res.json(laws);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single law by ID
router.get('/:id', async (req, res) => {
    try {
        const law = await LawEntry.findById(req.params.id);
        if (!law) return res.status(404).json({ error: 'Law not found' });
        res.json(law);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET official acts from Indian Law API
router.get('/official/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const acts = await indianLawAPI.searchActs(q);
        res.json({ query: q, results: acts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET specific act details
router.get('/official/acts/:actId', async (req, res) => {
    try {
        const actDetails = await indianLawAPI.getActDetails(req.params.actId);
        if (!actDetails) {
            return res.status(404).json({ error: 'Act not found' });
        }
        res.json(actDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET specific section of an act
router.get('/official/acts/:actId/sections/:section', async (req, res) => {
    try {
        const { actId, section } = req.params;
        const sectionData = await indianLawAPI.getSection(actId, section);
        if (!sectionData) {
            return res.status(404).json({ error: 'Section not found' });
        }
        res.json(sectionData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
