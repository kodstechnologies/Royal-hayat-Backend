import Joi from 'joi';

const createCatagorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .required(),

  arabicName: Joi.string()
    .trim()
    .required(),
});

const updateCatagorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .required(),

  arabicName: Joi.string()
    .trim()
    .required(),
});

const getCatagoriesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .default(1),

  limit: Joi.number()
    .integer()
    .default(10),

  search: Joi.string()
    .trim()
    .optional(),

  sortBy: Joi.string()
    .valid('name', 'createdAt', 'updatedAt')
    .default('createdAt'),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
});

const catagoryIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

export {
  createCatagorySchema,
  updateCatagorySchema,
  getCatagoriesSchema,
  catagoryIdSchema,
};
