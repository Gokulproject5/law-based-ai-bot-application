const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // The listModels method might not be directly available on genAI in all versions
        // but we can try to hit an embedding with different names
        const names = ["text-embedding-004", "embedding-001", "models/text-embedding-004", "models/embedding-001"];

        for (const name of names) {
            try {
                process.stdout.write(`Testing ${name}... `);
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.embedContent("test");
                console.log("✅ Success!");
            } catch (e) {
                console.log(`❌ Failed: ${e.message.split('\n')[0]}`);
            }
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

listModels();
