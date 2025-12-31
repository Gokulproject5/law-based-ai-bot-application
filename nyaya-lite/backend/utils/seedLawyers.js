const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');
require('dotenv').config({ path: '../.env' });

const lawyers = [
    {
        name: "Adv. Rajesh Kumar",
        specialization: "Criminal Law",
        experience: 15,
        location: { lat: 28.6139, lng: 77.2090, address: "Connaught Place, New Delhi" },
        contact: { phone: "+91-9876543210", email: "rajesh.law@example.com" },
        rating: 4.8
    },
    {
        name: "Adv. Priya Sharma",
        specialization: "Family Law",
        experience: 8,
        location: { lat: 19.0760, lng: 72.8777, address: "Bandra, Mumbai" },
        contact: { phone: "+91-9876543211", email: "priya.sharma@example.com" },
        rating: 4.5
    },
    {
        name: "Adv. Amit Verma",
        specialization: "Corporate Law",
        experience: 12,
        location: { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" },
        contact: { phone: "+91-9876543212", email: "amit.verma@example.com" },
        rating: 4.7
    },
    {
        name: "Adv. Sneha Gupta",
        specialization: "Civil Law",
        experience: 5,
        location: { lat: 13.0827, lng: 80.2707, address: "T. Nagar, Chennai" },
        contact: { phone: "+91-9876543213", email: "sneha.g@example.com" },
        rating: 4.2
    },
    {
        name: "Adv. Vikram Singh",
        specialization: "Property Law",
        experience: 20,
        location: { lat: 22.5726, lng: 88.3639, address: "Park Street, Kolkata" },
        contact: { phone: "+91-9876543214", email: "vikram.s@example.com" },
        rating: 4.9
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to DB");

        await Lawyer.deleteMany({});
        console.log("Cleared existing lawyers");

        await Lawyer.insertMany(lawyers);
        console.log("Seeded lawyers successfully");

        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding DB:", err);
    }
};

seedDB();
