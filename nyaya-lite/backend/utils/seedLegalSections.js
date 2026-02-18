const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const LegalSection = require('../models/LegalSection');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedLegalSections = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Successfully connected to MongoDB');

        const acts = [
            {
                name: 'Code of Criminal Procedure (CrPC), 1973',
                file: 'crpc_data.json'
            },
            {
                name: 'Code of Civil Procedure (CPC), 1908',
                file: 'cpc_data.json'
            },
            {
                name: 'Hindu Marriage Act, 1955',
                file: 'hma_data.json'
            }
        ];

        for (const act of acts) {
            const filePath = path.join(__dirname, `../data/${act.file}`);
            if (fs.existsSync(filePath)) {
                console.log(`Loading ${act.file}...`);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                const formattedData = data.map(item => ({
                    act_name: act.name,
                    chapter: item.chapter?.toString() || null,
                    section: item.section?.toString(),
                    title: item.section_title || item.title,
                    description: item.section_desc || item.description,
                    keywords: [(item.section_title || item.title).toLowerCase()]
                }));

                console.log(`Cleaning old records for ${act.name}...`);
                await LegalSection.deleteMany({ act_name: act.name });
                console.log(`Inserting ${formattedData.length} records for ${act.name}...`);
                await LegalSection.insertMany(formattedData);
                console.log(`✅ ${act.name} seeded successfully`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ SEEDING FAILED:');
        console.error(err);
        process.exit(1);
    }
};

seedLegalSections();
