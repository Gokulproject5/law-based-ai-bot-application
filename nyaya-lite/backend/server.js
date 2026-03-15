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
const ttsRoutes = require('./routes/tts');

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
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use('/api/laws', lawRoutes); // Mount laws route
app.use('/api', ttsRoutes);      // TTS proxy route

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Optimization for Load Balancers (prevent 502 Bad Gateway)
/* ... */

// Connect MongoDB
// Connect MongoDB with Retry Logic
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nyaya';

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(MONGO, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    if (retries === 0) {
      console.error('❌ MongoDB Connection Failed after retries:', err.message);
      // Exit process with failure
      process.exit(1);
    }
    console.log(`⚠️  MongoDB Connection Failed: ${err.message}`);
    console.log(`🔄 Retrying in 5 seconds... (${retries} retries left)`);
    // Wait for 5 seconds before retrying
    setTimeout(() => connectDB(retries - 1), 5000);
  }
};

// Initial Connection
connectDB();

// Handle ongoing connection errors
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB Runtime Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected. Attempting to reconnect...');
  connectDB();
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
const server = app.listen(PORT, () => console.log('Server listening on', PORT));

// Optimization for Load Balancers (prevent 502 Bad Gateway)
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
