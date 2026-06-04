import departmentRepository from '../repositories/department.repository.js';

import Department from '../models/department.model.js';

import CustomExplainantion from '../models/customExplainantion.model.js';

import Catagory from '../../catagory/model/catagory.model.js';

import ApiError from '../../../utils/ApiError.js';

import httpStatus from 'http-status';

async function replaceCustomExplainantionsForDepartment(
  departmentId,
  items
) {
  const existing =
    await Department.findById(
      departmentId
    )
      .select(
        'customExplainantions'
      )
      .lean();

  const oldIds =
    (
      existing?.customExplainantions ||
      []
    ).map((x) => String(x));

  if (oldIds.length > 0) {
    await CustomExplainantion.deleteMany(
      {
        _id: { $in: oldIds },
      }
    );
  }

  const list = Array.isArray(items)
    ? items
    : [];

  if (list.length === 0) return [];

  const docs =
    await CustomExplainantion.insertMany(
      list.map((item) => ({

        heading:
          typeof item.heading ===
            'string' &&
            item.heading.trim()
            ? item.heading.trim()
            : undefined,

        subHeading:
          typeof item.subHeading ===
            'string' &&
            item.subHeading.trim()
            ? item.subHeading.trim()
            : undefined,

        explaination: Array.isArray(
          item.explaination
        )
          ? item.explaination
            .map((s) =>
              String(s).trim()
            )
            .filter(Boolean)
          : [],

        arabicHeading:
          typeof item.arabicHeading ===
            'string' &&
            item.arabicHeading.trim()
            ? item.arabicHeading.trim()
            : undefined,

        arabicSubHeading:
          typeof item.arabicSubHeading ===
            'string' &&
            item.arabicSubHeading.trim()
            ? item.arabicSubHeading.trim()
            : undefined,

        arabicExplaination:
          Array.isArray(
            item.arabicExplaination
          )
            ? item.arabicExplaination
              .map((s) =>
                String(s).trim()
              )
              .filter(Boolean)
            : [],
      }))
    );

  return docs.map((d) => d._id);
}

class DepartmentService {
  async createDepartment(
    departmentData
  ) {
    const duplicate =
      await Department.findOne({
        $or: [
          {
            name:
              departmentData.name,
          },

          {
            arabicName:
              departmentData.arabicName,
          },
        ],
      });

    if (duplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Department with this English or Arabic name already exists'
      );
    }

    const catagoryExists =
      await Catagory.exists({
        _id: departmentData.catagory,
      });

    if (!catagoryExists) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Category not found'
      );
    }

    const {
      customExplainantions:
      ceInput,

      ...rest
    } = departmentData;

    const created =
      await departmentRepository.create(
        {
          ...rest,

          customExplainantions:
            [],
        }
      );

    const newIds =
      await replaceCustomExplainantionsForDepartment(
        created._id,
        ceInput
      );

    if (newIds.length > 0) {
      await Department.findByIdAndUpdate(
        created._id,
        {
          $set: {
            customExplainantions:
              newIds,
          },
        }
      );
    }

    return await this.getDepartmentById(
      String(created._id)
    );
  }

  async getAllDepartments(
    filters = {}
  ) {
    return await departmentRepository.findAll(
      filters
    );
  }

  async getDepartmentById(id) {
    const department =
      await departmentRepository.findById(
        id
      );

    if (!department) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Department not found'
      );
    }

    return department;
  }

  async updateDepartment(
    id,
    updateData
  ) {
    const existingDepartment =
      await departmentRepository.exists(
        id
      );

    if (!existingDepartment) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Department not found'
      );
    }

    let data = {
      ...updateData,
    };

    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        'customExplainantions'
      )
    ) {
      const newIds =
        await replaceCustomExplainantionsForDepartment(
          id,
          updateData.customExplainantions
        );

      const {
        customExplainantions:
        _c,

        ...rest
      } = updateData;

      data = {
        ...rest,

        customExplainantions:
          newIds,
      };
    }

    if (
      data.name ||
      data.arabicName
    ) {
      const duplicate =
        await Department.findOne({
          _id: { $ne: id },

          $or: [
            ...(data.name
              ? [
                {
                  name:
                    data.name,
                },
              ]
              : []),

            ...(data.arabicName
              ? [
                {
                  arabicName:
                    data.arabicName,
                },
              ]
              : []),
          ],
        });

      if (duplicate) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Department with this English or Arabic name already exists'
        );
      }
    }

    if (data.departmentId) {
      const departmentIdExists =
        await Department.findOne({
          departmentId:
            data.departmentId,

          _id: {
            $ne: id,
          },
        });

      if (departmentIdExists) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Department with this departmentId already exists'
        );
      }
    }

    if (data.catagory) {
      const catagoryExists =
        await Catagory.exists({
          _id: data.catagory,
        });

      if (!catagoryExists) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Category not found'
        );
      }
    }

    return await departmentRepository.updateById(
      id,
      data
    );
  }

  async deleteDepartment(id) {
    const existingDepartment =
      await departmentRepository.exists(
        id
      );

    if (!existingDepartment) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Department not found'
      );
    }

    const dept =
      await Department.findById(id)
        .select(
          'customExplainantions'
        )
        .lean();

    const ceIds =
      (
        dept?.customExplainantions ||
        []
      ).map((x) => String(x));

    const deleted =
      await departmentRepository.deleteById(
        id
      );

    if (ceIds.length > 0) {
      await CustomExplainantion.deleteMany(
        {
          _id: { $in: ceIds },
        }
      );
    }

    return deleted;
  }
}

export default new DepartmentService();