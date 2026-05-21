import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import identityService from '../services/identity.service.js';
import { dataParamsSchema, startIdentitySchema, statusParamsSchema } from '../validators/identity.validator.js';
import { identityLog, identityLogJson } from '../utils/identity.logger.js';

const startIdentityVerification = asyncHandler(async (req, res) => {
  identityLog('start', 'controller: validating start request');

  const { error, value } = startIdentitySchema.validate(req.body, { abortEarly: false });
  if (error) {
    identityLog('start', 'controller: validation failed', error.details.map((d) => d.message));
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  identityLog('start', `controller: civilId=${value.civilId} calling service`);
  const result = await identityService.startIdentityVerification(value);
  identityLogJson('start', 'controller: success response', result);

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

  identityLog('status', `controller: operationId=${value.operationId}`);
  const result = await identityService.getIdentityStatus(value.operationId);
  identityLogJson('status', 'controller: result', result);

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
  identityLog('callback', 'controller: handler entered');
  identityLogJson('callback', 'controller: req.body', req.body);

  const result = await identityService.handleIdentityCallback(req.body);

  identityLogJson('callback', 'controller: processed result', result);

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
