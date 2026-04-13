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
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});
