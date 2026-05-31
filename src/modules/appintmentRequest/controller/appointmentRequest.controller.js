import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import appointmentRequestService from '../services/AppointmentRequest.service.js';

const createAppointmentRequest = asyncHandler(async (req, res) => {
  const created = await appointmentRequestService.createAppointmentRequest(
    req.body,
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Appointment request created successfully',
    data: created,
  });
});

const getAllAppointmentRequests = asyncHandler(async (req, res) => {
  const { rows, meta } =
    await appointmentRequestService.getAllAppointmentRequests(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment requests fetched successfully',
    data: rows,
    meta,
  });
});

const getAppointmentRequestById = asyncHandler(async (req, res) => {
  const row = await appointmentRequestService.getAppointmentRequestById(
    req.params.id,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment request fetched successfully',
    data: row,
  });
});

const updateAppointmentRequest = asyncHandler(async (req, res) => {
  const updated = await appointmentRequestService.updateAppointmentRequest(
    req.params.id,
    req.body,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment request updated successfully',
    data: updated,
  });
});

const deleteAppointmentRequest = asyncHandler(async (req, res) => {
  await appointmentRequestService.deleteAppointmentRequest(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment request deleted successfully',
    data: null,
  });
});

const acceptAppointmentRequest = asyncHandler(async (req, res) => {
  const updated = await appointmentRequestService.acceptAppointmentRequest(
    req.params.id,
    req.body,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment request accepted successfully',
    data: updated,
  });
});

const cancelAppointmentRequest = asyncHandler(async (req, res) => {
  const updated = await appointmentRequestService.cancelAppointmentRequest(
    req.params.id,
    req.body,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Appointment request cancelled successfully',
    data: updated,
  });
});

export {
  createAppointmentRequest,
  getAllAppointmentRequests,
  getAppointmentRequestById,
  updateAppointmentRequest,
  deleteAppointmentRequest,
  acceptAppointmentRequest,
  cancelAppointmentRequest,
};
