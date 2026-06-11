import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';

const VALID_STATUS = ['received', 'accepted', 'cancelled'];
const DEFAULT_STATUS_QUERY = 'pending';

export const APPOINTMENT_REQUEST_TYPES = {
  DOCTOR_UNAVAILABILITY: 'doctor unavailability request',
  FIRST_TIME_VISITOR: 'first time visitor request',
  APPOINTMENT_REQUEST: 'appointment request',
  REGISTERED_PATIENT_BOOKING_FALLBACK: 'registered patient booking fallback',
};

const VALID_REQUEST_TYPES = Object.values(APPOINTMENT_REQUEST_TYPES);

export const normalizeRequestType = (value) => {
  const raw = String(value).trim();
  const key = raw.toLowerCase();

  const aliases = {
    'doctor unavailability request': APPOINTMENT_REQUEST_TYPES.DOCTOR_UNAVAILABILITY,
    doctor_unavailability_request: APPOINTMENT_REQUEST_TYPES.DOCTOR_UNAVAILABILITY,
    'doctor-unavailability-request': APPOINTMENT_REQUEST_TYPES.DOCTOR_UNAVAILABILITY,
    'first time visitor request': APPOINTMENT_REQUEST_TYPES.FIRST_TIME_VISITOR,
    first_time_visitor_request: APPOINTMENT_REQUEST_TYPES.FIRST_TIME_VISITOR,
    'first-time-visitor-request': APPOINTMENT_REQUEST_TYPES.FIRST_TIME_VISITOR,
    'appointment request': APPOINTMENT_REQUEST_TYPES.APPOINTMENT_REQUEST,
    appointment_request: APPOINTMENT_REQUEST_TYPES.APPOINTMENT_REQUEST,
    'appointment-request': APPOINTMENT_REQUEST_TYPES.APPOINTMENT_REQUEST,
    'registered patient booking fallback':
      APPOINTMENT_REQUEST_TYPES.REGISTERED_PATIENT_BOOKING_FALLBACK,
    registered_patient_booking_fallback:
      APPOINTMENT_REQUEST_TYPES.REGISTERED_PATIENT_BOOKING_FALLBACK,
    'registered-patient-booking-fallback':
      APPOINTMENT_REQUEST_TYPES.REGISTERED_PATIENT_BOOKING_FALLBACK,
  };

  return aliases[key] ?? raw;
};

const trimQuery = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeStatus = (raw) => {
  const status = trimQuery(raw).toLowerCase() || DEFAULT_STATUS_QUERY;

  if (status === 'pending') {
    return 'received';
  }

  if (!VALID_STATUS.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `status must be one of pending, ${VALID_STATUS.join(', ')}`,
    );
  }

  return status;
};

export const buildAppointmentListFilter = (
  query = {},
  { includeStatus = false, includeRequestType = false } = {},
) => {
  const filter = {};

  const fromDate = trimQuery(query.fromDate ?? query.dateFrom);
  const toDate = trimQuery(query.toDate ?? query.dateTo);
  const fromTime = trimQuery(query.fromTime ?? query.timeFrom);
  const toTime = trimQuery(query.toTime ?? query.timeTo);
  const department = trimQuery(query.department);
  const doctor = trimQuery(query.doctor ?? query.doctors);

  if (fromDate || toDate) {
    filter.date = {};
    if (fromDate) filter.date.$gte = fromDate;
    if (toDate) filter.date.$lte = toDate;
  }

  if (fromTime || toTime) {
    filter.time = {};
    if (fromTime) filter.time.$gte = fromTime;
    if (toTime) filter.time.$lte = toTime;
  }

  if (department) {
    filter.department = new RegExp(escapeRegex(department), 'i');
  }

  if (doctor) {
    filter.doctor = new RegExp(escapeRegex(doctor), 'i');
  }

  if (includeStatus) {
    const statusParam = trimQuery(query.status).toLowerCase();

    if (statusParam && statusParam !== 'all') {
      filter.status = normalizeStatus(
        statusParam || DEFAULT_STATUS_QUERY,
      );
    } else if (!statusParam) {
      filter.status = normalizeStatus(DEFAULT_STATUS_QUERY);
    }
  }

  if (includeRequestType) {
    const requestTypeParam = trimQuery(query.requestType);
    if (requestTypeParam) {
      const normalized = normalizeRequestType(requestTypeParam);
      if (!VALID_REQUEST_TYPES.includes(normalized)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `requestType must be one of ${VALID_REQUEST_TYPES.join(', ')}`,
        );
      }
      filter.requestType = normalized;
    }
  }

  return filter;
};

export { VALID_STATUS, DEFAULT_STATUS_QUERY, VALID_REQUEST_TYPES };
