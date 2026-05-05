import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import subspecialityRepository from '../repository/subspeciality.repository.js';
import CustomSubspeciality from '../model/customSubspeciality.model.js';

function normalizeExplanations(value) {
  if (!Array.isArray(value)) return [];
  return value.map((s) => String(s).trim()).filter(Boolean);
}

async function assertCustomDocExists(id) {
  const ok = await CustomSubspeciality.exists({ _id: id });
  if (!ok) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Linked custom subspeciality not found');
  }
}

/** Resolve array of ObjectId strings or inline `{ subHeading, explanations }` bodies to id list. */
async function resolveCustomSubspecialityItems(items) {
  const ids = [];
  for (const item of items) {
    if (typeof item === 'string') {
      await assertCustomDocExists(item);
      ids.push(item);
    } else {
      const doc = await CustomSubspeciality.create({
        subHeading: item.subHeading?.trim() || undefined,
        explanations: normalizeExplanations(item.explanations),
      });
      ids.push(String(doc._id));
    }
  }
  return ids;
}

function idsToRemoveAfterReplace(existingIds, newIds) {
  const next = new Set(newIds.map(String));
  return existingIds.filter((id) => !next.has(String(id)));
}

class SubspecialityService {
  async createSubspeciality(data) {
    const nameTaken = await subspecialityRepository.existsByName(data.name.trim());
    if (nameTaken) {
      throw new ApiError(httpStatus.CONFLICT, 'Subspeciality with this name already exists');
    }

    const raw = data.customSubspecialities;
    const customSubspecialities =
      Array.isArray(raw) && raw.length > 0 ? await resolveCustomSubspecialityItems(raw) : [];

    return await subspecialityRepository.create({
      name: data.name.trim(),
      description: data.description.trim(),
      customSubspecialities,
    });
  }

  async getAllSubspecialities(filters = {}) {
    return await subspecialityRepository.findAll(filters);
  }

  async getSubspecialityById(id) {
    const row = await subspecialityRepository.findById(id, { populateCustom: true });
    if (!row) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
    }
    return row;
  }

  async updateSubspeciality(id, updateData) {
    const exists = await subspecialityRepository.exists(id);
    if (!exists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
    }

    const payload = {};
    if (updateData.name !== undefined) {
      const trimmed = updateData.name.trim();
      const taken = await subspecialityRepository.existsByName(trimmed, id);
      if (taken) {
        throw new ApiError(httpStatus.CONFLICT, 'Subspeciality with this name already exists');
      }
      payload.name = trimmed;
    }
    if (updateData.description !== undefined) {
      payload.description = updateData.description.trim();
    }

    if (updateData.customSubspecialities !== undefined) {
      const existing = await subspecialityRepository.findById(id, { populateCustom: false });
      const existingIds = Array.isArray(existing?.customSubspecialities)
        ? existing.customSubspecialities.map((x) => String(x))
        : [];

      const raw = updateData.customSubspecialities;
      if (raw === null || (Array.isArray(raw) && raw.length === 0)) {
        payload.customSubspecialities = [];
        for (const cid of existingIds) {
          await CustomSubspeciality.findByIdAndDelete(cid);
        }
      } else if (Array.isArray(raw)) {
        const newIds = await resolveCustomSubspecialityItems(raw);
        const toDelete = idsToRemoveAfterReplace(existingIds, newIds);
        for (const cid of toDelete) {
          await CustomSubspeciality.findByIdAndDelete(cid);
        }
        payload.customSubspecialities = newIds;
      }
    }

    if (Object.keys(payload).length > 0) {
      const updated = await subspecialityRepository.updateById(id, payload);
      if (!updated) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
      }
    }
    return await subspecialityRepository.findById(id, { populateCustom: true });
  }

  async deleteSubspeciality(id) {
    const exists = await subspecialityRepository.exists(id);
    if (!exists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
    }
    const row = await subspecialityRepository.findById(id, { populateCustom: false });
    const customIds = Array.isArray(row?.customSubspecialities)
      ? row.customSubspecialities.map((x) => String(x))
      : [];
    await subspecialityRepository.deleteById(id);
    for (const cid of customIds) {
      await CustomSubspeciality.findByIdAndDelete(cid);
    }
  }
}

export default new SubspecialityService();
