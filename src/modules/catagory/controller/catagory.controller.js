import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import catagoryService from '../service/catagory.service.js';
import {
  createCatagorySchema,
  updateCatagorySchema,
  getCatagoriesSchema,
  catagoryIdSchema,
} from '../validators/catagory.validator.js';

const createCatagory = asyncHandler(async (req, res) => {
  const { error, value } = createCatagorySchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  const catagory = await catagoryService.createCatagory(value);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Category created successfully',
    data: catagory,
  });
});

const getAllCatagories = asyncHandler(async (req, res) => {
  const { error, value } = getCatagoriesSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  const result = await catagoryService.getAllCatagories(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Categories fetched successfully',
    data: result.catagories,
    meta: result.meta,
  });
});

/** All categories with nested departments and doctors per department */
const getCatagoriesWithDepartmentsAndDoctors = asyncHandler(async (req, res) => {
  const data = await catagoryService.getCatagoriesWithDepartmentsAndDoctors();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Categories with departments and doctors fetched successfully',
    data,
  });
});

const getCatagoryById = asyncHandler(async (req, res) => {
  const { error, value } = catagoryIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  const catagory = await catagoryService.getCatagoryById(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Category fetched successfully',
    data: catagory,
  });
});

const updateCatagory = asyncHandler(async (req, res) => {
  const { error: idError, value: idValue } = catagoryIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (idError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      idError.details.map((d) => d.message).join(', ')
    );
  }

  const { error: bodyError, value: bodyValue } = updateCatagorySchema.validate(req.body, {
    abortEarly: false,
  });
  if (bodyError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      bodyError.details.map((d) => d.message).join(', ')
    );
  }

  const catagory = await catagoryService.updateCatagory(idValue.id, bodyValue);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Category updated successfully',
    data: catagory,
  });
});

const deleteCatagory = asyncHandler(async (req, res) => {
  const { error, value } = catagoryIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  await catagoryService.deleteCatagory(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Category deleted successfully',
    data: null,
  });
});

export {
  createCatagory,
  getAllCatagories,
  getCatagoriesWithDepartmentsAndDoctors,
  getCatagoryById,
  updateCatagory,
  deleteCatagory,
};
