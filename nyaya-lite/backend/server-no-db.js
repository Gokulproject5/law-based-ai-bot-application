const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/api'));
app.use('/api/laws', require('./routes/laws'));

const PORT = process.env.PORT || 5000;

// Start server WITHOUT MongoDB for testing
app.listen(PORT, () => {
    console.log(`✅ Server listening on ${PORT}`);
    console.log(`⚠️  Running in TEST MODE (MongoDB connection disabled)`);
    console.log(`📝 Using in-memory law database for testing`);
});
