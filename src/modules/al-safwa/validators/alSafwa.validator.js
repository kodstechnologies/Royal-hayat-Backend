import Joi from "joi";

const createAlSafwaSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().min(6).max(20).required(),
  age: Joi.string().trim().min(1).max(10).required(),
  gender: Joi.string().trim().min(1).max(30).required(),
  notes: Joi.string().trim().min(1).max(2000).required(),
  isActive: Joi.boolean().default(true),
});

const getAlSafwaListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().min(2).max(100).optional(),
  isViewed: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false"))
    .optional()
    .custom((value) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    }),
  sortBy: Joi.string()
    .valid("name", "email", "createdAt", "isViewed")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const alSafwaIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

export { createAlSafwaSchema, getAlSafwaListSchema, alSafwaIdSchema };
