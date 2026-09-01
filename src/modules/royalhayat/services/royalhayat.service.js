import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import {
  enrichPatientLookupApiError,
  throwPatientLookupError
} from '../utils/patientLookup.errors.js';
import { classifyBookingConflict } from '../utils/booking.errors.js';
import {
  buildMockPatientRecord,
  getForcedBookingFailureMessage,
  isMockCivilId,
  shouldSimulateHisPatientNotFound,
} from '../../identity/data/identity.mock.js';
import { royalHayatLog, royalHayatLogJson } from '../utils/royalhayat.logger.js';
import { createApiLog } from '../../externalApiLogs/services/externalApiLog.service.js';

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value || !value.trim()) {
    console.warn(`Environment variable ${key} not set. Using fallback value.`);
    return null;
  }
  return value.trim();
};

const ROYAL_HAYAT_BASE_URL = getRequiredEnv('ROYAL_HAYAT_BASE_URL');
const ROYAL_HAYAT_USERNAME = getRequiredEnv('ROYAL_HAYAT_USERNAME');
const ROYAL_HAYAT_PASSWORD = getRequiredEnv('ROYAL_HAYAT_PASSWORD');
const ROYAL_HAYAT_API_KEY = getRequiredEnv('ROYAL_HAYAT_API_KEY');

let cachedToken = null;
let tokenExpiry = null;

const parseResponseJson = async (resp) => {
  try {
    return await resp.json();
  } catch (error) {
    console.warn('[RoyalHayat] Failed to parse JSON response. Returning null.');
    return null;
  }
};

const getAuthToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 30000) {
    return cachedToken;
  }

  if (!ROYAL_HAYAT_USERNAME || !ROYAL_HAYAT_PASSWORD) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Royal Hayat credentials not configured. Please set ROYAL_HAYAT_USERNAME and ROYAL_HAYAT_PASSWORD environment variables.');
  }

  console.log('[RoyalHayat] Requesting new auth token...');
  const response = await fetch(`${ROYAL_HAYAT_BASE_URL}/WEBAPP/getToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': ROYAL_HAYAT_API_KEY
    },
    body: JSON.stringify({
      username: ROYAL_HAYAT_USERNAME,
      password: ROYAL_HAYAT_PASSWORD
    })
  });

  const responseBody = await parseResponseJson(response);
  if (!response.ok) {
    console.error('[RoyalHayat] Auth Token Error Status:', response.status);
    console.error('[RoyalHayat] Auth Token Error Body:', responseBody);
    throw new ApiError(
      response.status || httpStatus.BAD_GATEWAY,
      responseBody?.message || 'Failed to authenticate with Royal Hayat',
      responseBody || null
    );
  }

  if (responseBody.message !== 'Success' || !responseBody.access_token) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Royal Hayat authentication failed', responseBody || null);
  }

  cachedToken = responseBody.access_token;
  const ttlMs = (responseBody.expires_in ? parseInt(responseBody.expires_in) : 3600) * 1000;
  tokenExpiry = Date.now() + ttlMs;

  return cachedToken;
};

const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const startTime = Date.now();
  const token = await getAuthToken();
  const url = `${ROYAL_HAYAT_BASE_URL}${endpoint}`;

  const requestOptions = {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'API-KEY': ROYAL_HAYAT_API_KEY,
      ...options.headers
    }
  };

  console.log(`[RoyalHayat] Request: ${options.method || 'GET'} ${url}`);
  if (options.body) console.log(`[RoyalHayat] Request Body: ${options.body}`);

  const response = await fetch(url, requestOptions);
  const responseBody = await parseResponseJson(response);
  const responseTime = Date.now() - startTime;

  console.log(`[RoyalHayat] Response Status: ${response.status}`);
  console.log(`[RoyalHayat] Response Body:`, JSON.stringify(responseBody, null, 2));

  // Extract civilId or patientId from request body or endpoint for logging
  let civilId = null;
  let patientId = null;
  
  if (options.body) {
    try {
      const bodyData = JSON.parse(options.body);
      patientId = bodyData.patient_id || null;
    } catch (e) {}
  }
  
  // Try to extract from URL parameters
  if (endpoint.includes('nationalid=')) {
    const match = endpoint.match(/nationalid=([^&]+)/);
    if (match) civilId = decodeURIComponent(match[1]);
  }
  if (endpoint.includes('urn=')) {
    const match = endpoint.match(/urn=([^&]+)/);
    if (match) patientId = decodeURIComponent(match[1]);
  }

  // Log the API call
  createApiLog({
    service: 'royalhayat',
    endpoint: endpoint,
    method: options.method || 'GET',
    civilId: civilId,
    patientId: patientId,
    requestData: options.body ? JSON.parse(options.body) : {},
    responseData: responseBody,
    statusCode: response.status,
    success: response.ok,
    errorMessage: !response.ok ? (responseBody?.status || responseBody?.message || 'Royal Hayat API request failed') : undefined,
    responseTime: responseTime,
  }).catch(err => console.error('[makeAuthenticatedRequest] Failed to log API call:', err));

  if (!response.ok) {
    throw new ApiError(
      response.status || httpStatus.BAD_GATEWAY,
      responseBody?.status || responseBody?.message || 'Royal Hayat API request failed',
      responseBody || null
    );
  }

  return responseBody;
};

const getAvailability = async (params) => {
  try {
    const {
      specialitycode,
      providercode,
      servicecode,
      datefrom,
      dateto,
      timefrom,
      timeto,
      dow
    } = params;

    if (!specialitycode || !providercode || !servicecode || !datefrom) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: specialitycode, providercode, servicecode, datefrom');
    }

    const queryParams = new URLSearchParams({
      specialitycode,
      providercode,
      servicecode,
      datefrom
    });

    if (dateto) queryParams.append('dateto', dateto);
    if (timefrom) queryParams.append('timefrom', timefrom);
    if (timeto) queryParams.append('timeto', timeto);
    if (dow) queryParams.append('dow', dow);

    const endpoint = `/WEBAPP/appointment/availability?${queryParams.toString()}`;
    const response = await makeAuthenticatedRequest(endpoint, { method: 'GET' });

    if (response.status !== 'Success') {
      console.error('[RoyalHayat] Availability Error Status:', response.status);
      throw new ApiError(httpStatus.BAD_REQUEST, response.status || 'Failed to fetch availability', response);
    }

    return {
      slot_list: response.slot_list || [],
      truncated: response.truncated || false,
      raw: response
    };
  } catch (error) {
    console.error('[RoyalHayat] getAvailability Exception:', error.message);
    if (error.stack) console.error(error.stack);
    throw error;
  }
};

const bookAppointment = async (patientId, slotBookingId, options = {}) => {
  try {
    royalHayatLog('booking', `bookAppointment called patientId=${patientId} slotBookingId=${slotBookingId}`);
    royalHayatLogJson('booking', 'bookAppointment options', options);

    if (!patientId || !slotBookingId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: patientId, slotBookingId');
    }

    const forcedMessage = getForcedBookingFailureMessage({
      patientId,
      doctorId: options.doctorId,
      date: options.date,
      slotTime: options.slotTime,
    });
    if (forcedMessage) {
      royalHayatLog('booking', `mock forced failure: ${forcedMessage}`);
      const conflict = classifyBookingConflict(forcedMessage);
      if (conflict) {
        throw new ApiError(httpStatus.BAD_REQUEST, conflict.message || forcedMessage, {
          code: conflict.code,
          status: forcedMessage,
          conflict
        });
      }
      throw new ApiError(httpStatus.BAD_REQUEST, forcedMessage, {
        code: 'REGISTERED_PATIENT_BOOKING_FALLBACK',
      });
    }

    const hisPayload = {
      patient_id: patientId,
      slot_booking_id: slotBookingId,
    };
    const endpoint = '/WEBAPP/appointment/book';
    royalHayatLogJson('booking', `HIS request POST ${ROYAL_HAYAT_BASE_URL}${endpoint}`, hisPayload);

    const response = await makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(hisPayload),
    });

    royalHayatLogJson('booking', 'HIS response', response);

    if (response.status !== 'Success') {
      royalHayatLog('booking', `HIS booking failed status=${response.status}`);
      const conflict = classifyBookingConflict(response.status);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        conflict?.message || response.status || 'Failed to book appointment',
        {
          ...(response || {}),
          code: conflict?.code || 'BOOKING_FAILED',
          conflict: conflict || null
        }
      );
    }

    const result = {
      status: response.status,
      raw: response,
    };
    royalHayatLogJson('booking', 'bookAppointment success result', result);
    return result;
  } catch (error) {
    royalHayatLog('booking', `bookAppointment exception: ${error.message}`);
    if (error?.meta) {
      royalHayatLogJson('booking', 'bookAppointment error meta', error.meta);
    }
    const rawStatus = error?.meta?.status || error.message;
    const conflict =
      classifyBookingConflict(rawStatus) || classifyBookingConflict(error.message);
    if (conflict) {
      throw new ApiError(httpStatus.BAD_REQUEST, conflict.message || rawStatus, {
        code: conflict.code,
        status: rawStatus,
        conflict
      });
    }
    throw error;
  }
};

const getPatient = async (params) => {
  try {
    const { urn, nationalid } = params;

    if (nationalid && isMockCivilId(nationalid)) {
      if (shouldSimulateHisPatientNotFound(nationalid)) {
        throwPatientLookupError('Error: Patient not found', {
          patient_exist: false,
          status: 'Error: Patient not found',
        });
      }
      const mockPatient = buildMockPatientRecord(nationalid);
      return {
        patient: mockPatient,
        raw: mockPatient,
      };
    }

    if (!urn && !nationalid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'At least one parameter required: urn or nationalid');
    }

    const queryParams = new URLSearchParams();
    if (urn) queryParams.append('urn', urn);
    if (nationalid) queryParams.append('nationalid', nationalid);

    const endpoint = `/WEBAPP/patient?${queryParams.toString()}`;
    const response = await makeAuthenticatedRequest(endpoint, { method: 'GET' });

    if (response.status !== 'Success') {
      console.error('[RoyalHayat] getPatient Error Status:', response.status);
      throwPatientLookupError(response.status || 'Failed to fetch patient', response);
    }

    if (!response.patient_id) {
      throwPatientLookupError('Error: Patient not found', {
        patient_exist: false,
        status: 'Error: Patient not found'
      });
    }

    return {
      patient: response,
      raw: response
    };
  } catch (error) {
    console.error('[RoyalHayat] getPatient Exception:', error.message);
    throw enrichPatientLookupApiError(error);
  }
};

const getSpecialities = async (hospitalCode) => {
  try {
    if (!hospitalCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameter: hospitalCode');
    }

    const endpoint = `/WEBAPP/appointment/speciality?hospitalcode=${encodeURIComponent(hospitalCode)}`;
    const response = await makeAuthenticatedRequest(endpoint, { method: 'GET' });

    if (response.status !== 'Success') {
      console.error('[RoyalHayat] getSpecialities Error Status:', response.status);
      throw new ApiError(httpStatus.BAD_REQUEST, response.status || 'Failed to fetch specialities', response);
    }

    return {
      speciality_list: response.speciality_list || [],
      raw: response
    };
  } catch (error) {
    console.error('[RoyalHayat] getSpecialities Exception:', error.message);
    throw error;
  }
};

const getCareProviders = async (specialityCode) => {
  try {
    if (!specialityCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameter: specialityCode');
    }

    const endpoint = `/WEBAPP/appointment/doctor?specialitycode=${encodeURIComponent(specialityCode)}`;
    const response = await makeAuthenticatedRequest(endpoint, { method: 'GET' });

    if (response.status !== 'Success') {
      console.error('[RoyalHayat] getCareProviders Error Status:', response.status);
      throw new ApiError(httpStatus.BAD_REQUEST, response.status || 'Failed to fetch care providers', response);
    }

    return {
      provider_list: response.provider_list || [],
      raw: response
    };
  } catch (error) {
    console.error('[RoyalHayat] getCareProviders Exception:', error.message);
    throw error;
  }
};

export default {
  getAvailability,
  bookAppointment,
  getPatient,
  getSpecialities,
  getCareProviders,
  getAuthToken
};
