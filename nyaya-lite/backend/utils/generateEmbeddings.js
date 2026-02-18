const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LawEntry = require('../models/LawEntry');
const { generateEmbedding } = require('./geminiService');

dotenv.config({ path: '../.env' });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nyaya';

async function run() {
    try {
        await mongoose.connect(MONGO);
        console.log('Connected to MongoDB');

        const laws = await LawEntry.find({
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } }
            ]
        });

        console.log(`Found ${laws.length} laws without embeddings.`);

        for (let i = 0; i < laws.length; i++) {
            const law = laws[i];
            const textToEmbed = `${law.title}. ${law.category}. ${law.description}. ${law.keywords.join(', ')}`;

            console.log(`[${i + 1}/${laws.length}] Generating embedding for: ${law.title}`);
            const embedding = await generateEmbedding(textToEmbed);

            if (embedding) {
                law.embedding = embedding;
                await law.save();
                console.log(`✅ Updated: ${law.title}`);
            } else {
                console.error(`❌ Failed: ${law.title}`);
            }

            // Sleep a bit to stay within rate limits if needed (Gemini free tier has limits)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('All done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
