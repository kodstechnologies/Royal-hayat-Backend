import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import AppointmentBookingRecord from '../model/appointmentBookingRecord.model.js';
import { buildAppointmentListFilter } from '../utils/appointmentListFilters.js';

const OID = /^[0-9a-fA-F]{24}$/;

const sanitizePayload = (body = {}) => {
  const payload = {};
  const patientData =
    body.patient && typeof body.patient === 'object'
      ? body.patient
      : {};
  const rawIdentityData =
    body.raw && typeof body.raw === 'object'
      ? body.raw
      : {};

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

  const patientId =
    body.patient_id ??
    patientData.patient_id;
  if (patientId !== undefined) {
    payload.patient_id = String(patientId).trim();
  }

  const urn = body.urn ?? patientData.urn;
  if (urn !== undefined) {
    payload.urn = String(urn).trim();
  }

  const nationalId =
    body.national_id ??
    patientData.national_id;
  if (nationalId !== undefined) {
    payload.national_id = String(nationalId).trim();
  }

  const mobileNumber =
    body.mobile_number ??
    patientData.mobile_number;
  if (mobileNumber !== undefined) {
    payload.mobile_number = String(mobileNumber).trim();
  }

  const email =
    body.email ??
    patientData.email;
  if (email !== undefined) {
    payload.email = String(email).trim();
  }

  const address =
    body.address ??
    patientData.address;
  if (address !== undefined) {
    payload.address = String(address).trim();
  }

  const englishName =
    body.englishName ??
    rawIdentityData?.name?.english;
  if (englishName !== undefined) {
    payload.englishName = String(englishName).trim();
  }

  const arabicName =
    body.arabicName ??
    rawIdentityData?.name?.arabic;
  if (arabicName !== undefined) {
    payload.arabicName = String(arabicName).trim();
  }

  const paciRequestId =
    body.paciRequestId ??
    rawIdentityData.paciRequestId;
  if (paciRequestId !== undefined) {
    payload.paciRequestId = String(paciRequestId).trim();
  }
  if (body.date !== undefined) {
    payload.date = String(body.date).trim();
  }
  if (body.time !== undefined) {
    payload.time = String(body.time).trim();
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

const createAppointmentBookingRecord = asyncHandler(async (req, res) => {
  const payload = sanitizePayload(req.body);
  validateCreate(payload);

  const created = await AppointmentBookingRecord.create(payload);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Appointment booking record created successfully',
    data: created,
  });
});

const getAllAppointmentBookingRecords = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = buildAppointmentListFilter(req.query, {
    includeStatus: false,
  });

  const [rows, total] = await Promise.all([
    AppointmentBookingRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AppointmentBookingRecord.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking records fetched successfully',
    data: rows,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getAppointmentBookingRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!OID.test(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid appointment booking record id');
  }

  const row = await AppointmentBookingRecord.findById(id);
  if (!row) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment booking record not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking record fetched successfully',
    data: row,
  });
});

const updateAppointmentBookingRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!OID.test(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid appointment booking record id');
  }

  const payload = sanitizePayload(req.body);
  if (Object.keys(payload).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'At least one field is required to update');
  }
  if (payload.age !== undefined && !Number.isFinite(payload.age)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'age must be a valid number');
  }

  const updated = await AppointmentBookingRecord.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment booking record not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking record updated successfully',
    data: updated,
  });
});

const deleteAppointmentBookingRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!OID.test(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid appointment booking record id');
  }

  const deleted = await AppointmentBookingRecord.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment booking record not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking record deleted successfully',
    data: null,
  });
});

export {
  createAppointmentBookingRecord,
  getAllAppointmentBookingRecords,
  getAppointmentBookingRecordById,
  updateAppointmentBookingRecord,
  deleteAppointmentBookingRecord,
};
