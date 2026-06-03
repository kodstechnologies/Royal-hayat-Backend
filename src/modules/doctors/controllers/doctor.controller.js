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

const ARRAY_FIELDS = [
  'subspecialities',
  'subspecialitiesAr',
  'qualifications',
  'qualificationsAr',
  'expertise',
  'expertiseAr',
  'languages',
  'languagesAr',
];

function coerceStringArrayField(formData, field) {
  if (formData[field] === undefined) return;

  const raw = formData[field];

  if (Array.isArray(raw)) {
    formData[field] = raw
      .map((s) => String(s).trim())
      .filter(Boolean);
    return;
  }

  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) {
      formData[field] = [];
      return;
    }
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t);
        formData[field] = Array.isArray(parsed)
          ? parsed.map((s) => String(s).trim()).filter(Boolean)
          : [];
      } catch {
        formData[field] = [];
      }
      return;
    }
    formData[field] = [t];
  }
}

function coerceDoctorFormArrays(formData) {
  for (const field of ARRAY_FIELDS) {
    coerceStringArrayField(formData, field);
  }
}

function coerceDoctorBooleans(formData) {
  if (formData.availableOnline !== undefined) {
    formData.availableOnline =
      formData.availableOnline === 'true' ||
      formData.availableOnline === true;
  }
  if (formData.isActive !== undefined) {
    formData.isActive =
      formData.isActive === 'true' || formData.isActive === true;
  }
}

function trimOptionalString(formData, field) {
  if (typeof formData[field] === 'string') {
    formData[field] = formData[field].trim();
    if (!formData[field]) delete formData[field];
  }
}

const createDoctor = asyncHandler(async (req, res) => {
  let imageUrl = '';

  if (req.file) {
    try {
      const result = await uploadToCloudinary(
        req.file.path,
        'royale-hayat/doctors',
      );
      imageUrl = result.url;
      await fs.remove(req.file.path);
    } catch {
      if (req.file?.path) {
        await fs.remove(req.file.path);
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to upload image',
      );
    }
  }

  const formData = { ...req.body, image: imageUrl };

  if (typeof formData.doctorId === 'string') {
    formData.doctorId = formData.doctorId.trim();
  }

  trimOptionalString(formData, 'title');
  trimOptionalString(formData, 'titleAr');
  trimOptionalString(formData, 'initials');
  trimOptionalString(formData, 'initialsAr');

  coerceDoctorFormArrays(formData);
  coerceDoctorBooleans(formData);

  const { error, value } = createDoctorSchema.validate(formData, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', '),
    );
  }

  const doctor = await doctorService.createDoctor(value);

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: doctor,
  });
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const { error, value } = getDoctorsSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', '),
    );
  }

  const result = await doctorService.getAllDoctors(value);

  res.status(200).json({
    success: true,
    message: 'Doctors fetched successfully',
    data: result.doctors,
    meta: result.meta,
  });
});

const getDoctorById = asyncHandler(async (req, res) => {
  const { error, value } = doctorIdSchema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', '),
    );
  }

  const doctor = await doctorService.getDoctorById(value.id);

  res.status(200).json({
    success: true,
    message: 'Doctor fetched successfully',
    data: doctor,
  });
});

const getDoctorsByDepartment = asyncHandler(async (req, res) => {
  const { error, value } = departmentSchema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', '),
    );
  }

  const doctors = await doctorService.getDoctorsByDepartment(value.department);

  res.status(200).json({
    success: true,
    message: 'Doctors fetched successfully',
    data: doctors,
  });
});

const getDoctorsBySubspeciality = asyncHandler(async (req, res) => {
  const { error: paramsError, value: paramsValue } =
    subspecialityIdParamSchema.validate(req.params, { abortEarly: false });

  if (paramsError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      paramsError.details.map((d) => d.message).join(', '),
    );
  }

  const { error: queryError, value: queryValue } =
    getDoctorsBySubspecialityQuerySchema.validate(req.query, {
      abortEarly: false,
    });

  if (queryError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      queryError.details.map((d) => d.message).join(', '),
    );
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
  const { error: idError, value: idValue } = doctorIdSchema.validate(
    req.params,
    { abortEarly: false },
  );

  if (idError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      idError.details.map((d) => d.message).join(', '),
    );
  }

  let imageUrl = req.body.image;

  if (req.file) {
    try {
      const result = await uploadToCloudinary(
        req.file.path,
        'royale-hayat/doctors',
      );
      imageUrl = result.url;
      await fs.remove(req.file.path);
    } catch {
      if (req.file?.path) {
        await fs.remove(req.file.path);
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to upload image',
      );
    }
  }

  const formData = { ...req.body, image: imageUrl };

  trimOptionalString(formData, 'title');
  trimOptionalString(formData, 'titleAr');
  trimOptionalString(formData, 'initials');
  trimOptionalString(formData, 'initialsAr');

  coerceDoctorFormArrays(formData);
  coerceDoctorBooleans(formData);

  const { error: dataError, value: dataValue } = updateDoctorSchema.validate(
    formData,
    { abortEarly: false },
  );

  if (dataError) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      dataError.details.map((d) => d.message).join(', '),
    );
  }

  const doctor = await doctorService.updateDoctor(idValue.id, dataValue);

  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: doctor,
  });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const { error, value } = doctorIdSchema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((d) => d.message).join(', '),
    );
  }

  await doctorService.deleteDoctor(value.id);

  res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
    data: null,
  });
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await doctorService.getDepartments();

  res.status(200).json({
    success: true,
    message: 'Departments fetched successfully',
    data: departments,
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
};
