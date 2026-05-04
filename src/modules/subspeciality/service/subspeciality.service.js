import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import subspecialityRepository from '../repository/subspeciality.repository.js';

class SubspecialityService {
  async createSubspeciality(data) {
    const nameTaken = await subspecialityRepository.existsByName(data.name.trim());
    if (nameTaken) {
      throw new ApiError(httpStatus.CONFLICT, 'Subspeciality with this name already exists');
    }
    return await subspecialityRepository.create({
      name: data.name.trim(),
      description: data.description.trim(),
    });
  }

  async getAllSubspecialities(filters = {}) {
    return await subspecialityRepository.findAll(filters);
  }

  async getSubspecialityById(id) {
    const row = await subspecialityRepository.findById(id);
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

    const updated = await subspecialityRepository.updateById(id, payload);
    if (!updated) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
    }
    return updated;
  }

  async deleteSubspeciality(id) {
    const exists = await subspecialityRepository.exists(id);
    if (!exists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
    }
    await subspecialityRepository.deleteById(id);
  }
}

export default new SubspecialityService();
