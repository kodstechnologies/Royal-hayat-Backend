import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import identityService from '../services/identity.service.js';
import { dataParamsSchema, startIdentitySchema, statusParamsSchema } from '../validators/identity.validator.js';

const startIdentityVerification = asyncHandler(async (req, res) => {
  const { error, value } = startIdentitySchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await identityService.startIdentityVerification(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Identity verification started successfully',
    data: result
  });
});

const getIdentityStatus = asyncHandler(async (req, res) => {
  const { error, value } = statusParamsSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await identityService.getIdentityStatus(value.operationId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Identity verification status fetched successfully',
    data: result
  });
});

const getIdentityData = asyncHandler(async (req, res) => {
  const { error, value } = dataParamsSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await identityService.getIdentityData(value.civilId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Identity data fetched successfully',
    data: result
  });
});

const identityCallback = asyncHandler(async (req, res) => {
  const result = await identityService.handleIdentityCallback(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Callback received successfully',
    data: result
  });
});

export {
  startIdentityVerification,
  getIdentityStatus,
  getIdentityData,
  identityCallback
};

