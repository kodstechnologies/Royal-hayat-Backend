import Joi from 'joi';

const objectIdString = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/i);

const stringArray = Joi.array()
  .items(Joi.string().trim())
  .optional()
  .default([]);

const stringArrayOptional = Joi.array()
  .items(Joi.string().trim())
  .optional();

const expertiseItemSchema = Joi.alternatives().try(
  objectIdString,
  Joi.object({
    id: objectIdString.optional(),
    _id: objectIdString.optional(),
    subHeading: Joi.string().trim().allow('').optional(),
    subHeadingAr: Joi.string().trim().allow('').optional(),
    points: Joi.array().items(Joi.string().trim()).optional(),
    pointsAr: Joi.array().items(Joi.string().trim()).optional(),
  }),
);

const expertiseArray = Joi.array().items(expertiseItemSchema).optional().default([]);
const expertiseArrayOptional = Joi.array().items(expertiseItemSchema).optional();
const qualificationsArray = Joi.array().items(expertiseItemSchema).optional().default([]);
const qualificationsArrayOptional = Joi.array().items(expertiseItemSchema).optional();

const departmentArray = Joi.array()
  .items(objectIdString)
  .min(1)
  .required();

const departmentArrayOptional = Joi.array()
  .items(objectIdString)
  .min(1)
  .optional();

const createDoctorSchema = Joi.object({
  doctorId: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  nameAr: Joi.string().trim().required(),
  department: departmentArray,
  subspecialities: stringArray,
  subspecialitiesAr: stringArray,
  title: Joi.string().trim().allow('').optional(),
  titleAr: Joi.string().trim().allow('').optional(),
  qualifications: qualificationsArray,
  expertise: expertiseArray,
  languages: Joi.array().items(Joi.string().trim()).optional(),
  languagesAr: Joi.array().items(Joi.string().trim()).optional(),
  availableOnline: Joi.boolean().default(false),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().default(true),
});

const updateDoctorSchema = Joi.object({
  doctorId: Joi.string().trim().optional(),
  name: Joi.string().trim().optional(),
  nameAr: Joi.string().trim().optional(),
  department: departmentArrayOptional,
  subspecialities: stringArrayOptional,
  subspecialitiesAr: stringArrayOptional,
  title: Joi.string().trim().allow('').optional(),
  titleAr: Joi.string().trim().allow('').optional(),
  qualifications: qualificationsArrayOptional,
  expertise: expertiseArrayOptional,
  languages: Joi.array().items(Joi.string().trim()).optional(),
  languagesAr: Joi.array().items(Joi.string().trim()).optional(),
  availableOnline: Joi.boolean().optional(),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
});

const getDoctorsSchema = Joi.object({
  page: Joi.number().integer().default(1),
  limit: Joi.number().integer().default(10),
  department: objectIdString.optional(),
  subspeciality: Joi.string().trim().optional(),
  search: Joi.string().trim().optional(),
  availableOnline: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid('name', 'nameAr', 'department', 'createdAt')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const doctorIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

const departmentSchema = Joi.object({
  department: Joi.alternatives()
    .try(objectIdString, Joi.string().trim())
    .required(),
});

const subspecialityIdParamSchema = Joi.object({
  subspecialityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

const getDoctorsBySubspecialityQuerySchema = Joi.object({
  page: Joi.number().integer().default(1),
  limit: Joi.number().integer().default(10),
  sortBy: Joi.string()
    .valid('name', 'nameAr', 'department', 'createdAt')
    .default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

export {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorsSchema,
  doctorIdSchema,
  departmentSchema,
  subspecialityIdParamSchema,
  getDoctorsBySubspecialityQuerySchema,
};
