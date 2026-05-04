import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

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
  return resp.json().catch(() => null);
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

  console.log(`[RoyalHayat] Response Status: ${response.status}`);
  console.log(`[RoyalHayat] Response Body:`, JSON.stringify(responseBody, null, 2));

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

const bookAppointment = async (patientId, slotBookingId) => {
  if (!patientId || !slotBookingId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: patientId, slotBookingId');
  }

  const endpoint = '/WEBAPP/appointment/book';
  const response = await makeAuthenticatedRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      patient_id: patientId,
      slot_booking_id: slotBookingId
    })
  });

  if (response.status !== 'Success') {
    throw new ApiError(httpStatus.BAD_REQUEST, response.status || 'Failed to book appointment', response);
  }

  return {
    status: response.status,
    raw: response
  };
};

const getPatient = async (params) => {
  const { urn, nationalid } = params;

  if (!urn && !nationalid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'At least one parameter required: urn or nationalid');
  }

  const queryParams = new URLSearchParams();
  if (urn) queryParams.append('urn', urn);
  if (nationalid) queryParams.append('nationalid', nationalid);

  const endpoint = `/WEBAPP/patient?${queryParams.toString()}`;
  const response = await makeAuthenticatedRequest(endpoint, { method: 'GET' });

  if (response.status !== 'Success') {
    throw new ApiError(httpStatus.BAD_REQUEST, response.status || 'Failed to fetch patient', response);
  }

  return {
    patient: response,
    raw: response
  };
};

const getSpecialities = async (hospitalCode) => {
  if (!hospitalCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameter: hospitalCode');
  }

  const endpoint = `/WEBAPP/appointment/speciality?hospitalcode=${encodeURIComponent(hospitalCode)}`;
  const response = await makeAuthenticatedRequest(endpoint, { method: 'GET' });

  if (response.status !== 'Success') {
    throw new ApiError(httpStatus.BAD_REQUEST, response.status || 'Failed to fetch specialities', response);
  }

  return {
    speciality_list: response.speciality_list || [],
    raw: response
  };
};

const getCareProviders = async (specialityCode) => {
  if (!specialityCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameter: specialityCode');
  }

  const endpoint = `/WEBAPP/appointment/doctor?specialitycode=${encodeURIComponent(specialityCode)}`;
  const response = await makeAuthenticatedRequest(endpoint, { method: 'GET' });

  if (response.status !== 'Success') {
    throw new ApiError(httpStatus.BAD_REQUEST, response.status || 'Failed to fetch care providers', response);
  }

  return {
    provider_list: response.provider_list || [],
    raw: response
  };
};

export default {
  getAvailability,
  bookAppointment,
  getPatient,
  getSpecialities,
  getCareProviders,
  getAuthToken
};
