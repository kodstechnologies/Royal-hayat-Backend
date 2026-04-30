import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import enquiryService from '../service/enquiry.service.js';
import {
  createEnquirySchema,
  updateEnquirySchema,
  getEnquiriesSchema,
  enquiryIdSchema
} from '../validators/enquiry.validator.js';

const createEnquiry = asyncHandler(async (req, res) => {
  const { error, value } = createEnquirySchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const enquiry = await enquiryService.createEnquiry(value);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Enquiry created successfully',
    data: enquiry
  });
});

const getAllEnquiries = asyncHandler(async (req, res) => {
  const { error, value } = getEnquiriesSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const result = await enquiryService.getAllEnquiries(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Enquiries fetched successfully',
    data: result.enquiries,
    meta: result.meta
  });
});

const getEnquiryById = asyncHandler(async (req, res) => {
  const { error, value } = enquiryIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  const enquiry = await enquiryService.getEnquiryById(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Enquiry fetched successfully',
    data: enquiry
  });
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const { error: idError, value: idValue } = enquiryIdSchema.validate(req.params, {
    abortEarly: false
  });
  if (idError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      idError.details.map((detail) => detail.message).join(', ')
    );
  }

  const { error: bodyError, value: bodyValue } = updateEnquirySchema.validate(req.body, {
    abortEarly: false
  });
  if (bodyError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      bodyError.details.map((detail) => detail.message).join(', ')
    );
  }

  const enquiry = await enquiryService.updateEnquiry(idValue.id, bodyValue);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Enquiry updated successfully',
    data: enquiry
  });
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  const { error, value } = enquiryIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', ')
    );
  }

  await enquiryService.deleteEnquiry(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Enquiry deleted successfully',
    data: null
  });
});

export {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry
};
