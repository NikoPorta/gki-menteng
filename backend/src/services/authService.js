// src/services/authService.js
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const SessionModel = require('../models/SessionModel');
const logger = require('../utils/logger');

class AuthService {
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
  
  static async register(userData) {
    // Check if user exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // Create user
    const user = await UserModel.create(userData);
    
    // Generate token
    const token = this.generateToken(user.id);
    
    // Save session
    await SessionModel.create(user.id, token);
    
    return { user, token };
  }
  
  static async login(email, password) {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isValidPassword = await UserModel.verifyPassword(user, password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await UserModel.updateLastLogin(user.id);
    
    // Generate token
    const token = this.generateToken(user.id);
    
    // Save session
    await SessionModel.create(user.id, token);
    
    // Remove password from user object
    delete user.password;
    
    return { user, token };
  }
  
  static async logout(token) {
    return await SessionModel.deleteByToken(token);
  }
  
  static async logoutAllDevices(userId) {
    return await SessionModel.deleteAllUserSessions(userId);
  }
  
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const session = await SessionModel.findByToken(token);
      
      if (!session) {
        throw new Error('Invalid or expired session');
      }
      
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return { user, decoded };
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw error;
    }
  }
}

module.exports = AuthService;