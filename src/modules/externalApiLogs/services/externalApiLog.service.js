import ExternalApiLog from '../models/externalApiLog.model.js';

/**
 * Create a new API log entry
 * @param {Object} logData - Log data
 * @returns {Promise<Object>}
 */
export const createApiLog = async (logData) => {
  try {
    const log = await ExternalApiLog.create(logData);
    return log;
  } catch (error) {
    console.error('[ExternalApiLog] Error creating log:', error);
    // Don't throw - logging should not break the main flow
    return null;
  }
};

/**
 * Fetch all API logs with pagination and filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>}
 */
export const fetchAllApiLogs = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    service,
    civilId,
    patientId,
    success,
    startDate,
    endDate,
    search,
  } = filters;

  const query = {};

  if (service) {
    query.service = service;
  }

  if (civilId) {
    query.civilId = { $regex: civilId, $options: 'i' };
  }

  if (patientId) {
    query.patientId = { $regex: patientId, $options: 'i' };
  }

  if (success !== undefined) {
    query.success = success === 'true' || success === true;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  if (search) {
    query.$or = [
      { civilId: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
      { endpoint: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await ExternalApiLog.countDocuments(query);

  const logs = await ExternalApiLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return {
    rows: logs,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Fetch a single API log by ID
 * @param {String} id - Log ID
 * @returns {Promise<Object>}
 */
export const fetchApiLogById = async (id) => {
  const log = await ExternalApiLog.findById(id).lean();
  return log;
};

/**
 * Fetch API logs by civil ID
 * @param {String} civilId - Civil ID
 * @returns {Promise<Array>}
 */
export const fetchApiLogsByCivilId = async (civilId) => {
  const logs = await ExternalApiLog.find({ civilId })
    .sort({ createdAt: -1 })
    .lean();
  return logs;
};

/**
 * Fetch API logs by patient ID
 * @param {String} patientId - Patient ID
 * @returns {Promise<Array>}
 */
export const fetchApiLogsByPatientId = async (patientId) => {
  const logs = await ExternalApiLog.find({ patientId })
    .sort({ createdAt: -1 })
    .lean();
  return logs;
};

/**
 * Get API log statistics
 * @returns {Promise<Object>}
 */
export const getApiLogStats = async () => {
  const total = await ExternalApiLog.countDocuments();
  const successCount = await ExternalApiLog.countDocuments({ success: true });
  const failureCount = await ExternalApiLog.countDocuments({ success: false });

  const identityCount = await ExternalApiLog.countDocuments({ service: 'identity' });
  const royalhayatCount = await ExternalApiLog.countDocuments({ service: 'royalhayat' });

  return {
    total,
    successCount,
    failureCount,
    identityCount,
    royalhayatCount,
  };
};
