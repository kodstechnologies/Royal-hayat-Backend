import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import {
  fetchAllApiLogs,
  fetchApiLogById,
  fetchApiLogsByCivilId,
  fetchApiLogsByPatientId,
  getApiLogStats,
} from '../services/externalApiLog.service.js';

/**
 * Get all API logs with pagination and filters
 * @route GET /api/v1/external-api-logs
 */
export const getAllApiLogs = asyncHandler(async (req, res) => {
  const { rows, meta } = await fetchAllApiLogs(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'API logs fetched successfully',
    data: rows,
    meta,
  });
});

/**
 * Get a single API log by ID
 * @route GET /api/v1/external-api-logs/:id
 */
export const getApiLogById = asyncHandler(async (req, res) => {
  const log = await fetchApiLogById(req.params.id);

  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, 'API log not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'API log fetched successfully',
    data: log,
  });
});

/**
 * Get API logs by civil ID
 * @route GET /api/v1/external-api-logs/civil/:civilId
 */
export const getApiLogsByCivilId = asyncHandler(async (req, res) => {
  const logs = await fetchApiLogsByCivilId(req.params.civilId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'API logs fetched successfully',
    data: logs,
  });
});

/**
 * Get API logs by patient ID
 * @route GET /api/v1/external-api-logs/patient/:patientId
 */
export const getApiLogsByPatientId = asyncHandler(async (req, res) => {
  const logs = await fetchApiLogsByPatientId(req.params.patientId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'API logs fetched successfully',
    data: logs,
  });
});

/**
 * Get API log statistics
 * @route GET /api/v1/external-api-logs/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await getApiLogStats();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'API log statistics fetched successfully',
    data: stats,
  });
});
