// src/models/SessionModel.js
const db = require('../config/database');

class SessionModel {
  // Create session
  static async create(userId, token, expiresIn = '7d') {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    const sql = `
      INSERT INTO sessions (user_id, token, expires_at) 
      VALUES (?, ?, ?)
    `;
    
    await db.query(sql, [userId, token, expiresAt]);
    return true;
  }
  
  // Find session by token
  static async findByToken(token) {
    const sql = `
      SELECT s.*, u.is_active 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = TRUE
    `;
    const sessions = await db.query(sql, [token]);
    return sessions[0] || null;
  }
  
  // Delete session (logout)
  static async deleteByToken(token) {
    const sql = 'DELETE FROM sessions WHERE token = ?';
    const result = await db.query(sql, [token]);
    return result.affectedRows > 0;
  }
  
  // Delete all user sessions (logout from all devices)
  static async deleteAllUserSessions(userId) {
    const sql = 'DELETE FROM sessions WHERE user_id = ?';
    await db.query(sql, [userId]);
    return true;
  }
  
  // Clean expired sessions
  static async cleanExpiredSessions() {
    const sql = 'DELETE FROM sessions WHERE expires_at <= NOW()';
    const result = await db.query(sql);
    return result.affectedRows;
  }
}

module.exports = SessionModel;