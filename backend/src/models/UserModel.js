// src/models/UserModel.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Create new user
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const sql = `
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [name, email, hashedPassword, role]);
    return { id: result.insertId, name, email, role };
  }
  
  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const users = await db.query(sql, [email]);
    return users[0] || null;
  }
  
  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT id, name, email, role, is_active, last_login, created_at FROM users WHERE id = ? AND is_active = TRUE';
    const users = await db.query(sql, [id]);
    return users[0] || null;
  }
  
  // Update user
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 12);
      fields.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, values);
    return result.affectedRows > 0;
  }
  
  // Update last login timestamp
  static async updateLastLogin(id) {
    const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await db.query(sql, [id]);
  }
  
  // Delete user (soft delete)
  static async delete(id) {
    const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }
  
  // Get all users (with pagination)
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT id, name, email, role, last_login, created_at 
      FROM users 
      WHERE is_active = TRUE 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const countSql = 'SELECT COUNT(*) as total FROM users WHERE is_active = TRUE';
    
    const [users, countResult] = await Promise.all([
      db.query(sql, [limit, offset]),
      db.query(countSql)
    ]);
    
    return {
      users,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }
  
  // Verify password
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = UserModel;