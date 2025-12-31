const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true }, // e.g., Criminal, Family, Corporate
    experience: { type: Number, required: true }, // Years of experience
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    contact: {
        phone: String,
        email: String
    },
    rating: { type: Number, default: 0 },
    imageUrl: { type: String } // Optional: for UI
});

module.exports = mongoose.model('Lawyer', lawyerSchema);
