import Joi from 'joi';

export const getMedicalRecordRequestsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').optional(),
  status: Joi.string().valid('all', 'pending', 'received').default('all'),
});
