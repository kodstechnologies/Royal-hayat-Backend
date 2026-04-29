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
import { uploadToCloudinary } from '../../../utils/cloudinary.js';
import fs from 'fs-extra';

const createJob = asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = createJobSchema.validate(req.body, { abortEarly: false });
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

  // Validate update data
  const { error: dataError, value: dataValue } = updateJobSchema.validate(req.body, { abortEarly: false });
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

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await jobService.getDepartments();
  
  res.status(200).json({
    success: true,
    message: 'Departments fetched successfully',
    data: departments
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

const getClassifications = asyncHandler(async (req, res) => {
  const classifications = await jobService.getClassifications();
  
  res.status(200).json({
    success: true,
    message: 'Job classifications fetched successfully',
    data: classifications
  });
});

export {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getDepartments,
  getLocations,
  getTypes,
  getClassifications
};
