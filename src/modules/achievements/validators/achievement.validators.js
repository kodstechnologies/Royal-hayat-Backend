import Joi from "joi";

const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
  "string.pattern.base": "Invalid achievement ID",
});

export const createAchievementValidator = Joi.object({
  employeeId: Joi.string().trim().optional(),
  employeeID: Joi.string().trim().optional(),

  employeeName: Joi.string().trim().required().messages({
    "string.empty": "Employee name is required",
    "any.required": "Employee name is required",
  }),
  employeeNameArabic: Joi.string().trim().optional().allow(""),

  department: Joi.string().trim().optional().allow(""),
  arabicDepartment: Joi.string().trim().optional().allow(""),

  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  arabicTitle: Joi.string().trim().optional().allow(""),
  arabictitle: Joi.string().trim().optional().allow(""),

  achievements: Joi.string().trim().required().messages({
    "string.empty": "Achievement description is required",
    "any.required": "Achievement description is required",
  }),
  arabicAchievements: Joi.string().trim().optional().allow(""),
  arabicachievements: Joi.string().trim().optional().allow(""),

  visibilityStatus: Joi.string().valid("show", "hide").default("show"),

  date: Joi.date().optional().allow(null, ""),

  image: Joi.any().optional(),
  imageKey: Joi.string().optional(),
}).or("employeeId", "employeeID");

export const updateAchievementValidator = Joi.object({
  employeeId: Joi.string().trim().optional(),
  employeeID: Joi.string().trim().optional(),

  employeeName: Joi.string().trim().optional(),
  employeeNameArabic: Joi.string().trim().optional().allow(""),

  department: Joi.string().trim().optional().allow(""),
  arabicDepartment: Joi.string().trim().optional().allow(""),

  title: Joi.string().trim().optional(),
  arabicTitle: Joi.string().trim().optional().allow(""),
  arabictitle: Joi.string().trim().optional().allow(""),

  achievements: Joi.string().trim().optional(),
  arabicAchievements: Joi.string().trim().optional().allow(""),
  arabicachievements: Joi.string().trim().optional().allow(""),

  visibilityStatus: Joi.string().valid("show", "hide").optional(),

  date: Joi.date().optional().allow(null, ""),

  image: Joi.any().optional(),
  imageKey: Joi.string().optional(),
}).min(1);

export const achievementIdValidator = Joi.object({
  id: objectIdSchema,
});

export const getAchievementsQueryValidator = Joi.object({
  visibilityStatus: Joi.string().valid("show", "hide").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
