import jobService from '../services/job.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import {
  createJobSchema,
  updateJobSchema,
  getJobsSchema,
  jobIdSchema
} from '../validators/job.validator.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

const ARRAY_FIELDS = [
  'responsibilities',
  'arabicResponsibilities',
  'requirements',
  'arabicRequirements',
];

const normalizeJobBody = (body = {}) => {
  const formData = { ...body };

  ARRAY_FIELDS.forEach((key) => {
    if (formData[key] && typeof formData[key] === 'string') {
      try {
        formData[key] = JSON.parse(formData[key]);
      } catch {
        formData[key] = [formData[key]];
      }
    }
  });

  if (formData.isActive !== undefined) {
    formData.isActive =
      formData.isActive === 'true' || formData.isActive === true;
  }

  return formData;
};

const createJob = asyncHandler(async (req, res) => {
  const formData = normalizeJobBody(req.body);

  const { error, value } =
    createJobSchema.validate(
      formData,
      {
        abortEarly: false,
      }
    );
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const job = await jobService.createJob(value);

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: job
  });
});

const getAllJobs = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { error, value } = getJobsSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const result = await jobService.getAllJobs(value);

  res.status(200).json({
    success: true,
    message: 'Jobs fetched successfully',
    data: result.jobs,
    meta: result.meta
  });
});

const getJobById = asyncHandler(async (req, res) => {
  // Validate job ID
  const { error, value } = jobIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const job = await jobService.getJobById(value.id);

  res.status(200).json({
    success: true,
    message: 'Job fetched successfully',
    data: job
  });
});

const updateJob = asyncHandler(async (req, res) => {
  // Validate job ID
  const { error: idError, value: idValue } = jobIdSchema.validate(req.params, { abortEarly: false });
  if (idError) {
    throw new ApiError(httpStatus.BAD_REQUEST, idError.details.map(d => d.message).join(", "));
  }

  const formData = normalizeJobBody(req.body);

  const { error: dataError, value: dataValue } = updateJobSchema.validate(formData, { abortEarly: false });
  if (dataError) {
    throw new ApiError(httpStatus.BAD_REQUEST, dataError.details.map(d => d.message).join(", "));
  }

  const job = await jobService.updateJob(idValue.id, dataValue);

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: job
  });
});

const deleteJob = asyncHandler(async (req, res) => {
  // Validate job ID
  const { error, value } = jobIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  await jobService.deleteJob(value.id);

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
    data: null
  });
});

const getArabicLocations = asyncHandler(async (req, res) => {

  const locations =
    await jobService.getArabicLocations();

  res.status(200).json({
    success: true,

    message:
      'Arabic locations fetched successfully',

    data: locations,
  });
});

const getLocations = asyncHandler(async (req, res) => {
  const locations = await jobService.getLocations();

  res.status(200).json({
    success: true,
    message: 'Locations fetched successfully',
    data: locations
  });
});

const getTypes = asyncHandler(async (req, res) => {
  const types = await jobService.getTypes();

  res.status(200).json({
    success: true,
    message: 'Job types fetched successfully',
    data: types
  });
});

export {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,

  getLocations,
  getTypes,
  getArabicLocations
};
