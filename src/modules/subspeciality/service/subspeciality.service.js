import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import subspecialityRepository from '../repository/subspeciality.repository.js';
import CustomSubspeciality from '../model/customSubspeciality.model.js';
import Department from '../../departments/models/department.model.js';

function normalizeExplanations(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((s) => String(s).trim())
    .filter(Boolean);
}

async function assertCustomDocsExist(ids) {
  const uniqueIds = [...new Set(ids.map(String))];
  if (uniqueIds.length === 0) return;

  const count = await CustomSubspeciality.countDocuments({
    _id: { $in: uniqueIds },
  });

  if (count !== uniqueIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Linked custom subspeciality not found'
    );
  }
}

async function resolveCustomSubspecialityItems(
  items
) {
  const ids = [];
  const existingIds = items.filter((item) => typeof item === 'string');
  await assertCustomDocsExist(existingIds);

  for (const item of items) {
    if (typeof item === 'string') {
      ids.push(item);
    }

    else {
      const doc =
        await CustomSubspeciality.create({
          subHeading:
            item.subHeading?.trim() ||
            undefined,

          explanations: normalizeExplanations(
            item.explanations
          ),

          arabicSubHeading:
            item.arabicSubHeading?.trim() ||
            undefined,

          arabicExplanations:
            normalizeExplanations(
              item.arabicExplanations
            ),
        });

      ids.push(String(doc._id));
    }
  }

  return ids;
}

function idsToRemoveAfterReplace(
  existingIds,
  newIds
) {
  const next = new Set(
    newIds.map(String)
  );

  return existingIds.filter(
    (id) => !next.has(String(id))
  );
}

async function assertDepartmentExists(departmentId) {
  const exists = await Department.exists({
    _id: departmentId,
  });

  if (!exists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Department not found'
    );
  }
}

class SubspecialityService {
  async createSubspeciality(data) {
    const trimmedName =
      data.name.trim();

    const trimmedArabicName =
      data.arabicName.trim();

    const nameTaken =
      await subspecialityRepository.existsByName(
        trimmedName,
        trimmedArabicName,
        data.department
      );

    if (nameTaken) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Subspeciality with this English or Arabic name already exists'
      );
    }

    await assertDepartmentExists(data.department);

    const raw =
      data.customSubspecialities;

    const customSubspecialities =
      Array.isArray(raw) &&
        raw.length > 0
        ? await resolveCustomSubspecialityItems(
          raw
        )
        : [];

    return await subspecialityRepository.create(
      {
        name: trimmedName,

        description:
          data.description.trim(),

        arabicName: trimmedArabicName,

        arabicDescription:
          data.arabicDescription.trim(),

        department: data.department,

        customSubspecialities,
      }
    );
  }

  async getAllSubspecialities(
    filters = {}
  ) {
    return await subspecialityRepository.findAll(
      filters
    );
  }

  async getSubspecialityById(id) {
    const row =
      await subspecialityRepository.findById(
        id,
        {
          populateCustom: true,
        }
      );

    if (!row) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Subspeciality not found'
      );
    }

    return row;
  }

  async updateSubspeciality(
    id,
    updateData
  ) {
    const exists =
      await subspecialityRepository.exists(
        id
      );

    if (!exists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Subspeciality not found'
      );
    }

    const payload = {};

    if (
      updateData.name !== undefined ||
      updateData.arabicName !== undefined
    ) {
      const existing =
        await subspecialityRepository.findById(
          id,
          { populateCustom: false }
        );

      const departmentId =
        updateData.department ??
        String(
          existing.department?._id ??
            existing.department
        );

      const trimmed =
        updateData.name !== undefined
          ? updateData.name.trim()
          : existing.name;

      const arabicTrimmed =
        updateData.arabicName !== undefined
          ? updateData.arabicName.trim()
          : existing.arabicName;

      const taken =
        await subspecialityRepository.existsByName(
          trimmed,
          arabicTrimmed,
          departmentId,
          id
        );

      if (taken) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Subspeciality with this English or Arabic name already exists'
        );
      }

      if (updateData.name !== undefined) {
        payload.name = trimmed;
      }
    }

    if (
      updateData.arabicName !==
      undefined
    ) {
      payload.arabicName =
        updateData.arabicName.trim();
    }

    if (
      updateData.description !==
      undefined
    ) {
      payload.description =
        updateData.description.trim();
    }

    if (
      updateData.arabicDescription !==
      undefined
    ) {
      payload.arabicDescription =
        updateData.arabicDescription.trim();
    }

    if (updateData.department !== undefined) {
      await assertDepartmentExists(updateData.department);
      payload.department = updateData.department;
    }

    if (
      updateData.customSubspecialities !==
      undefined
    ) {
      const existing =
        await subspecialityRepository.findById(
          id,
          {
            populateCustom: false,
          }
        );

      const existingIds =
        Array.isArray(
          existing?.customSubspecialities
        )
          ? existing.customSubspecialities.map(
            (x) => String(x)
          )
          : [];

      const raw =
        updateData.customSubspecialities;

      if (
        raw === null ||
        (Array.isArray(raw) &&
          raw.length === 0)
      ) {
        payload.customSubspecialities =
          [];

        if (existingIds.length > 0) {
          await CustomSubspeciality.deleteMany({
            _id: { $in: existingIds },
          });
        }
      }

      else if (Array.isArray(raw)) {
        const newIds =
          await resolveCustomSubspecialityItems(
            raw
          );

        const toDelete =
          idsToRemoveAfterReplace(
            existingIds,
            newIds
          );

        if (toDelete.length > 0) {
          await CustomSubspeciality.deleteMany({
            _id: { $in: toDelete },
          });
        }

        payload.customSubspecialities =
          newIds;
      }
    }

    if (
      Object.keys(payload).length > 0
    ) {
      const updated =
        await subspecialityRepository.updateById(
          id,
          payload
        );

      if (!updated) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Subspeciality not found'
        );
      }
    }

    return await subspecialityRepository.findById(
      id,
      {
        populateCustom: true,
      }
    );
  }

  async deleteSubspeciality(id) {
    const exists =
      await subspecialityRepository.exists(
        id
      );

    if (!exists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Subspeciality not found'
      );
    }

    const row =
      await subspecialityRepository.findById(
        id,
        {
          populateCustom: false,
        }
      );

    const customIds = Array.isArray(
      row?.customSubspecialities
    )
      ? row.customSubspecialities.map(
        (x) => String(x)
      )
      : [];

    await subspecialityRepository.deleteById(
      id
    );

    if (customIds.length > 0) {
      await CustomSubspeciality.deleteMany({
        _id: { $in: customIds },
      });
    }
  }
}

export default new SubspecialityService();