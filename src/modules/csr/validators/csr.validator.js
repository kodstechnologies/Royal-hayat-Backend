
import Joi from "joi";

export const createCSRValidator = Joi.object({
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

  subheading: Joi.string().trim().required().messages({
    "string.base": "Subheading must be a string",
    "string.empty": "Subheading is required",
    "any.required": "Subheading is required",
  }),

  subheadingArabic: Joi.string().trim().required().messages({
    "string.base": "Arabic subheading must be a string",
    "string.empty": "Arabic subheading is required",
    "any.required": "Arabic subheading is required",
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

  images: Joi.array().items(Joi.string().uri()).optional(),
  imagesKey: Joi.array().items(Joi.string()).optional(),
});

export const updateCSRValidator = Joi.object({
  heading: Joi.string().trim().messages({
    "string.base": "Heading must be a string",
  }),

  headingArabic: Joi.string().trim().messages({
    "string.base": "Arabic heading must be a string",
  }),

  subheading: Joi.string().trim().messages({
    "string.base": "Subheading must be a string",
  }),

  subheadingArabic: Joi.string().trim().messages({
    "string.base": "Arabic subheading must be a string",
  }),

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

  images: Joi.array().items(Joi.string().uri()).optional(),
  imagesKey: Joi.array().items(Joi.string()).optional(),

  existingImages: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().uri()),
      Joi.array().items(Joi.string().allow("")),
      Joi.string().uri(),
      Joi.string().allow("")
    )
    .optional(),
}).unknown(true);