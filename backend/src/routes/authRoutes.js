// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (requires authentication)
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAllDevices);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

// Admin only routes
router.get('/users', protect, authorize('admin'), authController.getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), authController.deleteUser);

module.exports = router;