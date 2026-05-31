import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import appointmentBookingRecordService from '../services/AppointmentBookingRecord.service.js';

const createAppointmentBookingRecord = asyncHandler(async (req, res) => {
  const created =
    await appointmentBookingRecordService.createAppointmentBookingRecord(
      req.body,
    );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Appointment booking record created successfully',
    data: created,
  });
});

const getAllAppointmentBookingRecords = asyncHandler(async (req, res) => {
  const { rows, meta } =
    await appointmentBookingRecordService.getAllAppointmentBookingRecords(
      req.query,
    );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking records fetched successfully',
    data: rows,
    meta,
  });
});

const getAppointmentBookingRecordById = asyncHandler(async (req, res) => {
  const row =
    await appointmentBookingRecordService.getAppointmentBookingRecordById(
      req.params.id,
    );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking record fetched successfully',
    data: row,
  });
});

const updateAppointmentBookingRecord = asyncHandler(async (req, res) => {
  const updated =
    await appointmentBookingRecordService.updateAppointmentBookingRecord(
      req.params.id,
      req.body,
    );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking record updated successfully',
    data: updated,
  });
});

const deleteAppointmentBookingRecord = asyncHandler(async (req, res) => {
  await appointmentBookingRecordService.deleteAppointmentBookingRecord(
    req.params.id,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment booking record deleted successfully',
    data: null,
  });
});

const getAppointmentCounts = asyncHandler(async (req, res) => {
  const data = await appointmentBookingRecordService.getAppointmentCounts();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment counts fetched successfully',
    data,
  });
});

export {
  createAppointmentBookingRecord,
  getAllAppointmentBookingRecords,
  getAppointmentBookingRecordById,
  updateAppointmentBookingRecord,
  deleteAppointmentBookingRecord,
  getAppointmentCounts,
};
