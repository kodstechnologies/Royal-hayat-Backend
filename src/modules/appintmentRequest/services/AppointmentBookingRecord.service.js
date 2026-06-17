import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import appointmentBookingRecordRepository from '../repository/AppointmentBookingRecord.repository.js';
import appointmentRequestRepository from '../repository/AppointmentRequest.repository.js';
import { sendAppointmentBookingNotificationEmail } from '../../../utils/appointmentBookingNotificationMail.js';
import { buildAppointmentListFilter, APPOINTMENT_REQUEST_TYPES } from '../utils/appointmentListFilters.js';
import { applySlotTimesToPayload } from '../utils/appointmentSlotTimes.js';

const OID = /^[0-9a-fA-F]{24}$/;

const assertValidObjectId = (id, label = 'appointment booking record id') => {
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

  const paciRequestId = body.paciRequestId ?? rawIdentityData.paciRequestId;
  if (paciRequestId !== undefined) {
    payload.paciRequestId = String(paciRequestId).trim();
  }

  if (body.date !== undefined) {
    payload.date = String(body.date).trim();
  }

  applySlotTimesToPayload(payload, body);

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

  if (body.symptoms !== undefined) {
    payload.symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.map((v) => String(v).trim()).filter(Boolean)
      : [String(body.symptoms).trim()].filter(Boolean);
  }

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
};

class AppointmentBookingRecordService {
  async createAppointmentBookingRecord(body) {
    const payload = sanitizePayload(body);
    validateCreate(payload);

    const record = await appointmentBookingRecordRepository.create(payload);

    try {
      await sendAppointmentBookingNotificationEmail(record);
    } catch (mailError) {
      console.error(
        'Appointment booking notification email failed:',
        mailError?.message || mailError,
      );
    }

    return record;
  }

  async getAllAppointmentBookingRecords(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = buildAppointmentListFilter(query, {
      includeStatus: false,
    });

    const [rows, total] = await Promise.all([
      appointmentBookingRecordRepository.findPaginated(filter, { skip, limit }),
      appointmentBookingRecordRepository.countDocuments(filter),
    ]);

    return {
      rows,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAppointmentBookingRecordById(id) {
    assertValidObjectId(id);

    const row = await appointmentBookingRecordRepository.findByIdAndMarkViewed(
      id,
    );
    if (!row) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment booking record not found',
      );
    }

    return row;
  }

  async updateAppointmentBookingRecord(id, body) {
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

    const updated = await appointmentBookingRecordRepository.updateById(
      id,
      payload,
    );
    if (!updated) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment booking record not found',
      );
    }

    return updated;
  }

  async deleteAppointmentBookingRecord(id) {
    assertValidObjectId(id);

    const deleted = await appointmentBookingRecordRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment booking record not found',
      );
    }
  }

  async getAppointmentCounts() {
    const [
      appointmentBookingCount,
      appointmentRequestCount,
      doctorUnavailabilityCount,
      firstTimeVisitorCount,
    ] = await Promise.all([
      appointmentBookingRecordRepository.countUnviewed(),
      appointmentRequestRepository.countUnviewed(),
      appointmentRequestRepository.countUnviewedByRequestType(
        APPOINTMENT_REQUEST_TYPES.DOCTOR_UNAVAILABILITY,
      ),
      appointmentRequestRepository.countUnviewedByRequestType(
        APPOINTMENT_REQUEST_TYPES.FIRST_TIME_VISITOR,
      ),
    ]);

    return {
      total: appointmentBookingCount + appointmentRequestCount,
      appointmentBookings: appointmentBookingCount,
      appointmentRequests: appointmentRequestCount,
      doctorUnavailabilityRequests: doctorUnavailabilityCount,
      firstTimeVisitorRequests: firstTimeVisitorCount,
    };
  }
}

export default new AppointmentBookingRecordService();
