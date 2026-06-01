import departmentRepository from '../repositories/department.repository.js';

import Department from '../models/department.model.js';

import CustomExplainantion from '../models/customExplainantion.model.js';

import Catagory from '../../catagory/model/catagory.model.js';

import Subspeciality from '../../subspeciality/model/subspeciality.model.js';

import ApiError from '../../../utils/ApiError.js';

import httpStatus from 'http-status';

function normalizeSubspecialityIds(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map(String)
        .filter((id) =>
          /^[0-9a-fA-F]{24}$/i.test(id)
        )
    ),
  ];
}

async function assertSubspecialitiesExist(
  ids
) {
  if (!ids || ids.length === 0) return;

  const count =
    await Subspeciality.countDocuments({
      _id: { $in: ids },
    });

  if (count !== ids.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'One or more subspecialities not found'
    );
  }
}

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

  /**
   * Delete old linked docs
   */
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

  /**
   * Create new docs
   */
  const docs =
    await CustomExplainantion.insertMany(
      list.map((item) => ({
        // ENGLISH

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

        // ARABIC

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
  /**
   * CREATE
   */
  async createDepartment(
    departmentData
  ) {
    /**
     * DUPLICATE CHECK
     */
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

    /**
     * CATEGORY CHECK
     */
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

    /**
     * SUBSPECIALITY CHECK
     */
    const subspecialities =
      normalizeSubspecialityIds(
        departmentData.subspecialities
      );

    await assertSubspecialitiesExist(
      subspecialities
    );

    const {
      subspecialities: _s,

      customExplainantions:
      ceInput,

      ...rest
    } = departmentData;

    /**
     * CREATE DEPARTMENT
     */
    const created =
      await departmentRepository.create(
        {
          ...rest,

          subspecialities,

          customExplainantions:
            [],
        }
      );

    /**
     * CREATE CUSTOM EXPLANATIONS
     */
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

  /**
   * GET ALL
   */
  async getAllDepartments(
    filters = {}
  ) {
    return await departmentRepository.findAll(
      filters
    );
  }

  /**
   * GET BY ID
   */
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

  /**
   * UPDATE
   */
  async updateDepartment(
    id,
    updateData
  ) {
    /**
     * CHECK EXISTS
     */
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

    /**
     * REPLACE CUSTOM EXPLANATIONS
     */
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

    /**
     * DUPLICATE NAME CHECK
     */
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

    /**
     * DUPLICATE DEPARTMENT ID CHECK
     */
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

    /**
     * CATEGORY CHECK
     */
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

    /**
     * SUBSPECIALITIES UPDATE
     */
    let payload = data;

    if (
      data.subspecialities !==
      undefined
    ) {
      const nextSubIds =
        normalizeSubspecialityIds(
          data.subspecialities
        );

      await assertSubspecialitiesExist(
        nextSubIds
      );

      const {
        subspecialities: _a,

        ...rest
      } = data;

      payload = {
        $set: {
          ...rest,

          subspecialities:
            nextSubIds,
        },

        $unset: {
          subspeciality: '',
        },
      };
    }

    return await departmentRepository.updateById(
      id,
      payload
    );
  }

  /**
   * DELETE
   */
  async deleteDepartment(id) {
    /**
     * CHECK EXISTS
     */
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

    /**
     * GET LINKED CUSTOM IDS
     */
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

    /**
     * DELETE DEPARTMENT
     */
    const deleted =
      await departmentRepository.deleteById(
        id
      );

    /**
     * DELETE LINKED CUSTOM DOCS
     */
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