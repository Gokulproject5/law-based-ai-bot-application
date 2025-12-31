const express = require('express');
const router = express.Router();
const LawEntry = require('../models/LawEntry');
const analyzer = require('../utils/analyzer');

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

module.exports = router;
