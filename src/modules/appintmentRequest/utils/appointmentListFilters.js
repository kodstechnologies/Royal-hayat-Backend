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

const buildBilingualFieldMatch = (field, primary, alternate) => {
  const primaryTrim = trimQuery(primary);
  const alternateTrim = trimQuery(alternate);
  if (!primaryTrim && !alternateTrim) return null;

  const clauses = [];
  if (primaryTrim) {
    clauses.push({ [field]: new RegExp(escapeRegex(primaryTrim), 'i') });
  }
  if (
    alternateTrim &&
    alternateTrim.toLowerCase() !== primaryTrim.toLowerCase()
  ) {
    clauses.push({ [field]: new RegExp(escapeRegex(alternateTrim), 'i') });
  }

  if (clauses.length === 0) return null;
  if (clauses.length === 1) return clauses[0];
  return { $or: clauses };
};

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

const PARSED_APPOINTMENT_DATE_EXPR = {
  $let: {
    vars: { raw: { $ifNull: ['$date', ''] } },
    in: {
      $switch: {
        branches: [
          {
            case: {
              $regexMatch: {
                input: '$$raw',
                regex: /^\d{4}-\d{2}-\d{2}/,
              },
            },
            then: {
              $dateFromString: {
                dateString: { $substrCP: ['$$raw', 0, 10] },
                format: '%Y-%m-%d',
                onError: null,
                onNull: null,
              },
            },
          },
          {
            case: {
              $regexMatch: {
                input: '$$raw',
                regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/,
              },
            },
            then: {
              $dateFromString: {
                dateString: '$$raw',
                format: '%d/%m/%Y',
                onError: null,
                onNull: null,
              },
            },
          },
        ],
        default: null,
      },
    },
  },
};

const buildAppointmentDateRangeExpr = (fromDate, toDate) => {
  const bounds = [{ $ne: [PARSED_APPOINTMENT_DATE_EXPR, null] }];

  if (fromDate) {
    bounds.push({
      $gte: [
        PARSED_APPOINTMENT_DATE_EXPR,
        {
          $dateFromString: {
            dateString: fromDate,
            format: '%Y-%m-%d',
            onError: null,
            onNull: null,
          },
        },
      ],
    });
  }

  if (toDate) {
    bounds.push({
      $lte: [
        PARSED_APPOINTMENT_DATE_EXPR,
        {
          $dateFromString: {
            dateString: toDate,
            format: '%Y-%m-%d',
            onError: null,
            onNull: null,
          },
        },
      ],
    });
  }

  return bounds.length === 1 ? bounds[0] : { $and: bounds };
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
  const departmentAr = trimQuery(
    query.departmentAr ?? query.departmentArabic,
  );
  const doctor = trimQuery(query.doctor ?? query.doctors);
  const doctorAr = trimQuery(query.doctorAr ?? query.doctorArabic);
  const search = trimQuery(query.search ?? query.patientName ?? query.name);

  const andConditions = [];

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    andConditions.push({
      $or: [
        { fullname: pattern },
        { englishName: pattern },
        { arabicName: pattern },
        { email: pattern },
        { phone: pattern },
      ],
    });
  }

  const departmentMatch = buildBilingualFieldMatch(
    'department',
    department,
    departmentAr,
  );
  if (departmentMatch) andConditions.push(departmentMatch);

  const doctorMatch = buildBilingualFieldMatch('doctor', doctor, doctorAr);
  if (doctorMatch) andConditions.push(doctorMatch);

  if (fromDate || toDate) {
    andConditions.push({
      $expr: buildAppointmentDateRangeExpr(fromDate, toDate),
    });
  }

  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0]);
  } else if (andConditions.length > 1) {
    filter.$and = andConditions;
  }

  if (fromTime || toTime) {
    filter.slot_from_time = {};
    if (fromTime) filter.slot_from_time.$gte = fromTime;
    if (toTime) filter.slot_from_time.$lte = toTime;
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
