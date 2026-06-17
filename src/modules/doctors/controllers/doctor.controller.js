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
import { buildExpertisePayloads } from '../utils/expertise.util.js';

const ARRAY_FIELDS = [
  'subspecialities',
  'subspecialitiesAr',
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

function coerceExpertiseField(formData) {
  if (formData.expertise === undefined) return;

  const raw = formData.expertise;

  if (Array.isArray(raw)) return;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      formData.expertise = [];
      return;
    }

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        formData.expertise = Array.isArray(parsed) ? parsed : [];
      } catch {
        formData.expertise = [];
      }
      return;
    }

    formData.expertise = [trimmed];
  }
}

function coerceQualificationsField(formData) {
  if (formData.qualifications === undefined) return;

  const raw = formData.qualifications;

  if (Array.isArray(raw)) return;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      formData.qualifications = [];
      return;
    }

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        formData.qualifications = Array.isArray(parsed) ? parsed : [];
      } catch {
        formData.qualifications = [];
      }
      return;
    }

    formData.qualifications = [trimmed];
  }
}

function mergeLegacyQualificationsFields(formData) {
  const en = formData.qualifications;
  const ar = formData.qualificationsAr;

  const enIsFlatStrings =
    Array.isArray(en) && en.every((item) => typeof item === 'string');
  const arIsFlatStrings =
    ar === undefined ||
    (Array.isArray(ar) && ar.every((item) => typeof item === 'string'));

  if (!enIsFlatStrings || !arIsFlatStrings) {
    delete formData.qualificationsAr;
    return;
  }

  formData.qualifications = buildExpertisePayloads(
    Array.isArray(en) ? en : [],
    Array.isArray(ar) ? ar : [],
  );
  delete formData.qualificationsAr;
}

function coerceDoctorFormArrays(formData) {
  for (const field of ARRAY_FIELDS) {
    coerceStringArrayField(formData, field);
  }

  const qualificationsRaw = formData.qualifications;
  coerceQualificationsField(formData);
  if (
    qualificationsRaw !== undefined &&
    typeof formData.qualifications === 'string'
  ) {
    formData.qualifications = qualificationsRaw;
    coerceStringArrayField(formData, 'qualifications');
  }

  if (formData.qualificationsAr !== undefined) {
    coerceStringArrayField(formData, 'qualificationsAr');
  }

  mergeLegacyQualificationsFields(formData);
  coerceExpertiseField(formData);
  delete formData.expertiseAr;
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
  const formData = { ...req.body };
  if (!formData.image) formData.image = '';
  delete formData.imageKey;

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

  const formData = { ...req.body };
  delete formData.imageKey;

  if (!req.file) {
    delete formData.image;
  }

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
