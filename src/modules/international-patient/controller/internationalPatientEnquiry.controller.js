import httpStatus from "http-status";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiError from "../../../utils/ApiError.js";
import internationalPatientEnquiryService from "../services/internationalPatientEnquiry.service.js";
import {
  createInternationalPatientEnquirySchema,
  getInternationalPatientEnquiryListSchema,
  internationalPatientEnquiryIdSchema,
} from "../validators/internationalPatientEnquiry.validator.js";

const normalizeCreatePayload = (body) => ({
  firstName: body.firstName,
  lastName: body.lastName,
  email: body.email,
  phone: (body.phone || body.mobile || "").trim(),
  country: body.country?.trim() || "",
  address: body.address?.trim() || "",
  comments: body.comments?.trim() || "",
  isActive: body.isActive ?? true,
});

const createInternationalPatientEnquiry = asyncHandler(async (req, res) => {
  const { error, value } = createInternationalPatientEnquirySchema.validate(
    req.body,
    { abortEarly: false }
  );
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  const enquiry = await internationalPatientEnquiryService.createEnquiry(
    normalizeCreatePayload(value)
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "International patient enquiry created successfully",
    data: enquiry,
  });
});

const getAllInternationalPatientEnquiries = asyncHandler(async (req, res) => {
  const { error, value } = getInternationalPatientEnquiryListSchema.validate(
    req.query,
    { abortEarly: false }
  );
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  const result = await internationalPatientEnquiryService.getAllEnquiries(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: "International patient enquiries fetched successfully",
    data: result.enquiries,
    meta: result.meta,
  });
});

const getInternationalPatientEnquiryById = asyncHandler(async (req, res) => {
  const { error, value } = internationalPatientEnquiryIdSchema.validate(
    req.params,
    { abortEarly: false }
  );
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  const enquiry = await internationalPatientEnquiryService.getEnquiryById(
    value.id
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "International patient enquiry fetched successfully",
    data: enquiry,
  });
});

export {
  createInternationalPatientEnquiry,
  getAllInternationalPatientEnquiries,
  getInternationalPatientEnquiryById,
};
