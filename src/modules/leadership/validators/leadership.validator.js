// validators/leadership.validator.js

import Joi from "joi";

export const createLeadershipValidator = Joi.object({
  initials: Joi.string().trim().required().messages({
    "string.empty": "Initials are required",
    "any.required": "Initials are required",
  }),

  initialsArabic: Joi.string().trim().required().messages({
    "string.empty": "Arabic initials are required",
    "any.required": "Arabic initials are required",
  }),

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

  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),

  descriptionArabic: Joi.string().trim().required().messages({
    "string.empty": "Arabic description is required",
    "any.required": "Arabic description is required",
  }),
});

export const updateLeadershipValidator = Joi.object({
  initials: Joi.string().trim(),

  initialsArabic: Joi.string().trim(),

  name: Joi.string().trim(),

  nameArabic: Joi.string().trim(),

  title: Joi.string().trim(),

  titleArabic: Joi.string().trim(),

  description: Joi.string().trim(),

  descriptionArabic: Joi.string().trim(),
});