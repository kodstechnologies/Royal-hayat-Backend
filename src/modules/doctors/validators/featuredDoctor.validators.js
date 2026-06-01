
import Joi from "joi";

export const createFeaturedDoctorValidator = Joi.object({
  doctor: Joi.string().trim().required().messages({
    "string.empty": "Doctor ID is required",
    "any.required": "Doctor ID is required",
  }),
});

export const updateFeaturedDoctorValidator = Joi.object({
  doctor: Joi.string().trim().required().messages({
    "string.empty": "Doctor ID is required",
    "any.required": "Doctor ID is required",
  }),
});