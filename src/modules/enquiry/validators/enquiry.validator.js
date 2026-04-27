import Joi from 'joi';

const createEnquirySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.number().integer().min(1000000000).max(999999999999999).optional(),
  department: Joi.string().trim().min(1).max(100).required(),
  message: Joi.string().trim().min(5).max(2000).required(),
  isActive: Joi.boolean().default(true)
});

const updateEnquirySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.number().integer().min(1000000000).max(999999999999999).optional(),
  department: Joi.string().trim().min(1).max(100).optional(),
  message: Joi.string().trim().min(5).max(2000).optional(),
  isActive: Joi.boolean().optional()
}).min(1);

const getEnquiriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  department: Joi.string().trim().optional(),
  email: Joi.string().trim().email().optional(),
  search: Joi.string().trim().min(2).max(100).optional(),
  sortBy: Joi.string().valid('name', 'department', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const enquiryIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export {
  createEnquirySchema,
  updateEnquirySchema,
  getEnquiriesSchema,
  enquiryIdSchema
};
