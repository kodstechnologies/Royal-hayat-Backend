import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(50).required(),
  role: Joi.string()
    .valid('admin', 'doctor', 'nurse', 'receptionist', 'patient')
    .default('patient'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const sendOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  otp: Joi.string().length(6).required(),
});

export const resetPasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(50).required(),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm new password must match new password',
    }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(6).max(50).allow(''),
  role: Joi.string().trim(),
  permissions: Joi.array().items(Joi.string().trim()),
  isActive: Joi.boolean(),
}).min(1);

export const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});