// src/controllers/authController.js
const AuthService = require('../services/authService');
const UserModel = require('../models/UserModel');
const { 
  registerValidation, 
  loginValidation,
  updateProfileValidation,
  paginationValidation 
} = require('../validators/userValidator');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    // Validate input
    const { error } = registerValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }
    
    const { user, token } = await AuthService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Validate input
    const { error } = loginValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }
    
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  } catch (error) {
    logger.error('Login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
    
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    await AuthService.logout(token);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.logoutAllDevices = async (req, res, next) => {
  try {
    await AuthService.logoutAllDevices(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    // Validate input
    const { error } = updateProfileValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }
    
    const updated = await UserModel.update(req.user.id, req.body);
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No changes made or user not found'
      });
    }
    
    const user = await UserModel.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { error, value } = paginationValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }
    
    const { page, limit } = value;
    const result = await UserModel.findAll(page, limit);
    
    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const deleted = await UserModel.delete(userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Also delete all sessions for this user
    await SessionModel.deleteAllUserSessions(userId);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};