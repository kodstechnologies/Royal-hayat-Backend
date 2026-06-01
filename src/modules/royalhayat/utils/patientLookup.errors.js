import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

export const PATIENT_LOOKUP_CODES = {
  NOT_FOUND: 'PATIENT_NOT_FOUND',
  DUPLICATE: 'PATIENT_DUPLICATE_NATIONAL_ID',
  MERGED_URN: 'PATIENT_MERGED_URN',
  INACTIVE: 'PATIENT_INACTIVE_OR_MERGED',
  INPUT_TOO_LONG: 'PATIENT_INPUT_TOO_LONG',
  UNAVAILABLE: 'PATIENT_LOOKUP_UNAVAILABLE',
  UNKNOWN: 'PATIENT_LOOKUP_FAILED'
};

const classifyPatientStatus = (statusText, body = {}) => {
  const text = String(statusText || body?.status || '').toLowerCase();

  if (text.includes('patient not found') || body?.patient_exist === false) {
    return { code: PATIENT_LOOKUP_CODES.NOT_FOUND, statusCode: httpStatus.NOT_FOUND };
  }
  if (text.includes('urn belongs to a merged') || text.includes('belongs to a merged patient record')) {
    return { code: PATIENT_LOOKUP_CODES.MERGED_URN, statusCode: httpStatus.CONFLICT };
  }
  if (text.includes('multiple patient')) {
    return { code: PATIENT_LOOKUP_CODES.DUPLICATE, statusCode: httpStatus.CONFLICT };
  }
  if (text.includes('inactive') || text.includes('has been merged')) {
    return { code: PATIENT_LOOKUP_CODES.INACTIVE, statusCode: httpStatus.CONFLICT };
  }
  if (text.includes('input too long') || text.includes('max 50 characters')) {
    return { code: PATIENT_LOOKUP_CODES.INPUT_TOO_LONG, statusCode: httpStatus.BAD_REQUEST };
  }

  return { code: PATIENT_LOOKUP_CODES.UNKNOWN, statusCode: httpStatus.BAD_GATEWAY };
};

export const throwPatientLookupError = (statusText, body = null) => {
  const { code, statusCode } = classifyPatientStatus(statusText, body);
  throw new ApiError(statusCode, statusText || 'Failed to fetch patient', {
    code,
    trakcare: body || null
  });
};

export const enrichPatientLookupApiError = (error) => {
  if (!(error instanceof ApiError)) {
    return error;
  }

  const trakcare = error.meta?.trakcare || error.meta || null;
  const statusText = error.message || trakcare?.status || '';
  const { code, statusCode } = classifyPatientStatus(statusText, trakcare);

  if (error.meta?.code === code && error.statusCode === statusCode) {
    return error;
  }

  return new ApiError(statusCode, error.message, {
    code,
    trakcare
  });
};
