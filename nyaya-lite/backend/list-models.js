require('dotenv').config();
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(URL, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("✅ Available Models:");
                json.models.forEach(model => console.log(`- ${model.name}`));
            } else {
                console.log("❌ Error:", JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.log("❌ Parse Error:", e.message);
            console.log("Raw Data:", data);
        }
    });
}).on('error', (err) => {
    console.log("❌ Request Error:", err.message);
});
