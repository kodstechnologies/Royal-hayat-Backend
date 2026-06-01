import httpStatus from "http-status";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiError from "../../../utils/ApiError.js";
import alSafwaService from "../services/alSafwa.service.js";
import {
  createAlSafwaSchema,
  getAlSafwaListSchema,
  alSafwaIdSchema,
} from "../validators/alSafwa.validator.js";

const createAlSafwaEnrollment = asyncHandler(async (req, res) => {
  const { error, value } = createAlSafwaSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  const enrollment = await alSafwaService.createEnrollment(value);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Al Safwa enrollment created successfully",
    data: enrollment,
  });
});

const getAllAlSafwaEnrollments = asyncHandler(async (req, res) => {
  const { error, value } = getAlSafwaListSchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  const result = await alSafwaService.getAllEnrollments(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Al Safwa enrollments fetched successfully",
    data: result.enrollments,
    meta: result.meta,
  });
});

const getAlSafwaEnrollmentById = asyncHandler(async (req, res) => {
  const { error, value } = alSafwaIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  const enrollment = await alSafwaService.getEnrollmentById(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Al Safwa enrollment fetched successfully",
    data: enrollment,
  });
});

export {
  createAlSafwaEnrollment,
  getAllAlSafwaEnrollments,
  getAlSafwaEnrollmentById,
};
