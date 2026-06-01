import departmentService from '../services/department.service.js';

import asyncHandler from '../../../utils/asyncHandler.js';

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentsSchema,
  departmentIdSchema,
} from '../validators/department.validator.js';

import ApiError from '../../../utils/ApiError.js';

import httpStatus from 'http-status';

import { uploadToCloudinary } from '../../../utils/cloudinary.js';

import fs from 'fs-extra';

const OID = /^[0-9a-fA-F]{24}$/i;

function coerceSubspecialitiesField(
  formData
) {
  if (
    formData.subspecialities ===
    undefined
  )
    return;

  const raw =
    formData.subspecialities;

  if (Array.isArray(raw)) {
    formData.subspecialities = [
      ...new Set(
        raw
          .map(String)
          .filter((id) =>
            OID.test(id)
          )
      ),
    ];

    return;
  }

  if (typeof raw === 'string') {
    const t = raw.trim();

    if (!t) {
      formData.subspecialities =
        [];

      return;
    }

    if (t.startsWith('[')) {
      try {
        const parsed =
          JSON.parse(t);

        formData.subspecialities =
          Array.isArray(parsed)
            ? [
              ...new Set(
                parsed
                  .map(String)
                  .filter((id) =>
                    OID.test(id)
                  )
              ),
            ]
            : [];

        return;
      } catch {
        formData.subspecialities =
          [];

        return;
      }
    }

    formData.subspecialities =
      OID.test(t) ? [t] : [];
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
        try {
          const result =
            await uploadToCloudinary(
              req.file.path,
              'royale-hayat/departments'
            );

          imageUrl =
            result.url;

          await fs.remove(
            req.file.path
          );
        } catch (error) {
          if (
            req.file &&
            req.file.path
          ) {
            await fs.remove(
              req.file.path
            );
          }

          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to upload image'
          );
        }
      }

      const formData = {
        ...req.body,

        image: imageUrl,
      };

      if (
        formData.subSpecialties &&
        typeof formData.subSpecialties ===
        'string'
      ) {
        formData.subSpecialties = [
          formData.subSpecialties,
        ];
      }

      if (
        formData.arabicSubSpecialties &&
        typeof formData.arabicSubSpecialties ===
        'string'
      ) {
        formData.arabicSubSpecialties =
          [
            formData.arabicSubSpecialties,
          ];
      }

      coerceSubspecialitiesField(
        formData
      );

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
        await departmentService.getAllDepartments(
          {
            ...value,

            sortBy:
              'createdAt',

            sortOrder: 'asc',
          }
        );

      res.status(200).json({
        success: true,

        message:
          'Departments fetched successfully',

        data: result.departments,

        meta: result.meta,
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
        try {
          const result =
            await uploadToCloudinary(
              req.file.path,
              'royale-hayat/departments'
            );

          imageUrl =
            result.url;

          await fs.remove(
            req.file.path
          );
        } catch (error) {
          if (
            req.file &&
            req.file.path
          ) {
            await fs.remove(
              req.file.path
            );
          }

          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to upload image'
          );
        }
      }

      const formData = {
        ...req.body,

        image: imageUrl,
      };

      if (
        formData.subSpecialties &&
        typeof formData.subSpecialties ===
        'string'
      ) {
        formData.subSpecialties = [
          formData.subSpecialties,
        ];
      }

      if (
        formData.arabicSubSpecialties &&
        typeof formData.arabicSubSpecialties ===
        'string'
      ) {
        formData.arabicSubSpecialties =
          [
            formData.arabicSubSpecialties,
          ];
      }

      coerceSubspecialitiesField(
        formData
      );

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

  getDepartmentById,

  updateDepartment,

  deleteDepartment,
};