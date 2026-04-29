import Joi from 'joi';

const createDepartmentSchema = Joi.object({
  departmentId: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().required(),
  image: Joi.string().uri().allow('').optional(),
  subSpecialties: Joi.array().items(Joi.string().trim().max(100)).optional(),
  isActive: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0)
});

const updateDepartmentSchema = Joi.object({
  departmentId: Joi.string().trim().optional(),
  name: Joi.string().trim().optional(),
  description: Joi.string().optional(),
  image: Joi.string().uri().allow('').optional(),
  subSpecialties: Joi.array().items(Joi.string().trim().max(100)).optional(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().min(0).optional()
}).min(1);

const getDepartmentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'order', 'createdAt').default('order'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

const departmentIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentsSchema,
  departmentIdSchema
};
