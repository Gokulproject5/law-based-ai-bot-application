const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dns = require('dns');
// Set Google Public DNS to resolve SRV record issues
dns.setServers(['8.8.8.8', '8.8.4.4']);
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const apiRoutes = require('./routes/api');
const lawRoutes = require('./routes/laws');

require('dotenv').config();

const app = express();

// Security functions and performance
app.use(helmet());
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(compression());
app.use(morgan('dev')); // Use 'dev' for concise logging during development

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? clientUrl : '*',
  credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api', apiRoutes);
app.use('/api/laws', lawRoutes); // Mount laws route

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Connect MongoDB
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nyaya';
mongoose.connect(MONGO)
  .then(() => console.log('Mongo connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Fallback for local dev if cloud fails (optional)
    if (err.code === 'ECONNREFUSED' && MONGO.includes('mongodb.net')) {
      console.log('⚠️  Cloud MongoDB failed. Using local fallback is not configured.');
    }
  });

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server listening on', PORT));
