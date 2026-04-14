import Joi from 'joi';

const createDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  specialty: Joi.string().trim().min(2).max(100).required(),
  department: Joi.string().trim().min(2).max(100).required(),
  title: Joi.string().trim().min(2).max(100).required(),
  bio: Joi.string().min(10).max(2000).required(),
  qualifications: Joi.array().items(Joi.string().trim()).min(1).required(),
  expertise: Joi.array().items(Joi.string().trim()).min(1).required(),
  languages: Joi.array().items(Joi.string().trim()).min(1).required(),
  initials: Joi.string().trim().min(2).max(10).uppercase().required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  symptoms: Joi.array().items(Joi.string().trim()).default([]),
  availableOnline: Joi.boolean().default(false),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().default(true)
});

const updateDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  specialty: Joi.string().trim().min(2).max(100).optional(),
  department: Joi.string().trim().min(2).max(100).optional(),
  title: Joi.string().trim().min(2).max(100).optional(),
  bio: Joi.string().min(10).max(2000).optional(),
  qualifications: Joi.array().items(Joi.string().trim()).min(1).optional(),
  expertise: Joi.array().items(Joi.string().trim()).min(1).optional(),
  languages: Joi.array().items(Joi.string().trim()).min(1).optional(),
  initials: Joi.string().trim().min(2).max(10).uppercase().optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  symptoms: Joi.array().items(Joi.string().trim()).optional(),
  availableOnline: Joi.boolean().optional(),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional()
}).min(1);

const getDoctorsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  department: Joi.string().trim().optional(),
  specialty: Joi.string().trim().optional(),
  search: Joi.string().trim().min(2).max(100).optional(),
  availableOnline: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'specialty', 'department', 'createdAt').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

const doctorIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

const departmentSchema = Joi.object({
  department: Joi.string().trim().min(2).max(100).required()
});

export {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorsSchema,
  doctorIdSchema,
  departmentSchema
};
