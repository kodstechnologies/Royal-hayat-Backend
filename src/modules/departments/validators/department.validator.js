import Joi from 'joi';

const optionalTrimmedString =
  Joi.string()
    .trim()
    .allow('')
    .optional();

const objectIdPattern =
  /^[0-9a-fA-F]{24}$/;

const stringFieldMessages = {
  'any.required': '{{#label}} is required',
  'string.empty': '{{#label}} is required',
};

const customExplainantionItemSchema =
  Joi.object({

    heading:
      optionalTrimmedString,

    subHeading:
      optionalTrimmedString,

    explaination: Joi.array()
      .items(
        Joi.string()
          .trim()
      )
      .optional()
      .default([]),

    arabicHeading:
      optionalTrimmedString,

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
      .required()
      .label('Department ID'),

    deptTagline:
      optionalTrimmedString
        .label('Department tagline'),

    deptTaglineArabic:
      optionalTrimmedString
        .label('Arabic department tagline'),

    doctorTagline:
      optionalTrimmedString
        .label('Doctor tagline'),

    doctorTaglineArabic:
      optionalTrimmedString
        .label('Arabic doctor tagline'),

    name: Joi.string()
      .trim()
      .required()
      .label('Name'),

    description: Joi.string()
      .trim()
      .required()
      .label('Description')
      .messages(stringFieldMessages),

    arabicName:
      Joi.string()
        .trim()
        .required()
        .label('Arabic name'),

    arabicDescription:
      Joi.string()
        .trim()
        .required()
        .label('Arabic description')
        .messages(stringFieldMessages),

    medicalField:
      optionalTrimmedString
        .label('Medical field'),

    medicalFieldAr:
      optionalTrimmedString
        .label('Arabic medical field'),

    catagory: Joi.string()
      .pattern(
        objectIdPattern
      )
      .required()
      .label('Category')
      .messages({
        'any.required': 'Category is required',
        'string.pattern.base': 'Category is invalid',
      }),

    image: Joi.string()
      .uri()
      .allow('')
      .optional(),

    customExplainantions:
      Joi.array()
        .items(
          customExplainantionItemSchema
        )
        .optional()
        .default([]),

    isActive:
      Joi.boolean().default(
        true
      ),

    order: Joi.number()
      .integer()
      .default(0),
  });

const updateDepartmentSchema =
  Joi.object({
    departmentId:
      Joi.string()
        .trim()
        .optional(),

    deptTagline:
      optionalTrimmedString
        .label('Department tagline'),

    deptTaglineArabic:
      optionalTrimmedString
        .label('Arabic department tagline'),

    doctorTagline:
      optionalTrimmedString
        .label('Doctor tagline'),

    doctorTaglineArabic:
      optionalTrimmedString
        .label('Arabic doctor tagline'),

    name: Joi.string()
      .trim()
      .optional(),

    description:
      Joi.string()
        .trim()
        .optional()
        .label('Description')
        .messages(stringFieldMessages),

    arabicName:
      Joi.string()
        .trim()
        .optional()
        .label('Arabic name'),

    arabicDescription:
      Joi.string()
        .trim()
        .optional()
        .label('Arabic description')
        .messages(stringFieldMessages),

    medicalField:
      optionalTrimmedString
        .label('Medical field'),

    medicalFieldAr:
      optionalTrimmedString
        .label('Arabic medical field'),

    catagory: Joi.string()
      .pattern(
        objectIdPattern
      )
      .optional(),

    image: Joi.string()
      .uri()
      .allow('')
      .optional(),

    customExplainantions:
      Joi.array()
        .items(
          customExplainantionItemSchema
        )
        .optional(),

    isActive:
      Joi.boolean().optional(),

    order: Joi.number()
      .integer()
      .optional(),
  });

const getDepartmentsSchema =
  Joi.object({
    page: Joi.number()
      .integer()
      .default(1),

    limit: Joi.number()
      .integer()
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

const departmentParamSchema =
  Joi.object({
    id: Joi.string()
      .trim()
      .required(),
  });

export {
  createDepartmentSchema,

  updateDepartmentSchema,

  getDepartmentsSchema,

  departmentIdSchema,

  departmentParamSchema,
};
