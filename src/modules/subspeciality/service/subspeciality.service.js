import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import subspecialityRepository from '../repository/subspeciality.repository.js';
import CustomSubspeciality from '../model/customSubspeciality.model.js';

function normalizeExplanations(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((s) => String(s).trim())
    .filter(Boolean);
}

async function assertCustomDocExists(id) {
  const ok = await CustomSubspeciality.exists({
    _id: id,
  });

  if (!ok) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Linked custom subspeciality not found'
    );
  }
}

/**
 * Resolve array of:
 * - ObjectId strings
 * - inline custom subspeciality bodies
 */
async function resolveCustomSubspecialityItems(
  items
) {
  const ids = [];

  for (const item of items) {
    // Existing ObjectId
    if (typeof item === 'string') {
      await assertCustomDocExists(item);

      ids.push(item);
    }

    // New inline object
    else {
      const doc =
        await CustomSubspeciality.create({
          // English
          subHeading:
            item.subHeading?.trim() ||
            undefined,

          explanations: normalizeExplanations(
            item.explanations
          ),

          // Arabic
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

class SubspecialityService {
  async createSubspeciality(data) {
    const trimmedName =
      data.name.trim();

    const trimmedArabicName =
      data.arabicName.trim();

    // Duplicate check
    const nameTaken =
      await subspecialityRepository.existsByName(
        trimmedName,
        trimmedArabicName
      );

    if (nameTaken) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Subspeciality with this English or Arabic name already exists'
      );
    }

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
        // English
        name: trimmedName,

        description:
          data.description.trim(),

        // Arabic
        arabicName: trimmedArabicName,

        arabicDescription:
          data.arabicDescription.trim(),

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

    // English Name
    if (
      updateData.name !== undefined
    ) {
      const trimmed =
        updateData.name.trim();

      const arabicTrimmed =
        updateData.arabicName?.trim() ||
        '';

      const taken =
        await subspecialityRepository.existsByName(
          trimmed,
          arabicTrimmed,
          id
        );

      if (taken) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Subspeciality with this English or Arabic name already exists'
        );
      }

      payload.name = trimmed;
    }

    // Arabic Name
    if (
      updateData.arabicName !==
      undefined
    ) {
      payload.arabicName =
        updateData.arabicName.trim();
    }

    // English Description
    if (
      updateData.description !==
      undefined
    ) {
      payload.description =
        updateData.description.trim();
    }

    // Arabic Description
    if (
      updateData.arabicDescription !==
      undefined
    ) {
      payload.arabicDescription =
        updateData.arabicDescription.trim();
    }

    // Custom subspecialities
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

      // Remove all
      if (
        raw === null ||
        (Array.isArray(raw) &&
          raw.length === 0)
      ) {
        payload.customSubspecialities =
          [];

        for (const cid of existingIds) {
          await CustomSubspeciality.findByIdAndDelete(
            cid
          );
        }
      }

      // Replace
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

        for (const cid of toDelete) {
          await CustomSubspeciality.findByIdAndDelete(
            cid
          );
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

    for (const cid of customIds) {
      await CustomSubspeciality.findByIdAndDelete(
        cid
      );
    }
  }
}

export default new SubspecialityService();