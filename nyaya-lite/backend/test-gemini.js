const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
];

const embeddingsToTest = [
    "text-embedding-004",
    "embedding-001"
];

async function testModel(modelName) {
    try {
        console.log(`Testing content generation with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello via standard SDK");
        console.log(`✅ SUCCESS: ${modelName} responded:`, result.response.text());
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelName} - ${error.message}`);
        return false;
    }
}

async function testEmbedding(modelName) {
    try {
        console.log(`Testing embedding with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent("Hello");
        console.log(`✅ SUCCESS: ${modelName} embedding generated`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelName} - ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log("--- GENERATION MODELS ---");
    for (const model of modelsToTest) {
        if (await testModel(model)) break; // Stop at first success
    }

    console.log("\n--- EMBEDDING MODELS ---");
    for (const model of embeddingsToTest) {
        if (await testEmbedding(model)) break;
    }
}

runTests();
