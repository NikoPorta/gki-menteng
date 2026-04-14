// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Initialize database before starting server
let dbInitialized = false;

const initApp = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
  return app;
};

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const db = require('./config/database');
    await db.query('SELECT 1');
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date(),
      database: 'disconnected'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler
app.use(errorHandler);

module.exports = { app, initApp };