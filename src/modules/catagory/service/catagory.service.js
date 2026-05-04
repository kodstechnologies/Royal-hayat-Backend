import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import catagoryRepository from '../repository/catagory.repository.js';

class CatagoryService {
  async createCatagory(data) {
    const nameTaken = await catagoryRepository.existsByName(data.name.trim());
    if (nameTaken) {
      throw new ApiError(httpStatus.CONFLICT, 'Category with this name already exists');
    }
    return await catagoryRepository.create({
      name: data.name.trim(),
    });
  }

  async getAllCatagories(filters = {}) {
    return await catagoryRepository.findAll(filters);
  }

  async getCatagoriesWithDepartmentsAndDoctors() {
    return await catagoryRepository.findAllWithDepartmentsAndDoctors();
  }

  async getCatagoryById(id) {
    const catagory = await catagoryRepository.findById(id);
    if (!catagory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    return catagory;
  }

  async updateCatagory(id, updateData) {
    const exists = await catagoryRepository.exists(id);
    if (!exists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }

    const trimmed = updateData.name.trim();
    const taken = await catagoryRepository.existsByName(trimmed, id);
    if (taken) {
      throw new ApiError(httpStatus.CONFLICT, 'Category with this name already exists');
    }
    const payload = { name: trimmed };

    const updated = await catagoryRepository.updateById(id, payload);
    if (!updated) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    return updated;
  }

  async deleteCatagory(id) {
    const exists = await catagoryRepository.exists(id);
    if (!exists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    await catagoryRepository.deleteById(id);
  }
}

export default new CatagoryService();
