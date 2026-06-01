import doctorService from '../services/doctor.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorsSchema,
  doctorIdSchema,
  departmentSchema,
  subspecialityIdParamSchema,
  getDoctorsBySubspecialityQuerySchema,
} from '../validators/doctor.validator.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import { uploadToCloudinary } from '../../../utils/cloudinary.js';
import fs from 'fs-extra';
import path from 'path';

const OID = /^[0-9a-fA-F]{24}$/i;

function coerceDoctorSubspecialitiesField(formData) {
  if (formData.subspecialities === undefined) return;
  const raw = formData.subspecialities;
  if (Array.isArray(raw)) {
    formData.subspecialities = [...new Set(raw.map(String).filter((id) => OID.test(id)))];
    return;
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) {
      formData.subspecialities = [];
      return;
    }
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t);
        formData.subspecialities = Array.isArray(parsed)
          ? [...new Set(parsed.map(String).filter((id) => OID.test(id)))]
          : [];
        return;
      } catch {
        formData.subspecialities = [];
        return;
      }
    }
    formData.subspecialities = OID.test(t) ? [t] : [];
  }
}

const createDoctor = asyncHandler(async (req, res) => {
  // Handle file upload
  let imageUrl = '';
  console.log(req.file);
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, 'royale-hayat/doctors');
      imageUrl = result.url;
      
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

  // Convert form data arrays to actual arrays
  const formData = { ...req.body, image: imageUrl };
  if (typeof formData.doctorId === 'string') {
    formData.doctorId = formData.doctorId.trim();
  }
  if (typeof formData.title === 'string') {
    formData.title = formData.title.trim();
    if (!formData.title) delete formData.title;
  }
  if (typeof formData.bio === 'string') {
    formData.bio = formData.bio.trim();
    if (!formData.bio) delete formData.bio;
  }
  if (typeof formData.specialty === 'string') {
    formData.specialty = formData.specialty.trim();
    if (!formData.specialty) delete formData.specialty;
  }
  if (typeof formData.initials === 'string') {
    formData.initials = formData.initials.trim().toUpperCase();
    if (!formData.initials) delete formData.initials;
  }
  
  // Convert string arrays from form data
  if (formData.qualifications && typeof formData.qualifications === 'string') {
    formData.qualifications = [formData.qualifications];
  }
  if (formData.expertise && typeof formData.expertise === 'string') {
    formData.expertise = [formData.expertise];
  }
  if (formData.languages && typeof formData.languages === 'string') {
    formData.languages = [formData.languages];
  }
  if (formData.symptoms && typeof formData.symptoms === 'string') {
    formData.symptoms = [formData.symptoms];
  }

  coerceDoctorSubspecialitiesField(formData);
  
  // Convert boolean strings to actual booleans
  if (formData.availableOnline !== undefined) {
    formData.availableOnline = formData.availableOnline === 'true' || formData.availableOnline === true;
  }
  if (formData.isActive !== undefined) {
    formData.isActive = formData.isActive === 'true' || formData.isActive === true;
  }

  // Validate input
  const { error, value } = createDoctorSchema.validate(formData, { abortEarly: false });
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

const getDoctorsBySubspeciality = asyncHandler(async (req, res) => {
  const { error: paramsError, value: paramsValue } = subspecialityIdParamSchema.validate(req.params, {
    abortEarly: false,
  });
  if (paramsError) {
    throw new ApiError(httpStatus.BAD_REQUEST, paramsError.details.map((d) => d.message).join(', '));
  }

  const { error: queryError, value: queryValue } = getDoctorsBySubspecialityQuerySchema.validate(req.query, {
    abortEarly: false,
  });
  if (queryError) {
    throw new ApiError(httpStatus.BAD_REQUEST, queryError.details.map((d) => d.message).join(', '));
  }

  const result = await doctorService.getAllDoctorsBySubspeciality(
    paramsValue.subspecialityId,
    queryValue,
  );

  res.status(200).json({
    success: true,
    message: 'Doctors fetched successfully',
    data: result.doctors,
    meta: result.meta,
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
      const result = await uploadToCloudinary(req.file.path, 'royale-hayat/doctors');
      imageUrl = result.url;
      
      // Clean up temp file
      await fs.remove(req.file.path);
    } catch (error) {
      console.log(error);
      // Clean up temp file on error
      if (req.file && req.file.path) {
        await fs.remove(req.file.path);
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload image');
    }
  }

  // Convert form data arrays to actual arrays
  const formData = { ...req.body, image: imageUrl };
  
  // Convert string arrays from form data
  if (formData.qualifications && typeof formData.qualifications === 'string') {
    formData.qualifications = [formData.qualifications];
  }
  if (formData.expertise && typeof formData.expertise === 'string') {
    formData.expertise = [formData.expertise];
  }
  if (formData.languages && typeof formData.languages === 'string') {
    formData.languages = [formData.languages];
  }
  if (formData.symptoms && typeof formData.symptoms === 'string') {
    formData.symptoms = [formData.symptoms];
  }

  coerceDoctorSubspecialitiesField(formData);
  
  // Convert boolean strings to actual booleans
  if (formData.availableOnline !== undefined) {
    formData.availableOnline = formData.availableOnline === 'true' || formData.availableOnline === true;
  }
  if (formData.isActive !== undefined) {
    formData.isActive = formData.isActive === 'true' || formData.isActive === true;
  }

  // Validate update data
  const { error: dataError, value: dataValue } = updateDoctorSchema.validate(formData, { abortEarly: false });
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
  getDoctorsBySubspeciality,
  updateDoctor,
  deleteDoctor,
  getDepartments,
  getSpecialties
};
