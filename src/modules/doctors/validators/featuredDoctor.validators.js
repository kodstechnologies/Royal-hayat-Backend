
import Joi from 'joi';

const objectIdString = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/i);

export const createFeaturedDoctorValidator = Joi.object({
  doctor: objectIdString.required().messages({
    'string.empty': 'Doctor ID is required',
    'any.required': 'Doctor ID is required',
  }),
});

export const syncFeaturedDoctorsValidator = Joi.object({
  doctorIds: Joi.array().items(objectIdString).default([]),
});
