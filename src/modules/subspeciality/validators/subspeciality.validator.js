import Joi from 'joi';

const createSubspecialitySchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).max(5000).required(),
});

const updateSubspecialitySchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().min(1).max(5000).optional(),
}).min(1);

const getSubspecialitiesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().min(1).max(200).optional(),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const subspecialityIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

export {
  createSubspecialitySchema,
  updateSubspecialitySchema,
  getSubspecialitiesSchema,
  subspecialityIdSchema,
};
