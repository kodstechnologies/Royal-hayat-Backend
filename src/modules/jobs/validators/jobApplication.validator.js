import Joi from 'joi';

const applyJobApplicationSchema = Joi.object({
  jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().trim().max(100).required(),
  phone: Joi.string().trim().min(6).max(20).required(),
  coverLetter: Joi.string().trim().max(5000).optional().allow(''),
  status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'rejected', 'hired').optional()
});

const createJobApplicationSchema = applyJobApplicationSchema.keys({
  resume: Joi.string().trim().required()
});

const getJobApplicationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'rejected', 'hired').optional(),
  jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  sortBy: Joi.string().valid('appliedDate', 'status', 'fullName').default('appliedDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const updateJobApplicationSchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'rejected', 'hired').optional()
}).min(1);

const jobApplicationIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

const jobIdParamSchema = Joi.object({
  jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export {
  applyJobApplicationSchema,
  createJobApplicationSchema,
  getJobApplicationsSchema,
  updateJobApplicationSchema,
  jobApplicationIdSchema,
  jobIdParamSchema
};
