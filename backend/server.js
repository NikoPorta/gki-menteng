// server.js
require('dotenv').config();
const { app, initApp } = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize app (includes database connection)
    await initApp();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Received shutdown signal, closing server...');
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connections
        const db = require('./src/config/database');
        const pool = db.getPool();
        if (pool) {
          await pool.end();
          logger.info('Database connections closed');
        }
        
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();