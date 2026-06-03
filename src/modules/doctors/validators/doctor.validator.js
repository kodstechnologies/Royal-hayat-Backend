import Joi from 'joi';

const objectIdString = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/i);

const stringArray = Joi.array()
  .items(Joi.string().trim().min(1).max(200))
  .optional()
  .default([]);

const stringArrayOptional = Joi.array()
  .items(Joi.string().trim().min(1).max(200))
  .optional();

const createDoctorSchema = Joi.object({
  doctorId: Joi.string().trim().min(1).max(50).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  nameAr: Joi.string().trim().min(2).max(100).required(),
  department: objectIdString.required(),
  subspecialities: stringArray,
  subspecialitiesAr: stringArray,
  title: Joi.string().trim().min(2).max(100).optional(),
  titleAr: Joi.string().trim().min(2).max(100).optional(),
  qualifications: Joi.array().items(Joi.string().trim()).optional(),
  qualificationsAr: Joi.array().items(Joi.string().trim()).optional(),
  expertise: Joi.array().items(Joi.string().trim()).optional(),
  expertiseAr: Joi.array().items(Joi.string().trim()).optional(),
  languages: Joi.array().items(Joi.string().trim()).optional(),
  languagesAr: Joi.array().items(Joi.string().trim()).optional(),
  initials: Joi.string().trim().min(1).max(10).optional(),
  initialsAr: Joi.string().trim().min(1).max(10).optional(),
  availableOnline: Joi.boolean().default(false),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().default(true),
});

const updateDoctorSchema = Joi.object({
  doctorId: Joi.string().trim().min(1).max(50).optional(),
  name: Joi.string().trim().min(2).max(100).optional(),
  nameAr: Joi.string().trim().min(2).max(100).optional(),
  department: objectIdString.optional(),
  subspecialities: stringArrayOptional,
  subspecialitiesAr: stringArrayOptional,
  title: Joi.string().trim().min(2).max(100).optional(),
  titleAr: Joi.string().trim().min(2).max(100).optional(),
  qualifications: Joi.array().items(Joi.string().trim()).optional(),
  qualificationsAr: Joi.array().items(Joi.string().trim()).optional(),
  expertise: Joi.array().items(Joi.string().trim()).optional(),
  expertiseAr: Joi.array().items(Joi.string().trim()).optional(),
  languages: Joi.array().items(Joi.string().trim()).optional(),
  languagesAr: Joi.array().items(Joi.string().trim()).optional(),
  initials: Joi.string().trim().min(1).max(10).optional(),
  initialsAr: Joi.string().trim().min(1).max(10).optional(),
  availableOnline: Joi.boolean().optional(),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const getDoctorsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  department: objectIdString.optional(),
  subspeciality: Joi.string().trim().min(1).max(200).optional(),
  search: Joi.string().trim().min(2).max(100).optional(),
  availableOnline: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid('name', 'nameAr', 'department', 'createdAt')
    .default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

const doctorIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

const departmentSchema = Joi.object({
  department: Joi.alternatives()
    .try(objectIdString, Joi.string().trim().min(2).max(100))
    .required(),
});

const subspecialityIdParamSchema = Joi.object({
  subspecialityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

const getDoctorsBySubspecialityQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
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
