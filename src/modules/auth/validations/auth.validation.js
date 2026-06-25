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

const managedRoleSchema = Joi.string()
  .trim()
  .min(2)
  .max(50)
  .custom((value, helpers) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

    if (normalized === 'admin') {
      return helpers.error('any.invalid');
    }

    if (!/^[a-z][a-z0-9_]{0,49}$/.test(normalized)) {
      return helpers.error('string.pattern.base');
    }

    return normalized;
  })
  .messages({
    'any.invalid': 'Admin role cannot be assigned to managed users',
    'string.pattern.base':
      'Role must start with a letter and contain only letters, numbers, and underscores',
  });

export const createSubadminSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(50).required(),
  role: managedRoleSchema.required(),
  permissions: Joi.array().items(Joi.string().trim()).min(1).required(),
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
  role: managedRoleSchema,
  permissions: Joi.array().items(Joi.string().trim()),
  isActive: Joi.boolean(),
}).min(1);

export const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').optional(),
});