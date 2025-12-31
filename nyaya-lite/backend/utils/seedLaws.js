const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LawEntry = require('../models/LawEntry');
const lawData = require('../data/lawdb.json');

dotenv.config({ path: '../.env' }); // Adjust path if needed

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nyaya';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Mongo connected for seeding...');

        try {
            await LawEntry.deleteMany({}); // Clear existing data
            console.log('Cleared existing laws.');

            await LawEntry.insertMany(lawData);
            console.log(`Successfully seeded ${lawData.length} laws.`);

            process.exit(0);
        } catch (err) {
            console.error('Seeding error:', err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Mongo connection error:', err);
        process.exit(1);
    });
