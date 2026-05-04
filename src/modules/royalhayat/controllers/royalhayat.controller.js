import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import royalHayatService from '../services/royalhayat.service.js';
import {
  availabilitySchema,
  bookAppointmentSchema,
  patientSchema,
  specialitiesSchema,
  careProvidersSchema
} from '../validators/royalhayat.validator.js';

const getAvailability = asyncHandler(async (req, res) => {
  const { error, value } = availabilitySchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await royalHayatService.getAvailability(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Availability fetched successfully',
    data: result
  });
});

const bookAppointment = asyncHandler(async (req, res) => {
  const { error, value } = bookAppointmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await royalHayatService.bookAppointment(value.patientId, value.slotBookingId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booked successfully',
    data: result
  });
});

const getPatient = asyncHandler(async (req, res) => {
  const { error, value } = patientSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await royalHayatService.getPatient(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Patient data fetched successfully',
    data: result
  });
});

const getSpecialities = asyncHandler(async (req, res) => {
  const { error, value } = specialitiesSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await royalHayatService.getSpecialities(value.hospitalCode);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Specialities fetched successfully',
    data: result
  });
});

const getCareProviders = asyncHandler(async (req, res) => {
  const { error, value } = careProvidersSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await royalHayatService.getCareProviders(value.specialityCode);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Care providers fetched successfully',
    data: result
  });
});

const getAuthToken = asyncHandler(async (req, res) => {
  const token = await royalHayatService.getAuthToken();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Auth token retrieved successfully',
    data: {
      token,
      expiresIn: token ? 3600 : null
    }
  });
});

// New endpoint for book appointment flow
const initializeAppointmentFlow = asyncHandler(async (req, res) => {
  const { error, value } = patientSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  // Get token first (this will cache it)
  const token = await royalHayatService.getAuthToken();
  
  // Then validate patient
  const patientResult = await royalHayatService.getPatient(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Patient validated and token retrieved successfully',
    data: {
      patient: patientResult.patient,
      tokenRetrieved: true,
      expiresIn: token ? 3600 : null
    }
  });
});

export {
  getAvailability,
  bookAppointment,
  getPatient,
  getSpecialities,
  getCareProviders,
  getAuthToken,
  initializeAppointmentFlow
};
