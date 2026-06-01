import Joi from "joi";

const createInternationalPatientEnquirySchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().min(6).max(30).optional(),
  mobile: Joi.string().trim().min(6).max(30).optional(),
  country: Joi.string().trim().max(100).allow("").optional(),
  address: Joi.string().trim().max(500).allow("").optional(),
  comments: Joi.string().trim().max(2000).allow("").optional(),
  isActive: Joi.boolean().default(true),
}).or("phone", "mobile");

const getInternationalPatientEnquiryListSchema = Joi.object({
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
    .valid("firstName", "lastName", "email", "createdAt", "isViewed")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const internationalPatientEnquiryIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

export {
  createInternationalPatientEnquirySchema,
  getInternationalPatientEnquiryListSchema,
  internationalPatientEnquiryIdSchema,
};
