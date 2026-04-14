// src/config/database.js
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let pool = null;

const initializeDatabase = async () => {
  try {
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'user_auth',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    logger.info('MySQL database connected successfully');
    connection.release();
    
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

const getConnection = async () => {
  if (!pool) {
    await initializeDatabase();
  }
  return pool.getConnection();
};

const query = async (sql, params = []) => {
  if (!pool) {
    await initializeDatabase();
  }
  
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    logger.error('Query error:', { sql, params, error: error.message });
    throw error;
  }
};

const transaction = async (callback) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  initializeDatabase,
  getConnection,
  query,
  transaction,
  getPool: () => pool,
};