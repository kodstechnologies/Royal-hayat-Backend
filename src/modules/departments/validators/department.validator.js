import Joi from 'joi';

const optionalTrimmedString =
  Joi.string()
    .trim()
    .allow('')
    .optional();

const objectIdPattern =
  /^[0-9a-fA-F]{24}$/;

const customExplainantionItemSchema =
  Joi.object({
    // ENGLISH

    subHeading:
      optionalTrimmedString,

    explaination: Joi.array()
      .items(
        Joi.string()
          .trim()
      )
      .optional()
      .default([]),

    // ARABIC

    arabicSubHeading:
      optionalTrimmedString,

    arabicExplaination:
      Joi.array()
        .items(
          Joi.string()
            .trim()
        )
        .optional()
        .default([]),
  });

const createDepartmentSchema =
  Joi.object({
    departmentId: Joi.string()
      .trim()
      .required(),

    // ENGLISH

    name: Joi.string()
      .trim()
      .required(),

    description: Joi.string()
      .trim()
      .required(),

    subSpecialties:
      Joi.array()
        .items(
          Joi.string()
            .trim()
            .max(100)
        )
        .optional(),

    // ARABIC

    arabicName:
      Joi.string()
        .trim()
        .required(),

    arabicDescription:
      Joi.string()
        .trim()
        .required(),

    arabicSubSpecialties:
      Joi.array()
        .items(
          Joi.string()
            .trim()
            .max(100)
        )
        .optional(),

    // CATEGORY

    catagory: Joi.string()
      .pattern(
        objectIdPattern
      )
      .required(),

    // SUBSPECIALITIES

    subspecialities:
      Joi.array()
        .items(
          Joi.string()
            .trim()
            .pattern(
              objectIdPattern
            )
        )
        .unique()
        .optional()
        .default([]),

    // IMAGE

    image: Joi.string()
      .uri()
      .allow('')
      .optional(),

    // CUSTOM EXPLANATIONS

    customExplainantions:
      Joi.array()
        .items(
          customExplainantionItemSchema
        )
        .optional()
        .default([]),

    // STATUS

    isActive:
      Joi.boolean().default(
        true
      ),

    order: Joi.number()
      .integer()
      .min(0)
      .default(0),
  });

const updateDepartmentSchema =
  Joi.object({
    departmentId:
      Joi.string()
        .trim()
        .optional(),

    // ENGLISH

    name: Joi.string()
      .trim()
      .optional(),

    description:
      Joi.string()
        .trim()
        .optional(),

    subSpecialties:
      Joi.array()
        .items(
          Joi.string()
            .trim()
            .max(100)
        )
        .optional(),

    // ARABIC

    arabicName:
      Joi.string()
        .trim()
        .optional(),

    arabicDescription:
      Joi.string()
        .trim()
        .optional(),

    arabicSubSpecialties:
      Joi.array()
        .items(
          Joi.string()
            .trim()
            .max(100)
        )
        .optional(),

    // CATEGORY

    catagory: Joi.string()
      .pattern(
        objectIdPattern
      )
      .optional(),

    // SUBSPECIALITIES

    subspecialities:
      Joi.array()
        .items(
          Joi.string()
            .trim()
            .pattern(
              objectIdPattern
            )
        )
        .unique()
        .optional(),

    // IMAGE

    image: Joi.string()
      .uri()
      .allow('')
      .optional(),

    // CUSTOM EXPLANATIONS

    customExplainantions:
      Joi.array()
        .items(
          customExplainantionItemSchema
        )
        .optional(),

    // STATUS

    isActive:
      Joi.boolean().optional(),

    order: Joi.number()
      .integer()
      .min(0)
      .optional(),
  }).min(1);

const getDepartmentsSchema =
  Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),

    isActive:
      Joi.boolean().optional(),

    search: Joi.string()
      .trim()
      .optional(),

    sortBy: Joi.string()
      .valid(
        'name',
        'arabicName',
        'order',
        'createdAt'
      )
      .default('order'),

    sortOrder:
      Joi.string()
        .valid(
          'asc',
          'desc'
        )
        .default('asc'),
  });

const departmentIdSchema =
  Joi.object({
    id: Joi.string()
      .pattern(
        objectIdPattern
      )
      .required(),
  });

export {
  createDepartmentSchema,

  updateDepartmentSchema,

  getDepartmentsSchema,

  departmentIdSchema,
};