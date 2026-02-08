const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Use the no-DB version of API routes
app.use('/api', require('./routes/api-no-db'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('✅ ========================================');
    console.log('✅  Server running on port', PORT);
    console.log('⚠️   TEST MODE: Using JSON file (no MongoDB)');
    console.log('📝  Laws loaded from data/lawdb.json');
    console.log('✅ ========================================');
    console.log('');
});
