const mongoose = require('mongoose');

const LawEntrySchema = new mongoose.Schema({
    title: { type: String, required: true },
    keywords: [String], // Synonyms, related terms
    category: { type: String, required: true }, // e.g., "Theft", "Harassment"
    ipc_sections: [String], // e.g., ["379", "411"]
    description: String,
    steps: [String], // Actionable steps for the user
    evidence_required: [String], // Checklist items
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Emergency'],
        default: 'Medium'
    },
    penalty: String, // Potential punishment
    time_limit: String, // Limitation period
    offense_type: String, // Cognizable, Bailable, etc.
    templates: [String], // Names of applicable templates e.g. "FIR", "Complaint"
    state_specific: { type: Map, of: String } // e.g., {"Tamil Nadu": "TN Act Section X"}
});

module.exports = mongoose.model('LawEntry', LawEntrySchema);
