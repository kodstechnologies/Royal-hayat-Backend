import Joi from "joi";

export const createWorkCultureValidator = Joi.object({
  heading: Joi.string().trim().required().messages({
    "string.base": "Heading must be a string",
    "string.empty": "Heading is required",
    "any.required": "Heading is required",
  }),

  headingArabic: Joi.string().trim().required().messages({
    "string.base": "Arabic heading must be a string",
    "string.empty": "Arabic heading is required",
    "any.required": "Arabic heading is required",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),

  descriptionArabic: Joi.string().trim().required().messages({
    "string.base": "Arabic description must be a string",
    "string.empty": "Arabic description is required",
    "any.required": "Arabic description is required",
  }),

  images: Joi.array().items(Joi.string().uri()).optional(),
  imagesKey: Joi.array().items(Joi.string()).optional(),
}).unknown(true);

export const updateWorkCultureValidator = Joi.object({
  heading: Joi.string().trim().messages({
    "string.base": "Heading must be a string",
  }),

  headingArabic: Joi.string().trim().messages({
    "string.base": "Arabic heading must be a string",
  }),

  description: Joi.string().trim().messages({
    "string.base": "Description must be a string",
  }),

  descriptionArabic: Joi.string().trim().messages({
    "string.base": "Arabic description must be a string",
  }),

  existingImages: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().uri()),
      Joi.array().items(Joi.string().allow("")),
      Joi.string().uri(),
      Joi.string().allow("")
    )
    .optional(),
}).unknown(true);