import Joi from 'joi';

const OID = /^[0-9a-fA-F]{24}$/;

const customSubspecialityBodySchema =
  Joi.object({
    heading: Joi.string()
      .trim()
      .allow('')
      .optional(),

    subHeading: Joi.string()
      .trim()
      .allow('')
      .optional(),

    explanations: Joi.array()
      .items(
        Joi.string()
          .trim()
          .allow('')
      )
      .optional()
      .default([]),

    arabicHeading: Joi.string()
      .trim()
      .allow('')
      .optional(),

    arabicSubHeading: Joi.string()
      .trim()
      .allow('')
      .optional(),

    arabicExplanations: Joi.array()
      .items(
        Joi.string()
          .trim()
          .allow('')
      )
      .optional()
      .default([]),
  });

const customItemSchema = Joi.alternatives().try(
  Joi.string()
    .pattern(OID)
    .messages({
      'string.pattern.base':
        'Each item must be a valid ObjectId or object body',
    }),

  customSubspecialityBodySchema
);

const customSubspecialitiesArray = Joi.array()
  .items(customItemSchema)
  .optional()
  .default([]);
const customSubspecialitiesUpdateField =
  Joi.alternatives()
    .try(
      customSubspecialitiesArray,
      Joi.valid(null)
    )
    .optional();

const createSubspecialitySchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .required(),

    description: Joi.string()
      .trim()
      .required(),

    arabicName: Joi.string()
      .trim()
      .required(),

    arabicDescription: Joi.string()
      .trim()
      .required(),

    department: Joi.string()
      .pattern(OID)
      .required(),

    customSubspecialities:
      customSubspecialitiesArray,
  });

const updateSubspecialitySchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .optional(),

    description: Joi.string()
      .trim()
      .optional(),

    arabicName: Joi.string()
      .trim()
      .optional(),

    arabicDescription: Joi.string()
      .trim()
      .optional(),

    department: Joi.string()
      .pattern(OID)
      .optional(),

    customSubspecialities:
      customSubspecialitiesUpdateField,
  });

const getSubspecialitiesSchema =
  Joi.object({
    page: Joi.number()
      .integer()
      .default(1),

    limit: Joi.number()
      .integer()
      .default(10),

    search: Joi.string()
      .trim()
      .optional(),

    department: Joi.string()
      .pattern(OID)
      .optional(),

    sortBy: Joi.string()
      .valid(
        'name',
        'arabicName',
        'createdAt',
        'updatedAt'
      )
      .default('createdAt'),

    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc'),
  });

const subspecialityIdSchema =
  Joi.object({
    id: Joi.string()
      .pattern(
        /^[0-9a-fA-F]{24}$/
      )
      .required(),
  });

export {
  createSubspecialitySchema,
  updateSubspecialitySchema,
  getSubspecialitiesSchema,
  subspecialityIdSchema,
};
