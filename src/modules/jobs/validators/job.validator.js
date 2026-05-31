import Joi from 'joi';

const createJobSchema = Joi.object({
  jobId: Joi.string().trim().pattern(/^JA-\d{3,}$/).optional(),
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  classification: Joi.string().trim().min(2).max(100).required(),
  location: Joi.string().trim().min(2).max(100).required(),
  type: Joi.string().valid('Full-time', 'Part-time', 'Contract').required(),
  responsibilities: Joi.array().items(Joi.string().trim().max(500)).min(1).required(),
  requirements: Joi.array().items(Joi.string().trim().max(500)).min(1).required(),
  // Arabic fields — optional
  arabicTitle: Joi.string().trim().max(200).optional().allow(''),
  arabicDescription: Joi.string().trim().max(2000).optional().allow(''),
  arabicLocation: Joi.string().trim().max(100).optional().allow(''),
  arabicResponsibilities: Joi.array().items(Joi.string().trim().max(500)).optional(),
  arabicRequirements: Joi.array().items(Joi.string().trim().max(500)).optional(),
  education: Joi.string().trim().max(200).optional(),
  professionalExperience: Joi.string().trim().max(200).optional(),
  specializedKnowledge: Joi.array().items(Joi.string().trim().max(100)).optional(),
  computerLiteracy: Joi.boolean().optional(),
  languages: Joi.array().items(Joi.string().trim().max(50)).optional(),
  postedDate: Joi.date().optional(),
  closingDate: Joi.date().optional(),
  urgency: Joi.string().valid('immediate', 'urgent', 'normal').optional(),
  isActive: Joi.boolean().default(true)
});

const updateJobSchema = Joi.object({
  jobId: Joi.string().trim().pattern(/^JA-\d{3,}$/).optional(),
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  classification: Joi.string().trim().min(2).max(100).optional(),
  location: Joi.string().trim().min(2).max(100).optional(),
  type: Joi.string().valid('Full-time', 'Part-time', 'Contract').optional(),
  responsibilities: Joi.array().items(Joi.string().trim().max(500)).min(1).optional(),
  requirements: Joi.array().items(Joi.string().trim().max(500)).min(1).optional(),
  // Arabic fields — optional
  arabicTitle: Joi.string().trim().max(200).optional().allow(''),
  arabicDescription: Joi.string().trim().max(2000).optional().allow(''),
  arabicLocation: Joi.string().trim().max(100).optional().allow(''),
  arabicResponsibilities: Joi.array().items(Joi.string().trim().max(500)).optional(),
  arabicRequirements: Joi.array().items(Joi.string().trim().max(500)).optional(),
  education: Joi.string().trim().max(200).optional(),
  professionalExperience: Joi.string().trim().max(200).optional(),
  specializedKnowledge: Joi.array().items(Joi.string().trim().max(100)).optional(),
  computerLiteracy: Joi.boolean().optional(),
  languages: Joi.array().items(Joi.string().trim().max(50)).optional(),
  postedDate: Joi.date().optional(),
  closingDate: Joi.date().optional(),
  urgency: Joi.string().valid('immediate', 'urgent', 'normal').optional(),
  salary: Joi.string().trim().max(100).optional(),
  isActive: Joi.boolean().optional(),
  contactEmail: Joi.string().email().max(100).optional()
}).min(1);

const getJobsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().min(1).max(100).optional(),
  classification: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  type: Joi.string().valid('Full-time', 'Part-time', 'Contract').optional(),
  urgency: Joi.string().valid('immediate', 'urgent', 'normal').optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('postedDate', 'classification', 'location', 'urgency').default('postedDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const jobIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export {
  createJobSchema,
  updateJobSchema,
  getJobsSchema,
  jobIdSchema
};
