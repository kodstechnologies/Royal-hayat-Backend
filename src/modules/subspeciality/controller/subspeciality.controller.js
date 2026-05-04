import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import subspecialityService from '../service/subspeciality.service.js';
import {
  createSubspecialitySchema,
  updateSubspecialitySchema,
  getSubspecialitiesSchema,
  subspecialityIdSchema,
} from '../validators/subspeciality.validator.js';

const createSubspeciality = asyncHandler(async (req, res) => {
  const { error, value } = createSubspecialitySchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  const subspeciality = await subspecialityService.createSubspeciality(value);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Subspeciality created successfully',
    data: subspeciality,
  });
});

const getAllSubspecialities = asyncHandler(async (req, res) => {
  const { error, value } = getSubspecialitiesSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  const result = await subspecialityService.getAllSubspecialities(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Subspecialities fetched successfully',
    data: result.subspecialities,
    meta: result.meta,
  });
});

const getSubspecialityById = asyncHandler(async (req, res) => {
  const { error, value } = subspecialityIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  const subspeciality = await subspecialityService.getSubspecialityById(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Subspeciality fetched successfully',
    data: subspeciality,
  });
});

const updateSubspeciality = asyncHandler(async (req, res) => {
  const { error: idError, value: idValue } = subspecialityIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (idError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      idError.details.map((d) => d.message).join(', ')
    );
  }

  const { error: bodyError, value: bodyValue } = updateSubspecialitySchema.validate(req.body, {
    abortEarly: false,
  });
  if (bodyError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      bodyError.details.map((d) => d.message).join(', ')
    );
  }

  const subspeciality = await subspecialityService.updateSubspeciality(idValue.id, bodyValue);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Subspeciality updated successfully',
    data: subspeciality,
  });
});

const deleteSubspeciality = asyncHandler(async (req, res) => {
  const { error, value } = subspecialityIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', ')
    );
  }

  await subspecialityService.deleteSubspeciality(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Subspeciality deleted successfully',
    data: null,
  });
});

export {
  createSubspeciality,
  getAllSubspecialities,
  getSubspecialityById,
  updateSubspeciality,
  deleteSubspeciality,
};
