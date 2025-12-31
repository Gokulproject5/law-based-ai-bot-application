const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const LawEntry = require('./models/LawEntry');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nyaya';

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Read law data
        const lawDataPath = path.join(__dirname, 'data', 'lawdb.json');
        const lawData = JSON.parse(fs.readFileSync(lawDataPath, 'utf8'));

        console.log(`Found ${lawData.length} laws in lawdb.json`);

        // Clear existing data
        await LawEntry.deleteMany({});
        console.log('Cleared existing law entries');

        // Insert new data
        await LawEntry.insertMany(lawData);
        console.log(`✅ Successfully seeded ${lawData.length} law entries!`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
