import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import appointmentRequestRepository from '../repository/AppointmentRequest.repository.js';
import appointmentBookingRecordService from './AppointmentBookingRecord.service.js';
import {
  buildAppointmentListFilter,
  normalizeRequestType,
  VALID_REQUEST_TYPES,
} from '../utils/appointmentListFilters.js';
import { sendAppointmentRequestNotificationEmail } from '../../../utils/appointmentRequestNotificationMail.js';
import { applySlotTimesToPayload } from '../utils/appointmentSlotTimes.js';

const OID = /^[0-9a-fA-F]{24}$/;
const VALID_STATUS = ['received', 'accepted', 'cancelled'];

const assertValidObjectId = (id, label = 'appointment request id') => {
  if (!OID.test(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ${label}`);
  }
};

const parsePagination = (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const sanitizePayload = (body = {}) => {
  const payload = {};
  const patientData =
    body.patient && typeof body.patient === 'object' ? body.patient : {};
  const rawIdentityData =
    body.raw && typeof body.raw === 'object' ? body.raw : {};

  if (body.fullname !== undefined) {
    payload.fullname = String(body.fullname).trim();
  }

  if (body.phone !== undefined) {
    payload.phone = String(body.phone).trim();
  }

  if (body.age !== undefined && body.age !== '') {
    payload.age = Number(body.age);
  }

  if (body.gender !== undefined) {
    payload.gender = String(body.gender).trim();
  }

  if (body.additionalNotes !== undefined) {
    payload.additionalNotes = String(body.additionalNotes).trim();
  }

  if (body.doctor !== undefined) {
    payload.doctor = String(body.doctor).trim();
  }

  if (body.department !== undefined) {
    payload.department = String(body.department).trim();
  }

  const dobInput =
    body.dob ??
    body.dateOfBirth ??
    patientData.dob ??
    rawIdentityData.dateOfBirth;
  if (dobInput !== undefined && dobInput !== '') {
    const dob = new Date(dobInput);
    if (Number.isNaN(dob.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid dob');
    }
    payload.dob = dob;
  }

  const patientId = body.patient_id ?? patientData.patient_id;
  if (patientId !== undefined) {
    payload.patient_id = String(patientId).trim();
  }

  const urn = body.urn ?? patientData.urn;
  if (urn !== undefined) {
    payload.urn = String(urn).trim();
  }

  const nationalId = body.national_id ?? patientData.national_id;
  if (nationalId !== undefined) {
    payload.national_id = String(nationalId).trim();
  }

  const mobileNumber = body.mobile_number ?? patientData.mobile_number;
  if (mobileNumber !== undefined) {
    payload.mobile_number = String(mobileNumber).trim();
  }

  const email = body.email ?? patientData.email;
  if (email !== undefined) {
    payload.email = String(email).trim();
  }

  const address = body.address ?? patientData.address;
  if (address !== undefined) {
    payload.address = String(address).trim();
  }

  const englishName = body.englishName ?? rawIdentityData?.name?.english;
  if (englishName !== undefined) {
    payload.englishName = String(englishName).trim();
  }

  const arabicName = body.arabicName ?? rawIdentityData?.name?.arabic;
  if (arabicName !== undefined) {
    payload.arabicName = String(arabicName).trim();
  }

  const operationId = body.operationId ?? rawIdentityData.operationId;
  if (operationId !== undefined) {
    payload.operationId = String(operationId).trim();
  }

  const paciRequestId = body.paciRequestId ?? rawIdentityData.paciRequestId;
  if (paciRequestId !== undefined) {
    payload.paciRequestId = String(paciRequestId).trim();
  }

  if (body.nationality !== undefined) {
    payload.nationality = String(body.nationality).trim();
  } else if (rawIdentityData?.nationality?.name) {
    payload.nationality = String(
      rawIdentityData.nationality.name.english ??
        rawIdentityData.nationality.name.arabic ??
        '',
    ).trim();
  }

  if (body.passportNumber !== undefined) {
    payload.passportNumber = String(body.passportNumber).trim();
  } else if (rawIdentityData?.registration?.passport !== undefined) {
    payload.passportNumber = String(
      rawIdentityData.registration.passport,
    ).trim();
  }

  if (body.status !== undefined) {
    payload.status = String(body.status).trim().toLowerCase();

    if (!VALID_STATUS.includes(payload.status)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `status must be one of ${VALID_STATUS.join(', ')}`,
      );
    }
  }

  if (body.requestType !== undefined) {
    payload.requestType = normalizeRequestType(body.requestType);

    if (!VALID_REQUEST_TYPES.includes(payload.requestType)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `requestType must be one of ${VALID_REQUEST_TYPES.join(', ')}`,
      );
    }
  }

  if (body.symptoms !== undefined) {
    payload.symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.map((item) => String(item).trim()).filter(Boolean)
      : [];
  }

  const preferredDate = body.preferredDate ?? body.date;
  if (preferredDate !== undefined && preferredDate !== '') {
    payload.date = String(preferredDate).trim();
  }

  applySlotTimesToPayload(payload, body);

  return payload;
};

const validateCreate = (payload) => {
  if (!payload.fullname) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'fullname is required');
  }

  if (!payload.phone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'phone is required');
  }

  if (payload.age !== undefined && !Number.isFinite(payload.age)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'age must be a valid number');
  }

  if (!payload.requestType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'requestType is required');
  }

  if (!VALID_REQUEST_TYPES.includes(payload.requestType)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `requestType must be one of ${VALID_REQUEST_TYPES.join(', ')}`,
    );
  }
};

const mapRequestToBookingPayload = (request) => ({
  fullname: request.fullname,
  phone: request.phone,
  age: request.age,
  gender: request.gender,
  additionalNotes: request.additionalNotes,
  dob: request.dob,
  patient_id: request.patient_id,
  urn: request.urn,
  national_id: request.national_id,
  mobile_number: request.mobile_number,
  email: request.email,
  address: request.address,
  englishName: request.englishName,
  arabicName: request.arabicName,
  operationId: request.operationId,
  paciRequestId: request.paciRequestId,
  date: request.date,
  slot_from_time: request.slot_from_time,
  slot_to_time: request.slot_to_time,
  nationality: request.nationality,
  passportNumber: request.passportNumber,
  symptoms: request.symptoms,
  doctor: request.doctor,
  department: request.department,
});

const resolveStatusNote = (body = {}) => {
  if (body.note === undefined || body.note === null) {
    return undefined;
  }
  const trimmed = String(body.note).trim();
  return trimmed.length ? trimmed : undefined;
};

class AppointmentRequestService {
  async createAppointmentRequest(body) {
    const payload = sanitizePayload(body);
    validateCreate(payload);

    const created = await appointmentRequestRepository.create({
      ...payload,
      status: 'received',
    });

    try {
      await sendAppointmentRequestNotificationEmail(created);
    } catch (mailError) {
      console.error(
        'Appointment request notification email failed:',
        mailError?.message || mailError,
      );
    }

    return created;
  }

  async getAllAppointmentRequests(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = buildAppointmentListFilter(query, {
      includeStatus: true,
      includeRequestType: true,
    });

    const [rows, total, unviewed] = await Promise.all([
      appointmentRequestRepository.findPaginated(filter, { skip, limit }),
      appointmentRequestRepository.countDocuments(filter),
      appointmentRequestRepository.countDocuments({ ...filter, isViewed: false }),
    ]);

    return {
      rows,
      meta: {
        page,
        limit,
        total,
        unviewed,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAppointmentRequestById(id) {
    assertValidObjectId(id);

    const row = await appointmentRequestRepository.findByIdAndMarkViewed(id);
    if (!row) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Appointment request not found');
    }

    return row;
  }

  async updateAppointmentRequest(id, body) {
    assertValidObjectId(id);

    const payload = sanitizePayload(body);
    if (Object.keys(payload).length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'At least one field is required to update',
      );
    }

    if (payload.age !== undefined && !Number.isFinite(payload.age)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'age must be a valid number');
    }

    const updated = await appointmentRequestRepository.updateById(id, payload);
    if (!updated) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Appointment request not found');
    }

    return updated;
  }

  async deleteAppointmentRequest(id) {
    assertValidObjectId(id);

    const deleted = await appointmentRequestRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Appointment request not found');
    }
  }

  async acceptAppointmentRequest(id, body = {}) {
    assertValidObjectId(id);
    const note = resolveStatusNote(body);

    const current = await appointmentRequestRepository.findById(id);
    if (!current) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Appointment request not found');
    }

    if (current.status !== 'accepted') {
      await appointmentBookingRecordService.createAppointmentBookingRecord(
        mapRequestToBookingPayload(current),
      );
    }

    const updatePayload = { status: 'accepted' };
    if (note !== undefined) {
      updatePayload.note = note;
    }

    return appointmentRequestRepository.updateById(id, updatePayload);
  }

  async cancelAppointmentRequest(id, body = {}) {
    assertValidObjectId(id);
    const note = resolveStatusNote(body);

    const updatePayload = { status: 'cancelled' };
    if (note !== undefined) {
      updatePayload.note = note;
    }

    const updated = await appointmentRequestRepository.updateById(
      id,
      updatePayload,
    );
    if (!updated) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Appointment request not found');
    }

    return updated;
  }
}

export default new AppointmentRequestService();
