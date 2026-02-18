const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const LegalSection = require('../models/LegalSection');
dotenv.config({ path: path.join(__dirname, '../.env') });
const { generateEmbedding } = require('./geminiService');

const generateEmbeddings = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const sections = await LegalSection.find({
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } }
            ]
        });

        console.log(`Found ${sections.length} sections without embeddings.`);

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const textToEmbed = `${section.act_name} Section ${section.section}: ${section.title} ${section.description}`;

            process.stdout.write(`Processing ${i + 1}/${sections.length}: ${section.act_name} Sec ${section.section}... `);

            const embedding = await generateEmbedding(textToEmbed);
            if (embedding) {
                section.embedding = embedding;
                await section.save();
                console.log('✅');
            } else {
                console.log('❌ (Failed)');
            }

            // Sleep a bit to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('✅ Embedding generation complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error generating embeddings:', err);
        process.exit(1);
    }
};

generateEmbeddings();
