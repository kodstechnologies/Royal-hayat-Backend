import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';

const VALID_STATUS = ['received', 'accepted', 'cancelled'];
const DEFAULT_STATUS_QUERY = 'pending';

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

/**
 * Query params:
 * - fromDate / dateFrom, toDate / dateTo  -> filters `date` (string, yyyy-MM-dd recommended)
 * - fromTime / timeFrom, toTime / timeTo  -> filters `time`
 * - department
 * - doctor / doctors
 * - status (appointment requests only; default: pending -> received)
 */
export const buildAppointmentListFilter = (
  query = {},
  { includeStatus = false } = {},
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

  return filter;
};

export { VALID_STATUS, DEFAULT_STATUS_QUERY };
