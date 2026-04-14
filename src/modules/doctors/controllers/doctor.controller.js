import doctorService from '../services/doctor.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorsSchema,
  doctorIdSchema,
  departmentSchema
} from '../validators/doctor.validator.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import { uploadToCloudinary } from '../../../utils/cloudinary.js';
import fs from 'fs-extra';
import path from 'path';

const createDoctor = asyncHandler(async (req, res) => {
  // Handle file upload
  let imageUrl = '';
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path);
      imageUrl = result.secure_url;
      
      // Clean up temp file
      await fs.remove(req.file.path);
    } catch (error) {
      // Clean up temp file on error
      if (req.file && req.file.path) {
        await fs.remove(req.file.path);
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload image');
    }
  }

  // Validate input (merge image URL with form data)
  const { error, value } = createDoctorSchema.validate({ ...req.body, image: imageUrl }, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  await doctorService.createDoctor(value);
  
  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: null
  });
});

const getAllDoctors = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { error, value } = getDoctorsSchema.validate(req.query, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const result = await doctorService.getAllDoctors(value);
  
  res.status(200).json({
    success: true,
    message: 'Doctors fetched successfully',
    data: result.doctors,
    meta: result.meta
  });
});

const getDoctorById = asyncHandler(async (req, res) => {
  // Validate doctor ID
  const { error, value } = doctorIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const doctor = await doctorService.getDoctorById(value.id);
  
  res.status(200).json({
    success: true,
    message: 'Doctor fetched successfully',
    data: doctor
  });
});

const getDoctorsByDepartment = asyncHandler(async (req, res) => {
  // Validate department parameter
  const { error, value } = departmentSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  const doctors = await doctorService.getDoctorsByDepartment(value.department);
  
  res.status(200).json({
    success: true,
    message: 'Doctors fetched successfully',
    data: doctors
  });
});

const updateDoctor = asyncHandler(async (req, res) => {
  // Validate doctor ID
  const { error: idError, value: idValue } = doctorIdSchema.validate(req.params, { abortEarly: false });
  if (idError) {
    throw new ApiError(httpStatus.BAD_REQUEST, idError.details.map(d => d.message).join(", "));
  }

  // Handle file upload
  let imageUrl = req.body.image; // Keep existing image if no new file
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path);
      imageUrl = result.secure_url;
      
      // Clean up temp file
      await fs.remove(req.file.path);
    } catch (error) {
      // Clean up temp file on error
      if (req.file && req.file.path) {
        await fs.remove(req.file.path);
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload image');
    }
  }

  // Validate update data (merge image URL with form data)
  const { error: dataError, value: dataValue } = updateDoctorSchema.validate({ ...req.body, image: imageUrl }, { abortEarly: false });
  if (dataError) {
    throw new ApiError(httpStatus.BAD_REQUEST, dataError.details.map(d => d.message).join(", "));
  }

  const doctor = await doctorService.updateDoctor(idValue.id, dataValue);
  
  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: doctor
  });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  // Validate doctor ID
  const { error, value } = doctorIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details.map(d => d.message).join(", "));
  }

  await doctorService.deleteDoctor(value.id);
  
  res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
    data: null
  });
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await doctorService.getDepartments();
  
  res.status(200).json({
    success: true,
    message: 'Departments fetched successfully',
    data: departments
  });
});

const getSpecialties = asyncHandler(async (req, res) => {
  const specialties = await doctorService.getSpecialties();
  
  res.status(200).json({
    success: true,
    message: 'Specialties fetched successfully',
    data: specialties
  });
});

export {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorsByDepartment,
  updateDoctor,
  deleteDoctor,
  getDepartments,
  getSpecialties
};
