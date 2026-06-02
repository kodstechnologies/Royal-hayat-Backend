import Joi from "joi";


const createAlSafwaSchema = Joi.object({
  firstName: Joi.string().allow("").optional(),
  familyName: Joi.string().allow("").optional(),
  gender: Joi.string().allow("").optional(),
  dateOfBirth: Joi.any().optional(),
  mobile: Joi.string().allow("").optional(),
  email: Joi.string().allow("").optional(),
  preferredAppointmentDate: Joi.any().optional(),
  previousMedicalCheckup: Joi.string().allow("").optional(),
  diabetes: Joi.string().allow("").optional(),
  highCholesterol: Joi.string().allow("").optional(),
  bronchialAsthma: Joi.string().allow("").optional(),
  hypertension: Joi.string().allow("").optional(),
  heartDisease: Joi.string().allow("").optional(),
  overweightObesity: Joi.string().allow("").optional(),
  smoker: Joi.string().allow("").optional(),
  alcohol: Joi.string().allow("").optional(),
  isActive: Joi.boolean().default(true),
}).unknown(true);

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
    .valid("firstName", "familyName", "mobile", "email", "createdAt", "isViewed")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const alSafwaIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

export { createAlSafwaSchema, getAlSafwaListSchema, alSafwaIdSchema };
