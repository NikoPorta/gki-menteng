// src/validators/userValidator.js
const Joi = require('joi');

const registerValidation = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Password must be at least 6 characters'
    }),
  role: Joi.string().valid('user', 'admin').default('user')
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileValidation = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6)
}).min(1);

const paginationValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  paginationValidation,
};