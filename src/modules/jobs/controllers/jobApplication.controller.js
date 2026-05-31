import jobApplicationService from '../services/jobApplication.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import {
  applyJobApplicationSchema,
  getJobApplicationsSchema,
  updateJobApplicationSchema,
  jobApplicationIdSchema,
  jobIdParamSchema,
  getApplicationsByJobIdQuerySchema
} from '../validators/jobApplication.validator.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

const createJobApplication = asyncHandler(async (req, res) => {
  const { error, value } = applyJobApplicationSchema.validate(req.body, {
    abortEarly: false
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Resume is required');
  }

  await jobApplicationService.createJobApplication(value, req.file);

  res.status(201).json({
    success: true,
    message: 'Job application submitted successfully',
    data: null
  });
});

const getAllJobApplications = asyncHandler(async (req, res) => {
  const { error, value } = getJobApplicationsSchema.validate(req.query, {
    abortEarly: false
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
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
  const { error, value } = jobApplicationIdSchema.validate(req.params, {
    abortEarly: false
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  const application = await jobApplicationService.getJobApplicationById(
    value.id
  );

  res.status(200).json({
    success: true,
    message: 'Job application fetched successfully',
    data: application
  });
});

const updateJobApplication = asyncHandler(async (req, res) => {
  const { error: idError, value: idValue } = jobApplicationIdSchema.validate(
    req.params,
    { abortEarly: false }
  );
  if (idError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      idError.details.map((d) => d.message).join(', ')
    );
  }

  const { error: dataError, value: dataValue } =
    updateJobApplicationSchema.validate(req.body, { abortEarly: false });
  if (dataError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      dataError.details.map((d) => d.message).join(', ')
    );
  }

  const application = await jobApplicationService.updateJobApplication(
    idValue.id,
    dataValue
  );

  res.status(200).json({
    success: true,
    message: 'Job application updated successfully',
    data: application
  });
});

const deleteJobApplication = asyncHandler(async (req, res) => {
  const { error, value } = jobApplicationIdSchema.validate(req.params, {
    abortEarly: false
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  await jobApplicationService.deleteJobApplication(value.id);

  res.status(200).json({
    success: true,
    message: 'Job application deleted successfully',
    data: null
  });
});

const getApplicationsByJobId = asyncHandler(async (req, res) => {
  const paramsValidation = jobIdParamSchema.validate(req.params, {
    abortEarly: false
  });
  if (paramsValidation.error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      paramsValidation.error.details.map((d) => d.message).join(', ')
    );
  }

  const queryValidation = getApplicationsByJobIdQuerySchema.validate(req.query, {
    abortEarly: false
  });
  if (queryValidation.error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      queryValidation.error.details.map((d) => d.message).join(', ')
    );
  }

  const { applications, counts } =
    await jobApplicationService.getApplicationsByJobId(
      paramsValidation.value.jobId,
      queryValidation.value
    );

  res.status(200).json({
    success: true,
    message: 'Applications for job fetched successfully',
    data: applications,
    meta: {
      counts
    }
  });
});

export {
  createJobApplication,
  getAllJobApplications,
  getJobApplicationById,
  getApplicationsByJobId,
  updateJobApplication,
  deleteJobApplication
};
