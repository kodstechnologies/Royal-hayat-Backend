
import Joi from "joi";

export const createLeadershipValidator = Joi.object({
  initials: Joi.string().trim().allow("").optional(),

  initialsArabic: Joi.string().trim().allow("").optional(),

  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  nameArabic: Joi.string().trim().required().messages({
    "string.empty": "Arabic name is required",
    "any.required": "Arabic name is required",
  }),

  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),

  titleArabic: Joi.string().trim().required().messages({
    "string.empty": "Arabic title is required",
    "any.required": "Arabic title is required",
  }),

  description: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      "array.base": "Description must be an array of strings",
      "array.min": "At least one description is required",
      "any.required": "Description is required",
    }),

  descriptionArabic: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      "array.base": "Arabic description must be an array of strings",
      "array.min": "At least one Arabic description is required",
      "any.required": "Arabic description is required",
    }),
});

export const updateLeadershipValidator = Joi.object({
  initials: Joi.string().trim().allow("").optional(),

  initialsArabic: Joi.string().trim().allow("").optional(),

  name: Joi.string().trim(),

  nameArabic: Joi.string().trim(),

  title: Joi.string().trim(),

  titleArabic: Joi.string().trim(),

  description: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .optional()
    .messages({
      "array.base": "Description must be an array of strings",
      "array.min": "At least one description is required",
    }),

  descriptionArabic: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .optional()
    .messages({
      "array.base": "Arabic description must be an array of strings",
      "array.min": "At least one Arabic description is required",
    }),
});