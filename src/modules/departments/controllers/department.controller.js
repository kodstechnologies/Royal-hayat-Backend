import departmentService from '../services/department.service.js';

import asyncHandler from '../../../utils/asyncHandler.js';

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentsSchema,
  departmentIdSchema,
  departmentParamSchema,
} from '../validators/department.validator.js';

import ApiError from '../../../utils/ApiError.js';

import httpStatus from 'http-status';

import { putObject } from '../../../utils/putObject.js';

const DEPARTMENT_S3_FOLDER = 'department';

async function uploadDepartmentImage(file) {
  try {
    const { url } = await putObject(file, DEPARTMENT_S3_FOLDER);
    return url;
  } catch {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to upload image'
    );
  }
}

function coerceCustomExplainantionsField(
  formData
) {
  if (
    formData.customExplainantions ===
    undefined
  )
    return;

  const raw =
    formData.customExplainantions;

  if (typeof raw === 'string') {
    const t = raw.trim();

    if (!t) {
      formData.customExplainantions =
        [];

      return;
    }

    try {
      const parsed =
        JSON.parse(t);

      formData.customExplainantions =
        Array.isArray(parsed)
          ? parsed
          : [];
    } catch {
      formData.customExplainantions =
        [];
    }

    return;
  }

  if (!Array.isArray(raw)) {
    formData.customExplainantions =
      [];
  }
}

const createDepartment =
  asyncHandler(
    async (req, res) => {
      let imageUrl = '';

      if (req.file) {
        imageUrl = await uploadDepartmentImage(req.file);
      }

      const formData = {
        ...req.body,

        image: imageUrl,
      };

      coerceCustomExplainantionsField(
        formData
      );

      if (
        formData.isActive !==
        undefined
      ) {
        formData.isActive =
          formData.isActive ===
          'true' ||
          formData.isActive ===
          true;
      }

      if (
        formData.order !==
        undefined
      ) {
        formData.order =
          parseInt(
            formData.order
          ) || 0;
      }

      const {
        error,
        value,
      } =
        createDepartmentSchema.validate(
          formData,
          {
            abortEarly: false,
          }
        );

      if (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          error.details
            .map((d) => d.message)
            .join(', ')
        );
      }

      const department =
        await departmentService.createDepartment(
          value
        );

      res.status(201).json({
        success: true,

        message:
          'Department created successfully',

        data: department,
      });
    }
  );

const getAllDepartments =
  asyncHandler(
    async (req, res) => {
      const {
        error,
        value,
      } =
        getDepartmentsSchema.validate(
          req.query,
          {
            abortEarly: false,
          }
        );

      if (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          error.details
            .map((d) => d.message)
            .join(', ')
        );
      }

      const result =
        await departmentService.getAllDepartments(value);

      res.status(200).json({
        success: true,

        message:
          'Departments fetched successfully',

        data: result.departments,

        meta: result.meta,
      });
    }
  );

const getDepartmentSubspecialitiesAndDoctors =
  asyncHandler(
    async (req, res) => {
      const {
        error,
        value,
      } =
        departmentParamSchema.validate(
          req.params,
          {
            abortEarly: false,
          }
        );

      if (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          error.details
            .map((d) => d.message)
            .join(', ')
        );
      }

      const result =
        await departmentService.getDepartmentSubspecialitiesAndDoctors(
          value.id
        );

      res.status(200).json({
        success: true,

        message:
          'Department subspecialities and doctors fetched successfully',

        data: result,
      });
    }
  );

const getDepartmentById =
  asyncHandler(
    async (req, res) => {
      const {
        error,
        value,
      } =
        departmentIdSchema.validate(
          req.params,
          {
            abortEarly: false,
          }
        );

      if (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          error.details
            .map((d) => d.message)
            .join(', ')
        );
      }

      const department =
        await departmentService.getDepartmentById(
          value.id
        );

      res.status(200).json({
        success: true,

        message:
          'Department fetched successfully',

        data: department,
      });
    }
  );

const updateDepartment =
  asyncHandler(
    async (req, res) => {
      const {
        error: idError,
        value: idValue,
      } =
        departmentIdSchema.validate(
          req.params,
          {
            abortEarly: false,
          }
        );

      if (idError) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          idError.details
            .map((d) => d.message)
            .join(', ')
        );
      }

      let imageUrl =
        req.body.image;

      if (req.file) {
        imageUrl = await uploadDepartmentImage(req.file);
      }

      const formData = {
        ...req.body,

        image: imageUrl,
      };

      coerceCustomExplainantionsField(
        formData
      );

      if (
        formData.isActive !==
        undefined
      ) {
        formData.isActive =
          formData.isActive ===
          'true' ||
          formData.isActive ===
          true;
      }

      if (
        formData.order !==
        undefined
      ) {
        formData.order =
          parseInt(
            formData.order
          ) || 0;
      }

      const {
        error: dataError,
        value: dataValue,
      } =
        updateDepartmentSchema.validate(
          formData,
          {
            abortEarly: false,
          }
        );

      if (dataError) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          dataError.details
            .map((d) => d.message)
            .join(', ')
        );
      }

      const department =
        await departmentService.updateDepartment(
          idValue.id,
          dataValue
        );

      res.status(200).json({
        success: true,

        message:
          'Department updated successfully',

        data: department,
      });
    }
  );

const deleteDepartment =
  asyncHandler(
    async (req, res) => {
      const {
        error,
        value,
      } =
        departmentIdSchema.validate(
          req.params,
          {
            abortEarly: false,
          }
        );

      if (error) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          error.details
            .map((d) => d.message)
            .join(', ')
        );
      }

      await departmentService.deleteDepartment(
        value.id
      );

      res.status(200).json({
        success: true,

        message:
          'Department deleted successfully',

        data: null,
      });
    }
  );

export {
  createDepartment,

  getAllDepartments,

  getDepartmentSubspecialitiesAndDoctors,

  getDepartmentById,

  updateDepartment,

  deleteDepartment,
};