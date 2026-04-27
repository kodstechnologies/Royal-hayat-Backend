import jobApplicationService from '../services/jobApplication.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import {
  createJobApplicationSchema,
  getJobApplicationsSchema,
  updateJobApplicationSchema,
  jobApplicationIdSchema
} from '../validators/jobApplication.validator.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import { uploadToCloudinary } from '../../../utils/cloudinary.js';
import fs from 'fs-extra';

const createJobApplication = asyncHandler(async (req, res) => {
  // Handle file upload
  let resumeUrl = '';
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, 'royale-hayat/resumes');
      resumeUrl = result.url;
      
      // Clean up temp file
      await fs.remove(req.file.path);
    } catch (error) {
      // Clean up temp file on error
      if (req.file && req.file.path) {
        await fs.remove(req.file.path);
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload resume');
    }
  }

  // Convert form data
  const formData = { ...req.body, resume };
  
  // Validate input
  const { error, value } = createJobApplicationSchema.validate(formData, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  await jobApplicationService.createJobApplication(value);
  
  res.status(201).json({
    success: true,
    message: 'Job application submitted successfully',
    data: null
  });
});

const getAllJobApplications = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { error, value } = getJobApplicationsSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const result = await jobApplicationService.getAllJobApplications(value);
  
  res.status(200).json({
    success: true,
    message: 'Job applications fetched successfully',
    data: result.applications,
    meta: result.meta
  });
});

const getJobApplicationById = asyncHandler(async (req, res) => {
  // Validate application ID
  const { error, value } = jobApplicationIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const application = await jobApplicationService.getJobApplicationById(value.id);
  
  res.status(200).json({
    success: true,
    message: 'Job application fetched successfully',
    data: application
  });
});

const updateJobApplication = asyncHandler(async (req, res) => {
  // Validate application ID
  const { error: idError, value: idValue } = jobApplicationIdSchema.validate(req.params, { abortEarly: false });
  if (idError) {
    throw new ApiError(httpStatus.BAD_REQUEST, idError.details.map(d => d.message).join(", "));
  }

  // Validate update data
  const { error: dataError, value: dataValue } = updateJobApplicationSchema.validate(req.body, { abortEarly: false });
  if (dataError) {
    throw new ApiError(httpStatus.BAD_REQUEST, dataError.details.map(d => d.message).join(", "));
  }

  const application = await jobApplicationService.updateJobApplication(idValue.id, dataValue);
  
  res.status(200).json({
    success: true,
    message: 'Job application updated successfully',
    data: application
  });
});

const deleteJobApplication = asyncHandler(async (req, res) => {
  // Validate application ID
  const { error, value } = jobApplicationIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  await jobApplicationService.deleteJobApplication(value.id);
  
  res.status(200).json({
    success: true,
    message: 'Job application deleted successfully',
    data: null
  });
});

export {
  createJobApplication,
  getAllJobApplications,
  getJobApplicationById,
  updateJobApplication,
  deleteJobApplication
};
