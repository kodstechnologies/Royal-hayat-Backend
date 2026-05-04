import Joi from 'joi';

const bilingualSchema = Joi.object({
  ar: Joi.string().trim().min(1).required(),
  en: Joi.string().trim().min(1).required()
});

const startIdentitySchema = Joi.object({
  civilId: Joi.string().trim().pattern(/^\d{12}$/).required(),
  callbackUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }).optional(),
  serviceName: bilingualSchema.optional(),
  reason: bilingualSchema.optional()
});

const statusParamsSchema = Joi.object({
  operationId: Joi.string().trim().min(1).required()
});

const dataParamsSchema = Joi.object({
  civilId: Joi.string().trim().pattern(/^\d{12}$/).required()
});

export {
  startIdentitySchema,
  statusParamsSchema,
  dataParamsSchema
};

