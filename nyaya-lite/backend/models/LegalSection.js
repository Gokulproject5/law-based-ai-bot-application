const mongoose = require('mongoose');

const LegalSectionSchema = new mongoose.Schema({
    act_name: { type: String, default: 'CrPC' },
    chapter: String,
    section: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [String],
    embedding: [Number] // For RAG semantic search
});

module.exports = mongoose.model('LegalSection', LegalSectionSchema);
