import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import AppointmentRequest from '../model/appointmentRequest.model.js';

const OID = /^[0-9a-fA-F]{24}$/;

const VALID_STATUS = ['received', 'accepted', 'cancelled'];

const sanitizePayload = (body = {}) => {
  const payload = {};

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

  if (body.dateOfBirth !== undefined && body.dateOfBirth !== '') {
    const dob = new Date(body.dateOfBirth);

    if (Number.isNaN(dob.getTime())) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid dateOfBirth',
      );
    }

    payload.dateOfBirth = dob;
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

  return payload;
};

const validateCreate = (payload) => {

  if (!payload.fullname) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'fullname is required',
    );
  }

  if (!payload.phone) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'phone is required',
    );
  }

  if (
    payload.age !== undefined &&
    !Number.isFinite(payload.age)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'age must be a valid number',
    );
  }
};

const createAppointmentRequest = asyncHandler(
  async (req, res) => {

    const payload = sanitizePayload(req.body);

    validateCreate(payload);

    const created = await AppointmentRequest.create({
      ...payload,
      status: 'received',
    });
    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Appointment request created successfully',
      data: created,
    });
  },
);

const getAllAppointmentRequests = asyncHandler(
  async (req, res) => {

    const page = Math.max(
      1,
      Number(req.query.page) || 1,
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10),
    );

    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {

      const status = String(req.query.status)
        .trim()
        .toLowerCase();

      if (!VALID_STATUS.includes(status)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `status must be one of ${VALID_STATUS.join(', ')}`,
        );
      }

      filter.status = status;
    }

    const [rows, total] = await Promise.all([
      AppointmentRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      AppointmentRequest.countDocuments(filter),
    ]);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Appointment requests fetched successfully',
      data: rows,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  },
);

const getAppointmentRequestById = asyncHandler(
  async (req, res) => {

    const { id } = req.params;

    if (!OID.test(id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid appointment request id',
      );
    }

    const row = await AppointmentRequest.findById(id);

    if (!row) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment request not found',
      );
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Appointment request fetched successfully',
      data: row,
    });
  },
);

const updateAppointmentRequest = asyncHandler(
  async (req, res) => {

    const { id } = req.params;

    if (!OID.test(id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid appointment request id',
      );
    }

    const payload = sanitizePayload(req.body);

    if (Object.keys(payload).length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'At least one field is required to update',
      );
    }

    if (
      payload.age !== undefined &&
      !Number.isFinite(payload.age)
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'age must be a valid number',
      );
    }

    const updated =
      await AppointmentRequest.findByIdAndUpdate(
        id,
        payload,
        {
          new: true,
          runValidators: true,
        },
      );

    if (!updated) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment request not found',
      );
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Appointment request updated successfully',
      data: updated,
    });
  },
);

const deleteAppointmentRequest = asyncHandler(
  async (req, res) => {

    const { id } = req.params;

    if (!OID.test(id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid appointment request id',
      );
    }

    const deleted =
      await AppointmentRequest.findByIdAndDelete(id);

    if (!deleted) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment request not found',
      );
    }

    res.status(httpStatus.OK).json({
      success: true,
      message:
        'Appointment request deleted successfully',
      data: null,
    });
  },
);


const acceptAppointmentRequest = asyncHandler(
  async (req, res) => {

    const { id } = req.params;

    if (!OID.test(id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid appointment request id',
      );
    }

    const updated =
      await AppointmentRequest.findByIdAndUpdate(
        id,
        {
          status: 'accepted',
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!updated) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment request not found',
      );
    }

    res.status(httpStatus.OK).json({
      success: true,
      message:
        'Appointment request accepted successfully',
      data: updated,
    });
  },
);


const cancelAppointmentRequest = asyncHandler(
  async (req, res) => {

    const { id } = req.params;

    if (!OID.test(id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid appointment request id',
      );
    }

    const updated =
      await AppointmentRequest.findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!updated) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Appointment request not found',
      );
    }

    res.status(httpStatus.OK).json({
      success: true,
      message:
        'Appointment request cancelled successfully',
      data: updated,
    });
  },
);

export {
  createAppointmentRequest,
  getAllAppointmentRequests,
  getAppointmentRequestById,
  updateAppointmentRequest,
  deleteAppointmentRequest,
  acceptAppointmentRequest,
  cancelAppointmentRequest,
};