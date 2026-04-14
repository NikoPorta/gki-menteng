// src/middleware/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  logger.error(`${err.name}: ${err.message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }
  
  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry error';
    error.statusCode = 400;
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    error.message = 'Referenced record not found';
    error.statusCode = 400;
  }
  
  if (err.code === 'ER_DATA_TOO_LONG') {
    error.message = 'Data too long for column';
    error.statusCode = 400;
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }
  
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }
  
  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;