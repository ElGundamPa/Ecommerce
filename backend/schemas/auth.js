const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas no coinciden'
  }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: Joi.date().max('now').optional()
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required()
});

const resetPassword = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas no coinciden'
  })
});

const changePassword = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required(),
  newPassword: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Las contraseñas no coinciden'
  })
});

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  address: Joi.object({
    street: Joi.string().max(200).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional()
  }).optional()
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile
};
