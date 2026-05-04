import Joi from 'joi';

const OID = /^[0-9a-fA-F]{24}$/;

/** Body to create/update linked CustomSubspeciality (subHeading + explanations). */
const customSubspecialityBodySchema = Joi.object({
  subHeading: Joi.string().trim().allow('').optional(),
  explanations: Joi.array().items(Joi.string().trim().allow('')).optional(),
}).min(1);

const customItemSchema = Joi.alternatives()
  .try(
    Joi.string().pattern(OID).messages({ 'string.pattern.base': 'Each item must be a valid ObjectId or object body' }),
    customSubspecialityBodySchema,
  )
  .required();

const customSubspecialitiesArray = Joi.array().items(customItemSchema).max(50).optional();

/** Full replace of linked custom blocks; `null` or `[]` clears and deletes linked docs on update. */
const customSubspecialitiesUpdateField = Joi.alternatives()
  .try(customSubspecialitiesArray, Joi.valid(null))
  .optional();

const createSubspecialitySchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).max(5000).required(),
  customSubspecialities: customSubspecialitiesArray,
});

const updateSubspecialitySchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().min(1).max(5000).optional(),
  customSubspecialities: customSubspecialitiesUpdateField,
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
