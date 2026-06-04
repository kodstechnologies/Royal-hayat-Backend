import Joi from 'joi';

const availabilitySchema = Joi.object({
  specialitycode: Joi.string().trim().min(1).required(),
  providercode: Joi.string().trim().min(1).required(),
  servicecode: Joi.string().trim().min(1).required(),
  datefrom: Joi.string().trim().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  dateto: Joi.string().trim().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timefrom: Joi.string().trim().pattern(/^\d{2}:\d{2}$/).optional(),
  timeto: Joi.string().trim().pattern(/^\d{2}:\d{2}$/).optional(),
  dow: Joi.string().trim().pattern(/^[1-7]{1,7}$/).optional()
});

const bookAppointmentSchema = Joi.object({
  patientId: Joi.string().trim().min(1).required(),
  slotBookingId: Joi.string().trim().min(1).required(),
  doctorId: Joi.string().trim().optional(),
  date: Joi.string().trim().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  slotTime: Joi.string().trim().optional(),
});

const patientSchema = Joi.object({
  urn: Joi.string().trim().max(50).optional(),
  nationalid: Joi.string().trim().max(50).optional()
}).or('urn', 'nationalid');

const specialitiesSchema = Joi.object({
  hospitalCode: Joi.string().trim().min(1).required()
});

const careProvidersSchema = Joi.object({
  specialityCode: Joi.string().trim().min(1).required()
});

export {
  availabilitySchema,
  bookAppointmentSchema,
  patientSchema,
  specialitiesSchema,
  careProvidersSchema
};
